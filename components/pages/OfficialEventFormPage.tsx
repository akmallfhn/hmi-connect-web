"use client";

import {
  IconExternalLink,
  IconLink,
  IconLoader2,
  IconMapPin,
  IconPhotoPlus,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUpload,
  IconUser,
} from "@tabler/icons-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { toast } from "sonner";
import type { EventCategory, EventDetail } from "@/apis/events";
import type { ComposerAuthorEntity } from "../forms/CreateFeedForms";
import { createEvent, deleteEvent, saveEventResources, updateEvent } from "@/lib/actions";
import { MANAGE_EVENTS_HREF } from "@/lib/access";
import {
  addHoursToDateTimeLocal,
  dateTimeLocalToIso,
  eventMapEmbedUrl,
  googleMapsSearchUrl,
  safeExternalUrl,
  toDateTimeLocal,
} from "@/lib/event-ui";
import { EVENT_IMAGE_ACCEPT, uploadEventImage } from "@/lib/event-image";
import { isSuccessStatus } from "@/lib/types";
import Button from "../buttons/Button";
import Avatar from "../common/Avatar";
import PageMargin from "../common/PageMargin";
import EventLinkButton from "../events/EventLinkButton";
import EventContactModal, { type EventContactSelection } from "../forms/EventContactModal";
import FieldHelpTooltip from "../fields/FieldHelpTooltip";
import Input from "../fields/Input";
import Select from "../fields/Select";
import TextArea from "../fields/TextArea";
import AlertConfirmation from "../modals/AlertConfirmation";
import OfficialPageShell from "../official/OfficialPageShell";
import LogoHmi from "../svg/LogoHmi";

const MAX_GALLERY_IMAGES = 20;
const DEFAULT_DURATION_HOURS = 2;
const URL_ERROR = "Gunakan tautan lengkap yang diawali http:// atau https://.";

type EditableContact = {
  key: string;
  id?: string;
  user_id?: string;
  name: string;
  phone_number: string;
  avatar?: string;
};
type EditableImage = { mediaId: string; url: string };
type FieldErrors = Partial<
  Record<"title" | "category" | "startDate" | "endDate" | "locationUrl" | "linkUrl", string>
>;

// Field ids in the order they appear, so a failed submit can focus the first invalid one.
const FIELD_INPUT_ID: Record<keyof FieldErrors, string> = {
  title: "event-title",
  category: "event-category",
  startDate: "event-start-date",
  endDate: "event-end-date",
  locationUrl: "event-location-url",
  linkUrl: "event-link-url",
};

function newKey() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function urlError(value: string) {
  return value.trim() && !safeExternalUrl(value) ? URL_ERROR : undefined;
}

function FormSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border border-x-0 border-border bg-surface p-5 lg:rounded-2xl lg:border-x">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-stack-sans-headline text-sm font-medium text-heading xl:text-[15px]">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function OfficialEventFormPage({
  entity,
  event,
  categories,
}: {
  entity: ComposerAuthorEntity;
  event?: EventDetail;
  categories: EventCategory[];
}) {
  const router = useRouter();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const baseHref = MANAGE_EVENTS_HREF;
  const isEditing = Boolean(event);

  const [title, setTitle] = useState(event?.title ?? "");
  const [categoryId, setCategoryId] = useState<number | null>(event?.category_id ?? null);
  const [description, setDescription] = useState(event?.description ?? "");
  const [startDate, setStartDate] = useState(toDateTimeLocal(event?.start_date));
  const [endDate, setEndDate] = useState(toDateTimeLocal(event?.end_date));
  const [locationName, setLocationName] = useState(event?.location_name ?? "");
  const [locationUrl, setLocationUrl] = useState(event?.location_url ?? "");
  const [linkUrl, setLinkUrl] = useState(event?.link_url ?? "");
  // Search explicitly so the embedded map does not reload on every keystroke.
  const [mapQuery, setMapQuery] = useState(event?.location_name?.trim() ?? "");
  const [mapSearchActive, setMapSearchActive] = useState(false);
  const [thumbnail, setThumbnail] = useState<EditableImage | null>(
    event?.thumbnail_media_id
      ? { mediaId: event.thumbnail_media_id, url: event.thumbnail_url ?? "" }
      : null,
  );
  const [gallery, setGallery] = useState<EditableImage[]>(
    event?.images.map((image) => ({ mediaId: image.media_id, url: image.image_url ?? "" })) ?? [],
  );
  const [contacts, setContacts] = useState<EditableContact[]>(
    event?.contacts.map((contact) => ({
      key: contact.id,
      name: contact.name,
      phone_number: contact.phone_number ?? "",
      user_id: contact.user_id,
      avatar: contact.avatar,
      id: contact.id,
    })) ?? [],
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [contactModalKey, setContactModalKey] = useState<string | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [saving, setSaving] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const busy = saving || uploadingThumbnail || uploadingGallery || deleting;
  const mapPreviewUrl = locationName.trim() === mapQuery
    ? eventMapEmbedUrl(mapSearchActive ? null : locationUrl, mapQuery)
    : null;

  const snapshot = JSON.stringify({
    title,
    categoryId,
    description,
    startDate,
    endDate,
    locationName,
    locationUrl,
    linkUrl,
    thumbnail: thumbnail?.mediaId,
    gallery: gallery.map((image) => image.mediaId),
    contacts: contacts.map(({ user_id, name, phone_number }) => [user_id, name, phone_number]),
  });
  const [initialSnapshot] = useState(snapshot);
  const isDirty = snapshot !== initialSnapshot;

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
      toast.info(`Foto lainnya maksimal ${MAX_GALLERY_IMAGES} foto, jadi hanya ${slots} yang ditambahkan.`);
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

  function saveContact(selection: EventContactSelection) {
    const contact = {
      user_id: selection.user_id,
      name: selection.displayName,
      phone_number: selection.displayPhone,
      avatar: selection.avatar,
    };
    setContacts((current) => contactModalKey === "new"
      ? [...current, { key: newKey(), ...contact }]
      : current.map((item) => item.key === contactModalKey ? { ...item, ...contact } : item));
    setContactModalKey(null);
  }

  function validate() {
    const nextErrors: FieldErrors = {};
    if (!title.trim()) nextErrors.title = "Judul event wajib diisi.";
    if (!categoryId || !categories.some((category) => category.id === categoryId)) {
      nextErrors.category = "Pilih kategori event.";
    }
    if (!startDate) nextErrors.startDate = "Pilih waktu mulai.";
    if (!endDate) nextErrors.endDate = "Pilih waktu selesai.";
    else if (startDate && new Date(endDate) <= new Date(startDate)) {
      nextErrors.endDate = "Waktu selesai harus setelah waktu mulai.";
    }
    nextErrors.locationUrl = urlError(locationUrl);
    nextErrors.linkUrl = urlError(linkUrl);

    setErrors(nextErrors);

    const firstField = (Object.keys(FIELD_INPUT_ID) as (keyof FieldErrors)[]).find(
      (field) => nextErrors[field],
    );
    const firstInputId = firstField ? FIELD_INPUT_ID[firstField] : null;
    if (firstInputId) document.getElementById(firstInputId)?.focus();
    return !firstInputId;
  }

  async function handleSubmit(submitEvent: FormEvent) {
    submitEvent.preventDefault();
    if (busy) return;
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
        link_url: linkUrl.trim(),
        category_id: categoryId!,
      };
      const result = event
        ? await updateEvent({
            id: event.id,
            ...common,
          })
        : await createEvent({
            ...common,
            entity_type: entity.type,
            entity_id: entity.id,
          });

      if (!isSuccessStatus(result.status) || !result.data) {
        setSaving(false);
        toast.error(
          result.status === "FORBIDDEN"
            ? "Akunmu tidak lagi punya akses untuk mengelola event ini."
            : "Event belum berhasil disimpan. Periksa isian lalu coba lagi.",
        );
        return;
      }
      const resources = await saveEventResources(result.data.id, {
        contacts: contacts.map((contact) => ({
          ...(contact.id ? { id: contact.id } : {}),
          ...(contact.user_id
            ? { user_id: contact.user_id }
            : { name: contact.name.trim(), phone_number: contact.phone_number.trim() }),
        })),
        coverMediaId: thumbnail?.mediaId ?? null,
        galleryMediaIds: gallery.map((image) => image.mediaId),
      });
      if (!resources.ok) {
        flushSync(() => setSaving(false));
        toast.error(`Event tersimpan, tetapi kontak atau gambar belum lengkap. ${resources.message ?? "Buka edit untuk mencoba lagi."}`);
        router.push(`${baseHref}/${result.data.id}`);
        return;
      }
      flushSync(() => setSaving(false));
      router.push(`${baseHref}?saved=${isEditing ? "updated" : "created"}`);
    } catch (error) {
      console.error("[OfficialEventFormPage] save threw:", error);
      setSaving(false);
      toast.error("Event belum berhasil disimpan. Coba lagi.");
    }
  }

  async function handleDelete() {
    if (!event) return;
    setDeleting(true);
    try {
      const result = await deleteEvent(event.id);
      if (!isSuccessStatus(result.status)) throw new Error(result.message);
      setDeleting(false);
      toast.success("Event berhasil dihapus.");
      router.push(baseHref);
    } catch {
      setDeleting(false);
      toast.error("Event belum berhasil dihapus. Coba lagi.");
    }
  }

  return (
    <OfficialPageShell entity={entity} compactGreeting>
      <PageMargin noMobilePadding className="pb-6 pt-4 lg:py-6">
        <main className="pb-6 lg:pb-10">
          <div className="mb-4 flex min-h-11 items-center justify-between gap-3 px-4 lg:mb-6 lg:px-0">
            <h1 className="font-stack-sans-headline text-xl font-medium text-heading sm:text-2xl">
              {isEditing ? "Edit event" : "Buat event baru"}
            </h1>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="outline" onClick={() => (isDirty ? setDiscardOpen(true) : router.push(baseHref))} disabled={saving}>
                Batal
              </Button>
              <Button type="submit" form="official-event-form" disabled={busy}>
                {saving && <IconLoader2 className="size-4 animate-spin" stroke={2} />}
                {saving ? "Menyimpan..." : isEditing ? "Simpan" : "Terbitkan"}
              </Button>
            </div>
          </div>

          <form
            id="official-event-form"
            onSubmit={handleSubmit}
            noValidate
            className="grid items-start gap-1.5 lg:grid-cols-[minmax(0,768px)_320px] lg:gap-6"
          >
            <div className="flex min-w-0 flex-col gap-1.5 lg:gap-4">
              <FormSection
                title="Informasi utama"
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
                  <div>
                    <Select
                      selectId="event-category"
                      label="Kategori event"
                      placeholder="Pilih kategori"
                      value={categoryId}
                      onChange={(value) => {
                        setCategoryId(typeof value === "number" ? value : null);
                        setFieldError("category");
                      }}
                      options={categories.map((category) => ({ label: category.name, value: category.id }))}
                      required
                    />
                    {errors.category && <p role="alert" className="mt-1 pl-1 text-xs text-destructive-foreground">{errors.category}</p>}
                    {categories.length === 0 && <p className="mt-1 pl-1 text-sm text-muted-foreground">Kategori event belum tersedia. Coba muat ulang halaman.</p>}
                  </div>
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
                title="Lokasi dan tautan"
              >
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="flex items-end gap-2">
                      <div className="min-w-0 flex-1">
                        <Input
                          inputId="event-location"
                          label="Nama dan alamat lokasi"
                          placeholder="Contoh: Monumen Nasional, Gambir, Jakarta Pusat"
                          value={locationName}
                          onChange={(changeEvent) => setLocationName(changeEvent.target.value)}
                          icon={<IconMapPin className="size-4" stroke={2} />}
                          trailing={<FieldHelpTooltip text="Tulis nama tempat, lalu alamatnya setelah koma. Tekan Cari untuk menampilkan pratinjau peta." />}
                        />
                      </div>
                      <Button variant="primary" onClick={() => { setMapQuery(locationName.trim()); setMapSearchActive(true); }} disabled={!locationName.trim()} className="h-[42px]">
                        <IconSearch className="size-4" stroke={2} /> Cari
                      </Button>
                    </div>
                    {mapPreviewUrl && (
                      <div className="mt-3">
                        <div className="aspect-[16/7] overflow-hidden rounded-xl border border-border bg-surface-muted">
                          <iframe
                            src={mapPreviewUrl}
                            title="Pratinjau peta lokasi"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="size-full border-0"
                          />
                        </div>
                        {mapQuery && (
                          <EventLinkButton href={googleMapsSearchUrl(mapQuery)} newTab variant="ghost" size="sm" className="mt-2">
                            Buka di Google Maps <IconExternalLink className="size-4" stroke={2} />
                          </EventLinkButton>
                        )}
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
                        setMapSearchActive(false);
                        setFieldError("locationUrl");
                      }}
                      onBlur={() => setFieldError("locationUrl", urlError(locationUrl))}
                      errorMessage={errors.locationUrl}
                      icon={<IconLink className="size-4" stroke={2} />}
                      trailing={<FieldHelpTooltip text="Opsional. Buka hasil pencarian di Google Maps, pilih tempat yang tepat, lalu tempel tautan Bagikan di sini. Tautan embed juga dapat dipakai untuk mengatur pratinjau." />}
                    />
                  </div>
                  <div>
                    <Input
                      inputId="event-link-url"
                      type="url"
                      label="Tautan event"
                      placeholder="https://..."
                      value={linkUrl}
                      onChange={(changeEvent) => {
                        setLinkUrl(changeEvent.target.value);
                        setFieldError("linkUrl");
                      }}
                      onBlur={() => setFieldError("linkUrl", urlError(linkUrl))}
                      errorMessage={errors.linkUrl}
                      icon={<IconLink className="size-4" stroke={2} />}
                      trailing={<FieldHelpTooltip text="Opsional. Bisa menuju formulir, situs, atau informasi event dari penyelenggara." />}
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="Narahubung"
                action={
                  contacts.length > 0 ? (
                    <Button variant="outline" size="sm" onClick={() => setContactModalKey("new")}>
                      <IconPlus className="size-4" stroke={2} />
                      Tambah
                    </Button>
                  ) : undefined
                }
              >
                {contacts.length === 0 ? (
                  <Button
                    variant="outline"
                    onClick={() => setContactModalKey("new")}
                    className="w-full"
                  >
                    <IconPlus className="size-4" stroke={2} />
                    Tambahkan narahubung
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    {contacts.map((contact) => (
                      <div key={contact.key} className="flex items-center gap-3 rounded-xl border border-border p-3">
                        {contact.user_id && contact.avatar ? (
                          <Avatar src={contact.avatar} name={contact.name} size={36} />
                        ) : (
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-muted-foreground">
                            <IconUser className="size-5" stroke={2} />
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-heading">{contact.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{contact.user_id ? "User HMI Connect" : contact.phone_number}</p>
                        </div>
                        <Button variant="ghost" size="iconSm" onClick={() => setContactModalKey(contact.key)} aria-label={`Edit ${contact.name}`}>
                          <IconPencil className="size-4" stroke={2} />
                        </Button>
                        <Button variant="ghost" size="iconSm" onClick={() => setContacts((current) => current.filter((item) => item.key !== contact.key))} aria-label={`Hapus ${contact.name}`}>
                          <IconTrash className="size-4" stroke={2} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </FormSection>
            </div>

            <aside className="flex min-w-0 flex-col gap-1.5 lg:sticky lg:top-6 lg:gap-4">
              <section className="flex items-center gap-3 border border-x-0 border-border bg-surface p-5 lg:rounded-2xl lg:border-x">
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

              <section className="border border-x-0 border-border bg-surface p-5 lg:rounded-2xl lg:border-x">
                <h2 className="font-stack-sans-headline text-sm font-medium text-heading xl:text-[15px]">Thumbnail</h2>
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
                  {thumbnail?.url ? (
                    <Image
                      src={thumbnail.url}
                      alt="Pratinjau thumbnail"
                      fill
                      sizes="280px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="m-auto text-sm text-muted-foreground">
                      {thumbnail ? "Gambar tersimpan" : "Belum ada gambar"}
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
                      <IconLoader2 className="size-4 animate-spin" stroke={2} />
                    ) : (
                      <IconUpload className="size-4" stroke={2} />
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

              <section className="border border-x-0 border-border bg-surface p-5 lg:rounded-2xl lg:border-x">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-stack-sans-headline text-sm font-medium text-heading xl:text-[15px]">Foto lainnya</h2>
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
                        {image.url ? (
                          <Image
                            src={image.url}
                            alt={`Foto lainnya ${index + 1}`}
                            fill
                            sizes="90px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex size-full items-center justify-center text-xs text-muted-foreground">Gambar tersimpan</span>
                        )}
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
                            <IconTrash className="size-3.5" stroke={2} />
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
                    <IconLoader2 className="size-4 animate-spin" stroke={2} />
                  ) : (
                    <IconPhotoPlus className="size-4" stroke={2} />
                  )}
                  {uploadingGallery ? "Mengunggah foto..." : "Tambah foto"}
                </Button>
              </section>

              {event && (
                <div className="px-4 lg:px-0">
                  <Button variant="destructive" onClick={() => setDeleteOpen(true)} disabled={busy} className="w-full">
                    <IconTrash className="size-4" stroke={2} /> Hapus event
                  </Button>
                </div>
              )}

            </aside>
          </form>
        </main>
      </PageMargin>

      {contactModalKey && (
        <EventContactModal
          key={contactModalKey}
          open
          initial={(() => {
            const contact = contacts.find((item) => item.key === contactModalKey);
            if (!contact) return undefined;
            return contact.user_id
              ? { user_id: contact.user_id, displayName: contact.name, displayPhone: contact.phone_number, avatar: contact.avatar }
              : { name: contact.name, phone_number: contact.phone_number, displayName: contact.name, displayPhone: contact.phone_number };
          })()}
          onClose={() => setContactModalKey(null)}
          onSave={saveContact}
        />
      )}

      <AlertConfirmation
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        onConfirm={() => router.push(baseHref)}
        title="Buang perubahan?"
        message="Isian yang belum disimpan akan hilang."
        confirmLabel="Buang"
        cancelLabel="Lanjut mengisi"
      />
      <AlertConfirmation
        open={deleteOpen}
        onClose={() => { if (!deleting) setDeleteOpen(false); }}
        onConfirm={handleDelete}
        title="Hapus event ini?"
        message="Event akan hilang dari daftar dan tidak bisa dibuka lagi, termasuk lewat tautan yang sudah dibagikan."
        confirmLabel="Hapus event"
        loading={deleting}
      />
    </OfficialPageShell>
  );
}
