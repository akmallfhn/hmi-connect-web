"use client";

import {
  CalendarDays,
  ImagePlus,
  Link2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import type { EventContactInput, EventDetail } from "@/apis/events";
import type { ComposerAuthorEntity } from "../forms/CreateFeedForms";
import { createEvent, updateEvent } from "@/lib/actions";
import { officialEntityEventsHref } from "@/lib/access";
import {
  addHoursToDateTimeLocal,
  dateTimeLocalToIso,
  eventMapEmbedUrl,
  safeExternalUrl,
  toDateTimeLocal,
} from "@/lib/event-ui";
import { EVENT_IMAGE_ACCEPT, uploadEventImage } from "@/lib/event-image";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import PageMargin from "../common/PageMargin";
import Input from "../fields/Input";
import TextArea from "../fields/TextArea";
import AlertConfirmation from "../modals/AlertConfirmation";
import OfficialPageShell from "../official/OfficialPageShell";
import LogoHmi from "../svg/LogoHmi";

const MAX_GALLERY_IMAGES = 20;
const DEFAULT_DURATION_HOURS = 2;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_ERROR = "Gunakan tautan lengkap yang diawali http:// atau https://.";

type EditableContact = EventContactInput & { key: string };
type EditableImage = { mediaId: string; url: string };
type FieldErrors = Partial<
  Record<"title" | "startDate" | "endDate" | "locationUrl" | "registrationUrl", string>
>;

// Field ids in the order they appear, so a failed submit can focus the first invalid one.
const FIELD_INPUT_ID: Record<keyof FieldErrors, string> = {
  title: "event-title",
  startDate: "event-start-date",
  endDate: "event-end-date",
  locationUrl: "event-location-url",
  registrationUrl: "event-registration-url",
};

function newKey() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function urlError(value: string) {
  return value.trim() && !safeExternalUrl(value) ? URL_ERROR : undefined;
}

function contactError(contact: EditableContact) {
  if (!contact.name.trim()) return "Isi nama atau peran narahubung.";
  const phone = contact.phone_number?.trim();
  const email = contact.email?.trim();
  if (!phone && !email) return "Isi nomor WhatsApp atau email.";
  if (email && !EMAIL_PATTERN.test(email)) return "Format email belum benar.";
  return undefined;
}

function FormSection({
  icon,
  title,
  description,
  action,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-foreground">
            {icon}
          </span>
          <div className="min-w-0">
            <h2 className="font-stack-sans-headline font-medium text-heading">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function OfficialEventFormPage({
  entity,
  event,
}: {
  entity: ComposerAuthorEntity;
  event?: EventDetail;
}) {
  const router = useRouter();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const baseHref = officialEntityEventsHref(entity.type, entity.id);
  const isEditing = Boolean(event);

  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [startDate, setStartDate] = useState(toDateTimeLocal(event?.start_date));
  const [endDate, setEndDate] = useState(toDateTimeLocal(event?.end_date));
  const [locationName, setLocationName] = useState(event?.location_name ?? "");
  const [locationUrl, setLocationUrl] = useState(event?.location_url ?? "");
  const [registrationUrl, setRegistrationUrl] = useState(event?.registration_url ?? "");
  // Updated on blur, so the map doesn't reload on every keystroke.
  const [mapQuery, setMapQuery] = useState(event?.location_name ?? "");
  const [thumbnail, setThumbnail] = useState<EditableImage | null>(
    event?.thumbnail_media_id && event.thumbnail_url
      ? { mediaId: event.thumbnail_media_id, url: event.thumbnail_url }
      : null,
  );
  const [gallery, setGallery] = useState<EditableImage[]>(
    event?.images.flatMap((image) =>
      image.image_url ? [{ mediaId: image.media_id, url: image.image_url }] : [],
    ) ?? [],
  );
  const [contacts, setContacts] = useState<EditableContact[]>(
    event?.contacts.map((contact) => ({
      key: contact.id,
      name: contact.name,
      phone_number: contact.phone_number ?? "",
      email: contact.email ?? "",
    })) ?? [],
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [saving, setSaving] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const busy = saving || uploadingThumbnail || uploadingGallery;
  const mapPreviewUrl = eventMapEmbedUrl(locationUrl, mapQuery);

  const snapshot = JSON.stringify({
    title,
    description,
    startDate,
    endDate,
    locationName,
    locationUrl,
    registrationUrl,
    thumbnail: thumbnail?.mediaId,
    gallery: gallery.map((image) => image.mediaId),
    contacts: contacts.map(({ name, phone_number, email }) => [name, phone_number, email]),
  });
  const [initialSnapshot] = useState(snapshot);
  const isDirty = snapshot !== initialSnapshot;
  const [initialThumbnailId] = useState(thumbnail?.mediaId);
  const [initialGalleryIds] = useState(JSON.stringify(gallery.map((image) => image.mediaId)));

  function setFieldError(field: keyof FieldErrors, message?: string) {
    setErrors((current) => ({ ...current, [field]: message }));
  }

  function handleStartChange(value: string) {
    setStartDate(value);
    setFieldError("startDate");
    setFieldError("endDate");
    // Saves a second date pick: the end follows the start until the two are deliberately apart.
    if (value && (!endDate || new Date(endDate) <= new Date(value))) {
      setEndDate(addHoursToDateTimeLocal(value, DEFAULT_DURATION_HOURS));
    }
  }

  async function handleThumbnail(changeEvent: ChangeEvent<HTMLInputElement>) {
    const file = changeEvent.target.files?.[0];
    changeEvent.target.value = "";
    if (!file) return;
    setUploadingThumbnail(true);
    const result = await uploadEventImage(file);
    setUploadingThumbnail(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    setThumbnail({ mediaId: result.assetId, url: result.url });
  }

  async function handleGallery(changeEvent: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(changeEvent.target.files ?? []);
    changeEvent.target.value = "";
    if (files.length === 0) return;
    const slots = MAX_GALLERY_IMAGES - gallery.length;
    const selected = files.slice(0, slots);
    if (selected.length < files.length) {
      toast.info(`Galeri maksimal ${MAX_GALLERY_IMAGES} foto, jadi hanya ${slots} yang ditambahkan.`);
    }

    setUploadingGallery(true);
    // One at a time so several large photos don't spike the main thread together.
    for (const file of selected) {
      const result = await uploadEventImage(file);
      if (result.ok) {
        setGallery((current) => [...current, { mediaId: result.assetId, url: result.url }]);
      } else {
        toast.error(`${file.name}: ${result.message}`);
      }
    }
    setUploadingGallery(false);
  }

  function updateContact(contactKey: string, patch: Partial<EditableContact>) {
    setContacts((current) =>
      current.map((contact) =>
        contact.key === contactKey ? { ...contact, ...patch } : contact,
      ),
    );
    setContactErrors((current) => ({ ...current, [contactKey]: "" }));
  }

  function validate() {
    const nextErrors: FieldErrors = {};
    if (!title.trim()) nextErrors.title = "Judul event wajib diisi.";
    if (!startDate) nextErrors.startDate = "Pilih waktu mulai.";
    if (!endDate) nextErrors.endDate = "Pilih waktu selesai.";
    else if (startDate && new Date(endDate) <= new Date(startDate)) {
      nextErrors.endDate = "Waktu selesai harus setelah waktu mulai.";
    }
    nextErrors.locationUrl = urlError(locationUrl);
    nextErrors.registrationUrl = urlError(registrationUrl);

    const nextContactErrors: Record<string, string> = {};
    for (const contact of contacts) {
      const message = contactError(contact);
      if (message) nextContactErrors[contact.key] = message;
    }

    setErrors(nextErrors);
    setContactErrors(nextContactErrors);

    const firstField = (Object.keys(FIELD_INPUT_ID) as (keyof FieldErrors)[]).find(
      (field) => nextErrors[field],
    );
    const firstContact = contacts.find((contact) => nextContactErrors[contact.key]);
    const firstInputId = firstField
      ? FIELD_INPUT_ID[firstField]
      : firstContact
        ? `event-contact-name-${firstContact.key}`
        : null;
    if (firstInputId) document.getElementById(firstInputId)?.focus();
    return !firstInputId;
  }

  async function handleSubmit(submitEvent: FormEvent) {
    submitEvent.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const common = {
        title: title.trim(),
        description: description.trim(),
        start_date: dateTimeLocalToIso(startDate),
        end_date: dateTimeLocalToIso(endDate),
        location_name: locationName.trim(),
        location_url: locationUrl.trim(),
        registration_url: registrationUrl.trim(),
        contacts: contacts.map((contact) => ({
          name: contact.name.trim(),
          ...(contact.phone_number?.trim() ? { phone_number: contact.phone_number.trim() } : {}),
          ...(contact.email?.trim() ? { email: contact.email.trim() } : {}),
        })),
      };
      const galleryIds = gallery.map((image) => image.mediaId);
      const result = event
        ? await updateEvent({
            id: event.id,
            ...common,
            ...(thumbnail?.mediaId !== initialThumbnailId
              ? { thumbnail_media_id: thumbnail?.mediaId ?? "" }
              : {}),
            ...(JSON.stringify(galleryIds) !== initialGalleryIds
              ? { image_media_ids: galleryIds }
              : {}),
          })
        : await createEvent({
            ...common,
            entity_type: entity.type,
            entity_id: entity.id,
            ...(thumbnail ? { thumbnail_media_id: thumbnail.mediaId } : {}),
            ...(galleryIds.length > 0 ? { image_media_ids: galleryIds } : {}),
          });

      if (!isSuccessStatus(result.status) || !result.data) {
        toast.error(
          result.status === "FORBIDDEN"
            ? "Akunmu tidak lagi punya akses untuk mengelola event ini."
            : "Event belum berhasil disimpan. Periksa isian lalu coba lagi.",
        );
        setSaving(false);
        return;
      }
      toast.success(isEditing ? "Perubahan event tersimpan." : "Event berhasil diterbitkan.");
      router.push(`${baseHref}/${result.data.id}`);
      router.refresh();
    } catch (error) {
      console.error("[OfficialEventFormPage] save threw:", error);
      toast.error("Event belum berhasil disimpan. Coba lagi.");
      setSaving(false);
    }
  }

  return (
    <OfficialPageShell entity={entity} compactGreeting>
      <PageMargin className="pt-4 lg:pt-6">
        <main className="mx-auto max-w-5xl pb-6 lg:pb-10">
          <div className="mb-5">
            <h1 className="font-stack-sans-headline text-xl font-medium text-heading sm:text-2xl">
              {isEditing ? "Edit event" : "Buat event baru"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEditing
                ? "Perubahan langsung terlihat oleh kader yang membuka event ini."
                : "Event akan langsung tampil di menu Event setelah diterbitkan."}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"
          >
            <div className="flex min-w-0 flex-col gap-5">
              <FormSection
                icon={<CalendarDays className="size-4.5" />}
                title="Informasi utama"
                description="Judul, waktu, dan cerita event."
              >
                <div className="flex flex-col gap-4">
                  <Input
                    inputId="event-title"
                    label="Judul event"
                    placeholder="Contoh: Milad HMI ke-80 dan Silaturahmi Kader"
                    value={title}
                    onChange={(changeEvent) => {
                      setTitle(changeEvent.target.value);
                      setFieldError("title");
                    }}
                    characterLength={120}
                    errorMessage={errors.title}
                    required
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      inputId="event-start-date"
                      type="datetime-local"
                      label="Mulai (WIB)"
                      value={startDate}
                      onChange={(changeEvent) => handleStartChange(changeEvent.target.value)}
                      errorMessage={errors.startDate}
                      required
                    />
                    <Input
                      inputId="event-end-date"
                      type="datetime-local"
                      label="Selesai (WIB)"
                      min={startDate || undefined}
                      value={endDate}
                      onChange={(changeEvent) => {
                        setEndDate(changeEvent.target.value);
                        setFieldError("endDate");
                      }}
                      errorMessage={errors.endDate}
                      required
                    />
                  </div>
                  <TextArea
                    textAreaId="event-description"
                    label="Deskripsi"
                    placeholder="Tujuan, rangkaian agenda, siapa yang bisa ikut, dan hal yang perlu disiapkan."
                    rows={7}
                    value={description}
                    onChange={(changeEvent) => setDescription(changeEvent.target.value)}
                  />
                </div>
              </FormSection>

              <FormSection
                icon={<MapPin className="size-4.5" />}
                title="Lokasi dan pendaftaran"
                description="Bantu peserta menemukan tempat dan langkah berikutnya."
              >
                <div className="flex flex-col gap-4">
                  <div>
                    <Input
                      inputId="event-location"
                      label="Nama dan alamat lokasi"
                      placeholder="Contoh: Monumen Nasional, Gambir, Jakarta Pusat"
                      value={locationName}
                      onChange={(changeEvent) => setLocationName(changeEvent.target.value)}
                      onBlur={() => setMapQuery(locationName)}
                      icon={<MapPin className="size-4" />}
                    />
                    <p className="mt-1 pl-1 text-sm text-muted-foreground">
                      Tulis nama tempat, lalu alamatnya setelah koma. Peta dicari dari isian ini.
                    </p>
                    {mapPreviewUrl && (
                      <div className="mt-3 aspect-[16/7] overflow-hidden rounded-xl border border-border bg-surface-muted">
                        <iframe
                          src={mapPreviewUrl}
                          title="Pratinjau peta lokasi"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          className="size-full border-0"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <Input
                      inputId="event-location-url"
                      type="url"
                      label="Tautan lokasi"
                      placeholder="https://maps.app.goo.gl/..."
                      value={locationUrl}
                      onChange={(changeEvent) => {
                        setLocationUrl(changeEvent.target.value);
                        setFieldError("locationUrl");
                      }}
                      onBlur={() => setFieldError("locationUrl", urlError(locationUrl))}
                      errorMessage={errors.locationUrl}
                      icon={<Link2 className="size-4" />}
                    />
                    <p className="mt-1 pl-1 text-sm text-muted-foreground">
                      Opsional, untuk tombol petunjuk arah. Tautan embed Google Maps menggantikan
                      peta di atas bila pinnya kurang tepat.
                    </p>
                  </div>
                  <div>
                    <Input
                      inputId="event-registration-url"
                      type="url"
                      label="Formulir pendaftaran"
                      placeholder="https://forms.google.com/..."
                      value={registrationUrl}
                      onChange={(changeEvent) => {
                        setRegistrationUrl(changeEvent.target.value);
                        setFieldError("registrationUrl");
                      }}
                      onBlur={() => setFieldError("registrationUrl", urlError(registrationUrl))}
                      errorMessage={errors.registrationUrl}
                      icon={<Link2 className="size-4" />}
                    />
                    <p className="mt-1 pl-1 text-sm text-muted-foreground">
                      Opsional. Tombol &ldquo;Saya mau ikut&rdquo; tetap tersedia di HMI Connect.
                    </p>
                  </div>
                </div>
              </FormSection>

              <FormSection
                icon={<UserRound className="size-4.5" />}
                title="Narahubung"
                description="Opsional, untuk peserta yang ingin bertanya."
                action={
                  contacts.length > 0 ? (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setContacts((current) => [
                          ...current,
                          { key: newKey(), name: "", phone_number: "", email: "" },
                        ])
                      }
                    >
                      <Plus className="size-4" />
                      Tambah
                    </Button>
                  ) : undefined
                }
              >
                {contacts.length === 0 ? (
                  <Button
                    variant="outline"
                    onClick={() =>
                      setContacts([{ key: newKey(), name: "", phone_number: "", email: "" }])
                    }
                    className="w-full"
                  >
                    <Plus className="size-4" />
                    Tambahkan narahubung
                  </Button>
                ) : (
                  <div className="flex flex-col gap-4">
                    {contacts.map((contact, index) => (
                      <fieldset
                        key={contact.key}
                        className="rounded-xl border border-border p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <legend className="text-sm font-semibold text-muted-foreground">
                            Narahubung {index + 1}
                          </legend>
                          <Button
                            variant="destructive"
                            size="iconSm"
                            onClick={() =>
                              setContacts((current) =>
                                current.filter((item) => item.key !== contact.key),
                              )
                            }
                            aria-label={`Hapus narahubung ${index + 1}`}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <Input
                              inputId={`event-contact-name-${contact.key}`}
                              label="Nama atau peran"
                              placeholder="Contoh: Ketua Panitia"
                              value={contact.name}
                              onChange={(changeEvent) =>
                                updateContact(contact.key, { name: changeEvent.target.value })
                              }
                              icon={<UserRound className="size-4" />}
                              required
                            />
                          </div>
                          <Input
                            inputId={`event-contact-phone-${contact.key}`}
                            type="tel"
                            autoComplete="tel"
                            label="Nomor WhatsApp"
                            placeholder="08xxxxxxxxxx"
                            value={contact.phone_number}
                            onChange={(changeEvent) =>
                              updateContact(contact.key, {
                                phone_number: changeEvent.target.value,
                              })
                            }
                            icon={<Phone className="size-4" />}
                          />
                          <Input
                            inputId={`event-contact-email-${contact.key}`}
                            type="email"
                            autoComplete="email"
                            label="Email"
                            placeholder="panitia@contoh.id"
                            value={contact.email}
                            onChange={(changeEvent) =>
                              updateContact(contact.key, { email: changeEvent.target.value })
                            }
                            icon={<Mail className="size-4" />}
                          />
                        </div>
                        {contactErrors[contact.key] && (
                          <p role="alert" className="mt-2 pl-1 text-xs text-destructive-foreground">
                            {contactErrors[contact.key]}
                          </p>
                        )}
                      </fieldset>
                    ))}
                  </div>
                )}
              </FormSection>
            </div>

            <aside className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-6">
              <section className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
                <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-muted">
                  {entity.imageUrl ? (
                    <Image
                      src={entity.imageUrl}
                      alt=""
                      width={40}
                      height={40}
                      className="size-full object-cover"
                    />
                  ) : (
                    <LogoHmi className="size-5" aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Diterbitkan atas nama</p>
                  <p className="truncate text-sm font-semibold text-heading">{entity.name}</p>
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-surface p-5">
                <h2 className="font-stack-sans-headline font-medium text-heading">Thumbnail</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Rasio 16:9 disarankan. JPG, PNG, atau WEBP.
                </p>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept={EVENT_IMAGE_ACCEPT}
                  className="hidden"
                  onChange={handleThumbnail}
                />
                <div className="relative mt-3 flex aspect-[16/9] w-full overflow-hidden rounded-xl border border-dashed border-border-strong bg-surface-muted">
                  {thumbnail ? (
                    <Image
                      src={thumbnail.url}
                      alt="Pratinjau thumbnail"
                      fill
                      sizes="280px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="m-auto text-sm text-muted-foreground">
                      Belum ada gambar
                    </span>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => thumbnailInputRef.current?.click()}
                    disabled={busy}
                    className="min-w-0 flex-1"
                  >
                    {uploadingThumbnail ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}
                    {uploadingThumbnail ? "Mengunggah..." : thumbnail ? "Ganti" : "Pilih gambar"}
                  </Button>
                  {thumbnail && (
                    <Button
                      variant="destructive"
                      onClick={() => setThumbnail(null)}
                      disabled={busy}
                    >
                      Hapus
                    </Button>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-surface p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-stack-sans-headline font-medium text-heading">Galeri</h2>
                  <p className="text-sm tabular-nums text-muted-foreground">
                    {gallery.length}/{MAX_GALLERY_IMAGES}
                  </p>
                </div>
                <input
                  ref={galleryInputRef}
                  type="file"
                  multiple
                  accept={EVENT_IMAGE_ACCEPT}
                  className="hidden"
                  onChange={handleGallery}
                />
                {gallery.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {gallery.map((image, index) => (
                      <div
                        key={image.mediaId}
                        className="relative aspect-square overflow-hidden rounded-lg bg-surface-muted"
                      >
                        <Image
                          src={image.url}
                          alt={`Foto galeri ${index + 1}`}
                          fill
                          sizes="90px"
                          className="object-cover"
                        />
                        <span className="absolute right-1 top-1">
                          <Button
                            variant="destructive"
                            size="iconSm"
                            onClick={() =>
                              setGallery((current) =>
                                current.filter((item) => item.mediaId !== image.mediaId),
                              )
                            }
                            aria-label={`Hapus foto ${index + 1}`}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={busy || gallery.length >= MAX_GALLERY_IMAGES}
                  className="mt-3 w-full"
                >
                  {uploadingGallery ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ImagePlus className="size-4" />
                  )}
                  {uploadingGallery ? "Mengunggah foto..." : "Tambah foto"}
                </Button>
              </section>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => (isDirty ? setDiscardOpen(true) : router.back())}
                  disabled={saving}
                  className="min-w-0 flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={busy}
                  className="min-w-0 flex-1"
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                  {saving ? "Menyimpan..." : isEditing ? "Simpan" : "Terbitkan"}
                </Button>
              </div>
            </aside>
          </form>
        </main>
      </PageMargin>

      <AlertConfirmation
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        onConfirm={() => router.back()}
        title="Buang perubahan?"
        message="Isian yang belum disimpan akan hilang."
        confirmLabel="Buang"
        cancelLabel="Lanjut mengisi"
      />
    </OfficialPageShell>
  );
}
