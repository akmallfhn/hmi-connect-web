"use client";

import { IconInfoCircle } from "@tabler/icons-react";
import { useState } from "react";
import Button from "../buttons/Button";
import Modal from "../modals/Modal";
import SendMessageButton from "../profile/SendMessageButton";

type GuideContact = {
  id: string;
  username: string;
  full_name: string;
  avatar?: string;
};

export default function EventUploadGuide({
  contacts,
}: {
  contacts: { akmal: GuideContact | null; anida: GuideContact | null };
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        className="relative z-10 mt-2"
        onClick={() => setOpen(true)}
      >
        <IconInfoCircle className="size-4" aria-hidden="true" />
        Cara Unggah Event
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Cara Unggah Event"
        panelClassName="max-w-xl"
      >
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Event diunggah melalui Official Account organisasi yang memiliki
            akses untuk mengelola event.
          </p>

          <ol className="space-y-3">
            <li className="flex gap-3 rounded-xl border border-border bg-white p-3 text-[#5f6573] dark:text-[#5f6573]">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary">
                1
              </span>
              <p className="pt-1">
                Masuk ke HMI Connect menggunakan akun yang menerima undangan
                akses Official Account organisasi.
              </p>
            </li>
            <li className="flex gap-3 rounded-xl border border-border bg-white p-3 text-[#5f6573] dark:text-[#5f6573]">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary">
                2
              </span>
              <p className="pt-1">
                Beralih ke Official Account organisasi. Di ponsel, buka{" "}
                <strong className="font-semibold text-heading dark:text-[#172033]">
                  Pengaturan
                </strong>{" "}
                lalu pilih akun organisasi. Di desktop, klik foto profil di
                kanan atas lalu pilih akun organisasi.
              </p>
            </li>
            <li className="flex gap-3 rounded-xl border border-border bg-white p-3 text-[#5f6573] dark:text-[#5f6573]">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary">
                3
              </span>
              <p className="pt-1">
                Buka menu{" "}
                <strong className="font-semibold text-heading dark:text-[#172033]">
                  Event
                </strong>{" "}
                di ponsel atau{" "}
                <strong className="font-semibold text-heading dark:text-[#172033]">
                  Kelola Event
                </strong>{" "}
                di sidebar desktop, lalu pilih{" "}
                <strong className="font-semibold text-heading dark:text-[#172033]">
                  Buat event
                </strong>
                .
              </p>
            </li>
          </ol>

          <p className="rounded-xl bg-primary-soft p-3 text-primary-foreground">
            Belum menerima official akun organisasi? Hubungi Akmal atau Anida
            untuk bantuan terkait undangan akses ke Official Account.
          </p>

          <section aria-labelledby="event-guide-contacts" className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white p-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-heading dark:text-[#172033]">
                    Akmal
                  </p>
                  <p className="text-xs text-[#5f6573]">
                    Developer HMI Connect
                  </p>
                </div>
                {contacts.akmal ? (
                  <SendMessageButton
                    userId={contacts.akmal.id}
                    username={contacts.akmal.username}
                    fullName={contacts.akmal.full_name}
                    avatar={contacts.akmal.avatar}
                    className="shrink-0"
                  />
                ) : (
                  <span className="shrink-0 text-xs text-[#5f6573]">
                    Akun chat tidak ditemukan
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white p-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-heading dark:text-[#172033]">
                    Anida
                  </p>
                  <p className="text-xs text-[#5f6573]">Wakabid PAO PB HMI</p>
                </div>
                {contacts.anida ? (
                  <SendMessageButton
                    userId={contacts.anida.id}
                    username={contacts.anida.username}
                    fullName={contacts.anida.full_name}
                    avatar={contacts.anida.avatar}
                    className="shrink-0"
                  />
                ) : (
                  <span className="shrink-0 text-xs text-[#5f6573]">
                    Akun chat tidak ditemukan
                  </span>
                )}
              </div>
            </div>
          </section>
        </div>
      </Modal>
    </>
  );
}
