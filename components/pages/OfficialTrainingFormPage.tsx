"use client";

import { IconFileTypePdf, IconLink, IconLoader2, IconMapPin, IconPencil, IconPhotoPlus, IconPlus, IconSearch, IconTrash, IconUpload, IconUser } from "@tabler/icons-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import type { TrainingDetail } from "@/apis/trainings";
import { createTraining, deleteTraining, saveTrainingContacts, saveTrainingImages, updateTraining } from "@/lib/actions";
import { MANAGE_TRAININGS_HREF } from "@/lib/access";
import { eventMapEmbedUrl, googleMapsSearchUrl, safeExternalUrl } from "@/lib/event-ui";
import { allowedTrainingLevels, TRAINING_LEVEL_LABEL } from "@/lib/training-levels";
import { TRAINING_POSTER_ACCEPT, uploadTrainingPoster } from "@/lib/training-poster";
import { TRAINING_PROPOSAL_ACCEPT, uploadTrainingProposal } from "@/lib/training-proposal";
import { isSuccessStatus, type TrainingStatusEnum } from "@/lib/types";
import Button from "../buttons/Button";
import Avatar from "../common/Avatar";
import PageMargin from "../common/PageMargin";
import EventLinkButton from "../events/EventLinkButton";
import FieldHelpTooltip from "../fields/FieldHelpTooltip";
import Input from "../fields/Input";
import Select from "../fields/Select";
import TextArea from "../fields/TextArea";
import EventContactModal, { type EventContactSelection } from "../forms/EventContactModal";
import type { ComposerAuthorEntity } from "../forms/CreateFeedForms";
import AlertConfirmation from "../modals/AlertConfirmation";
import OfficialPageShell from "../official/OfficialPageShell";
import LogoHmi from "../svg/LogoHmi";

type ContactDraft = { key: string; id?: string; user_id?: string; name: string; phone_number: string; avatar?: string };
type Field = "level" | "startDate" | "endDate" | "locationUrl";
type FieldErrors = Partial<Record<Field, string>>;
const FIELD_IDS: Record<Field, string> = {
  level: "training-level", startDate: "training-start-date",
  endDate: "training-end-date", locationUrl: "training-location-url",
};
const MAX_GALLERY_IMAGES = 20;

function FormSection({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return <section className="border border-x-0 border-border bg-surface p-5 lg:rounded-2xl lg:border-x">
    <div className="flex items-center justify-between gap-3">
      <h2 className="font-stack-sans-headline text-sm font-medium text-heading xl:text-[15px]">{title}</h2>
      {action}
    </div>
    <div className="mt-4">{children}</div>
  </section>;
}

function urlError(value: string) {
  return value.trim() && !safeExternalUrl(value) ? "Gunakan tautan lengkap yang diawali http:// atau https://." : undefined;
}

export default function OfficialTrainingFormPage({ entity, training }: { entity: ComposerAuthorEntity; training?: TrainingDetail }) {
  const router = useRouter();
  const posterInputRef = useRef<HTMLInputElement>(null);
  const proposalInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(training);
  const baseHref = MANAGE_TRAININGS_HREF;
  const allowedLevels = allowedTrainingLevels(entity.type, entity.bodyType, entity.parentType);
  const [level, setLevel] = useState<TrainingStatusEnum | null>(training?.level ?? allowedLevels[0] ?? null);
  const [description, setDescription] = useState(training?.description ?? "");
  const [startDate, setStartDate] = useState(training?.start_date?.slice(0, 10) ?? "");
  const [endDate, setEndDate] = useState(training?.end_date?.slice(0, 10) ?? "");
  const [locationName, setLocationName] = useState(training?.location_name ?? "");
  const [locationUrl, setLocationUrl] = useState(training?.location_url ?? "");
  const [proposalUrl, setProposalUrl] = useState(training?.proposal_url ?? "");
  const [proposalName, setProposalName] = useState("Proposal training.pdf");
  const [mapQuery, setMapQuery] = useState(training?.location_name?.trim() ?? "");
  const [mapSearchActive, setMapSearchActive] = useState(false);
  const [poster, setPoster] = useState<{ mediaId: string; url: string } | null>(
    (() => { const cover = training?.images?.find((image) => image.role === "cover");
      return cover ? { mediaId: cover.media_id, url: cover.image_url ?? training?.image_url ?? "" } : null; })(),
  );
  const [gallery, setGallery] = useState<{ mediaId: string; url: string }[]>(
    training?.images?.filter((image) => image.role === "gallery")
      .map((image) => ({ mediaId: image.media_id, url: image.image_url ?? "" })) ?? [],
  );
  const [contacts, setContacts] = useState<ContactDraft[]>(
    training?.contacts?.map((contact) => ({
      key: contact.id, id: contact.id, user_id: contact.user_id,
      name: contact.name ?? "", phone_number: contact.phone_number ?? "", avatar: contact.avatar,
    })) ?? [],
  );
  const [contactModalKey, setContactModalKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingProposal, setUploadingProposal] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const busy = uploadingPoster || uploadingProposal || uploadingGallery || saving || deleting;
  const mapPreviewUrl = locationName.trim() === mapQuery
    ? eventMapEmbedUrl(mapSearchActive ? null : locationUrl, mapQuery) : null;

  const snapshot = JSON.stringify({ level, description, startDate, endDate, locationName, locationUrl, proposalUrl,
    poster: poster?.mediaId, gallery: gallery.map((image) => image.mediaId),
    contacts: contacts.map(({ user_id, name, phone_number }) => [user_id, name, phone_number]),
  });
  const [initialSnapshot] = useState(snapshot);
  const isDirty = snapshot !== initialSnapshot;

  function clearError(field: Field) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handlePoster(changeEvent: ChangeEvent<HTMLInputElement>) {
    const file = changeEvent.target.files?.[0];
    changeEvent.target.value = "";
    if (!file) return;
    setUploadingPoster(true);
    try {
      const result = await uploadTrainingPoster(file);
      if (result.ok) setPoster({ mediaId: result.assetId, url: result.url });
      else toast.error(result.message);
    } catch {
      toast.error("Poster belum berhasil diunggah.");
    } finally {
      setUploadingPoster(false);
    }
  }

  async function handleProposal(changeEvent: ChangeEvent<HTMLInputElement>) {
    const file = changeEvent.target.files?.[0];
    changeEvent.target.value = "";
    if (!file) return;
    setUploadingProposal(true);
    try {
      const result = await uploadTrainingProposal(file);
      if (result.ok) {
        setProposalUrl(result.url);
        setProposalName(file.name);
      } else toast.error(result.message);
    } finally {
      setUploadingProposal(false);
    }
  }

  async function handleGallery(changeEvent: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(changeEvent.target.files ?? []);
    changeEvent.target.value = "";
    if (files.length === 0) return;
    const slots = MAX_GALLERY_IMAGES - gallery.length;
    const selected = files.slice(0, slots);
    if (selected.length < files.length) toast.info(`Foto lainnya maksimal ${MAX_GALLERY_IMAGES} foto.`);
    setUploadingGallery(true);
    try {
      for (const file of selected) {
        const result = await uploadTrainingPoster(file);
        if (result.ok) {
          setGallery((current) => [...current, { mediaId: result.assetId, url: result.url }]);
        } else toast.error(`${file.name}: ${result.message}`);
      }
    } finally {
      setUploadingGallery(false);
    }
  }

  function saveContact(selection: EventContactSelection) {
    const contact = { user_id: selection.user_id, name: selection.displayName,
      phone_number: selection.displayPhone, avatar: selection.avatar };
    setContacts((current) => contactModalKey === "new"
      ? [...current, { key: globalThis.crypto.randomUUID(), ...contact }]
      : current.map((item) => item.key === contactModalKey ? { ...item, ...contact } : item));
    setContactModalKey(null);
  }

  function validate() {
    const next: FieldErrors = {};
    if (!level || !allowedLevels.includes(level)) next.level = "Pilih tingkat yang diizinkan untuk akun ini.";
    if (!startDate) next.startDate = "Pilih tanggal mulai.";
    if (!endDate) next.endDate = "Pilih tanggal selesai.";
    else if (startDate && endDate < startDate) next.endDate = "Tanggal selesai tidak boleh sebelum tanggal mulai.";
    next.locationUrl = urlError(locationUrl);
    setErrors(next);
    const first = (Object.keys(FIELD_IDS) as Field[]).find((field) => next[field]);
    if (first) document.getElementById(FIELD_IDS[first])?.focus();
    return !first;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !validate()) return;
    setSaving(true);
    try {
      const common = { level: level!, description: description.trim(),
        start_date: startDate, end_date: endDate, location_name: locationName.trim(),
        location_url: locationUrl.trim(), proposal_url: proposalUrl.trim() };
      const result = training
        ? await updateTraining({ id: training.id, ...common })
        : await createTraining({ ...common, organizer_type: entity.type, organizer_id: entity.id });
      if (!isSuccessStatus(result.status) || !result.data) {
        toast.error(result.status === "FORBIDDEN"
          ? "Akunmu tidak lagi punya akses untuk mengelola training ini."
          : "Training belum berhasil disimpan. Periksa isian lalu coba lagi.");
        return;
      }
      const savedImages = await saveTrainingImages(result.data.id, poster?.mediaId ?? null, gallery.map((image) => image.mediaId));
      const savedContacts = await saveTrainingContacts(result.data.id, contacts.map((contact) => ({
        ...(contact.id ? { id: contact.id } : {}),
        ...(contact.user_id ? { user_id: contact.user_id }
          : { name: contact.name.trim(), phone_number: contact.phone_number.trim() }),
      })));
      if (!savedImages.ok || !savedContacts.ok) {
        const attachmentError = !savedImages.ok ? savedImages.message : !savedContacts.ok ? savedContacts.message : undefined;
        toast.error(`Training tersimpan, tetapi lampiran belum lengkap. ${attachmentError ?? "Buka edit untuk mencoba lagi."}`);
        router.push(`${baseHref}/${result.data.id}`);
        return;
      }
      router.push(`${baseHref}?saved=${isEditing ? "updated" : "created"}`);
    } catch (error) {
      console.error("[OfficialTrainingFormPage] save threw:", error);
      toast.error("Training belum berhasil disimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!training) return;
    setDeleting(true);
    try {
      const result = await deleteTraining(training.id);
      if (!isSuccessStatus(result.status)) throw new Error(result.message);
      toast.success("Training berhasil dihapus.");
      router.push(baseHref);
    } catch {
      toast.error("Training belum berhasil dihapus. Coba lagi.");
    } finally {
      setDeleting(false);
    }
  }

  return <OfficialPageShell entity={entity} compactGreeting>
    <PageMargin noMobilePadding className="pb-6 pt-4 lg:py-6">
      <main className="pb-6 lg:pb-10">
        <div className="mb-4 flex min-h-11 items-center justify-between gap-3 px-4 lg:mb-6 lg:px-0">
          <h1 className="font-stack-sans-headline text-xl font-medium text-heading sm:text-2xl">
            {isEditing ? "Edit training" : "Buat training baru"}
          </h1>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" onClick={() => isDirty ? setDiscardOpen(true) : router.push(baseHref)} disabled={busy}>Batal</Button>
            <Button type="submit" form="official-training-form" disabled={busy}>
              {saving && <IconLoader2 className="size-4 animate-spin" stroke={2} />}
              {saving ? "Menyimpan..." : isEditing ? "Simpan" : "Terbitkan"}
            </Button>
          </div>
        </div>
        <form id="official-training-form" onSubmit={handleSubmit} noValidate
          className="grid items-start gap-1.5 lg:grid-cols-[minmax(0,768px)_320px] lg:gap-6">
          <div className="flex min-w-0 flex-col gap-1.5 lg:gap-4">
            <FormSection title="Informasi utama">
              <div className="flex flex-col gap-4">
                <div>
                  <Select selectId="training-level" label="Tingkat" placeholder="Pilih tingkat training"
                    value={level} onChange={(value) => { setLevel(value as TrainingStatusEnum); clearError("level"); }}
                    options={allowedLevels.map((value) => ({ label: TRAINING_LEVEL_LABEL[value], value }))}
                    disabled={allowedLevels.length === 1} required />
                  {errors.level && <p role="alert" className="mt-1 pl-1 text-xs text-destructive-foreground">{errors.level}</p>}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input inputId="training-start-date" type="date" label="Tanggal mulai" value={startDate}
                    onChange={(event) => { const next = event.target.value; setStartDate(next); if (next && (!endDate || endDate < next)) setEndDate(next); clearError("startDate"); clearError("endDate"); }}
                    errorMessage={errors.startDate} required />
                  <Input inputId="training-end-date" type="date" label="Tanggal selesai" min={startDate || undefined}
                    value={endDate} onChange={(event) => { setEndDate(event.target.value); clearError("endDate"); }}
                    errorMessage={errors.endDate} required />
                </div>
                <TextArea textAreaId="training-description" label="Deskripsi"
                  placeholder="Tujuan, agenda, syarat peserta, dan hal yang perlu disiapkan."
                  rows={7} value={description} onChange={(event) => setDescription(event.target.value)} />
              </div>
            </FormSection>
            <FormSection title="Lokasi dan tautan">
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex items-end gap-2">
                    <div className="min-w-0 flex-1">
                      <Input inputId="training-location" label="Nama dan alamat lokasi"
                        placeholder="Contoh: Aula Insan Cita, Jakarta Pusat" value={locationName}
                        onChange={(event) => setLocationName(event.target.value)}
                        icon={<IconMapPin className="size-4" stroke={2} />}
                        trailing={<FieldHelpTooltip text="Tulis nama tempat dan alamatnya. Tekan Cari untuk melihat pratinjau peta." />} />
                    </div>
                    <Button variant="primary" onClick={() => { setMapQuery(locationName.trim()); setMapSearchActive(true); }}
                      disabled={!locationName.trim()} className="h-[42px]"><IconSearch className="size-4" stroke={2} /> Cari</Button>
                  </div>
                  {mapPreviewUrl && <div className="mt-3">
                    <div className="aspect-[16/7] overflow-hidden rounded-xl border border-border bg-surface-muted">
                      <iframe src={mapPreviewUrl} title="Pratinjau peta lokasi" loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade" className="size-full border-0" />
                    </div>
                    {mapQuery && <EventLinkButton href={googleMapsSearchUrl(mapQuery)} newTab variant="ghost" size="sm" className="mt-2">Buka di Google Maps</EventLinkButton>}
                  </div>}
                </div>
                <Input inputId="training-location-url" type="url" label="Tautan lokasi" placeholder="https://maps.app.goo.gl/..."
                  value={locationUrl} onChange={(event) => { setLocationUrl(event.target.value); setMapSearchActive(false); clearError("locationUrl"); }}
                  onBlur={() => setErrors((current) => ({ ...current, locationUrl: urlError(locationUrl) }))}
                  errorMessage={errors.locationUrl} icon={<IconLink className="size-4" stroke={2} />}
                  trailing={<FieldHelpTooltip text="Opsional. Tempel tautan berbagi lokasi dari Google Maps." />} />
              </div>
            </FormSection>
            <FormSection title="Proposal training" action={<span className="text-xs text-muted-foreground">Opsional</span>}>
              <input ref={proposalInputRef} type="file" accept={TRAINING_PROPOSAL_ACCEPT} className="hidden"
                onChange={handleProposal} aria-label="Pilih proposal PDF" />
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive-soft text-destructive-foreground">
                  <IconFileTypePdf className="size-6" stroke={1.8} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-heading">{proposalUrl ? proposalName : "Belum ada proposal"}</p>
                  <p className="text-xs text-muted-foreground">Jika diunggah, gunakan PDF maksimal 10MB.</p>
                </div>
                {proposalUrl && <EventLinkButton href={proposalUrl} newTab variant="ghost" size="sm">Lihat</EventLinkButton>}
                {proposalUrl && <Button variant="ghost" size="sm" onClick={() => { setProposalUrl(""); setProposalName("Proposal training.pdf"); }} disabled={busy}>
                  <IconTrash className="size-4" stroke={2} /> Hapus
                </Button>}
                <Button id="training-proposal-input" variant="outline" size="sm"
                  onClick={() => proposalInputRef.current?.click()} disabled={busy}>
                  {uploadingProposal ? <IconLoader2 className="size-4 animate-spin" stroke={2} /> : <IconUpload className="size-4" stroke={2} />}
                  {uploadingProposal ? "Mengunggah..." : proposalUrl ? "Ganti PDF" : "Unggah PDF"}
                </Button>
              </div>
            </FormSection>
            <FormSection title="Narahubung" action={contacts.length > 0
              ? <Button variant="outline" size="sm" onClick={() => setContactModalKey("new")}><IconPlus className="size-4" stroke={2} /> Tambah</Button>
              : undefined}>
              {contacts.length === 0 ? <Button variant="outline" onClick={() => setContactModalKey("new")} className="w-full">
                <IconPlus className="size-4" stroke={2} /> Tambahkan narahubung
              </Button> : <div className="flex flex-col gap-2">{contacts.map((contact) =>
                <div key={contact.key} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  {contact.user_id && contact.avatar ? <Avatar src={contact.avatar} name={contact.name} size={36} />
                    : <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-muted-foreground"><IconUser className="size-5" stroke={2} /></span>}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-heading">{contact.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{contact.user_id ? "User HMI Connect" : contact.phone_number}</p>
                  </div>
                  <Button variant="ghost" size="iconSm" onClick={() => setContactModalKey(contact.key)} aria-label={`Edit ${contact.name}`}><IconPencil className="size-4" stroke={2} /></Button>
                  <Button variant="ghost" size="iconSm" onClick={() => setContacts((current) => current.filter((item) => item.key !== contact.key))} aria-label={`Hapus ${contact.name}`}><IconTrash className="size-4" stroke={2} /></Button>
                </div>,
              )}</div>}
            </FormSection>
          </div>
          <aside className="flex min-w-0 flex-col gap-1.5 lg:sticky lg:top-6 lg:gap-4">
            <section className="flex items-center gap-3 border border-x-0 border-border bg-surface p-5 lg:rounded-2xl lg:border-x">
              <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-muted">
                {entity.imageUrl ? <Image src={entity.imageUrl} alt="" width={40} height={40} className="size-full object-cover" />
                  : <LogoHmi className="size-5" aria-hidden="true" />}
              </span>
              <div className="min-w-0"><p className="text-sm text-muted-foreground">Diterbitkan atas nama</p>
                <p className="truncate text-sm font-semibold text-heading">{entity.name}</p></div>
            </section>
            <section className="border border-x-0 border-border bg-surface p-5 lg:rounded-2xl lg:border-x">
              <h2 className="font-stack-sans-headline text-sm font-medium text-heading xl:text-[15px]">Poster training</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">Rasio potret 4:5 disarankan. Maksimal 5 MB.</p>
              <input ref={posterInputRef} type="file" accept={TRAINING_POSTER_ACCEPT} className="hidden" onChange={handlePoster} />
              <div className="relative mt-3 flex aspect-[4/5] w-full overflow-hidden rounded-xl border border-dashed border-border-strong bg-surface-muted">
                {poster?.url ? <Image src={poster.url} alt="Pratinjau poster training" fill sizes="280px" className="object-cover" />
                  : <span className="m-auto text-sm text-muted-foreground">{poster ? "Gambar tersimpan" : "Belum ada poster"}</span>}
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" onClick={() => posterInputRef.current?.click()} disabled={busy} className="min-w-0 flex-1">
                  {uploadingPoster ? <IconLoader2 className="size-4 animate-spin" stroke={2} /> : <IconUpload className="size-4" stroke={2} />}
                  {uploadingPoster ? "Mengunggah..." : poster ? "Ganti" : "Pilih gambar"}
                </Button>
                {poster && <Button variant="destructive" onClick={() => setPoster(null)} disabled={busy}>Hapus</Button>}
              </div>
            </section>
            <section className="border border-x-0 border-border bg-surface p-5 lg:rounded-2xl lg:border-x">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-stack-sans-headline text-sm font-medium text-heading xl:text-[15px]">Foto lainnya</h2>
                <p className="text-sm tabular-nums text-muted-foreground">{gallery.length}/{MAX_GALLERY_IMAGES}</p>
              </div>
              <input ref={galleryInputRef} type="file" multiple accept={TRAINING_POSTER_ACCEPT}
                className="hidden" onChange={handleGallery} aria-label="Pilih foto lainnya" />
              {gallery.length > 0 && <div className="mt-3 grid grid-cols-3 gap-2">
                {gallery.map((image, index) => <div key={image.mediaId} className="relative aspect-square overflow-hidden rounded-lg bg-surface-muted">
                  {image.url ? <Image src={image.url} alt={`Foto lainnya ${index + 1}`} fill sizes="90px" className="object-cover" />
                    : <span className="flex size-full items-center justify-center text-xs text-muted-foreground">Gambar tersimpan</span>}
                  <span className="absolute right-1 top-1"><Button variant="destructive" size="iconSm"
                    onClick={() => setGallery((current) => current.filter((item) => item.mediaId !== image.mediaId))}
                    aria-label={`Hapus foto ${index + 1}`} disabled={busy}>
                    <IconTrash className="size-3.5" stroke={2} />
                  </Button></span>
                </div>)}
              </div>}
              <Button variant="outline" onClick={() => galleryInputRef.current?.click()}
                disabled={busy || gallery.length >= MAX_GALLERY_IMAGES} className="mt-3 w-full">
                {uploadingGallery ? <IconLoader2 className="size-4 animate-spin" stroke={2} /> : <IconPhotoPlus className="size-4" stroke={2} />}
                {uploadingGallery ? "Mengunggah foto..." : "Tambah foto"}
              </Button>
            </section>
            {training && <div className="px-4 lg:px-0"><Button variant="destructive" onClick={() => setDeleteOpen(true)} disabled={busy} className="w-full">
              <IconTrash className="size-4" stroke={2} /> Hapus training
            </Button></div>}
          </aside>
        </form>
      </main>
    </PageMargin>
    {contactModalKey && <EventContactModal key={contactModalKey} open
      initial={(() => { const contact = contacts.find((item) => item.key === contactModalKey);
        if (!contact) return undefined;
        return contact.user_id
          ? { user_id: contact.user_id, displayName: contact.name, displayPhone: contact.phone_number, avatar: contact.avatar }
          : { name: contact.name, phone_number: contact.phone_number, displayName: contact.name, displayPhone: contact.phone_number };
      })()}
      onClose={() => setContactModalKey(null)} onSave={saveContact} />}
    <AlertConfirmation open={discardOpen} onClose={() => setDiscardOpen(false)} onConfirm={() => router.push(baseHref)}
      title="Buang perubahan?" message="Isian yang belum disimpan akan hilang." confirmLabel="Buang" cancelLabel="Lanjut mengisi" />
    <AlertConfirmation open={deleteOpen} onClose={() => { if (!deleting) setDeleteOpen(false); }} onConfirm={handleDelete}
      title="Hapus training ini?" message="Training akan hilang dari daftar dan tidak bisa dibuka lagi, termasuk lewat tautan yang sudah dibagikan."
      confirmLabel="Hapus training" loading={deleting} />
  </OfficialPageShell>;
}
