"use client";

import { IconInfoCircle } from "@tabler/icons-react";
import { useState } from "react";
import Button from "../buttons/Button";
import OfficialAccountGuideContacts, { type GuideContact } from "../common/OfficialAccountGuideContacts";
import Modal from "../modals/Modal";

export default function TrainingCreateGuide({
  contacts,
  canChat,
}: {
  contacts: { akmal: GuideContact | null; anida: GuideContact | null };
  canChat: boolean;
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
        Cara Membuat Training
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Cara Membuat Training"
        panelClassName="max-w-xl"
      >
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Training dibuat melalui Official Account organisasi yang memiliki
            akses untuk mengelola training.
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
                  Training
                </strong>{" "}
                di ponsel atau{" "}
                <strong className="font-semibold text-heading dark:text-[#172033]">
                  Kelola Training
                </strong>{" "}
                di sidebar desktop, lalu pilih{" "}
                <strong className="font-semibold text-heading dark:text-[#172033]">
                  Buat training
                </strong>
                .
              </p>
            </li>
            <li className="flex gap-3 rounded-xl border border-border bg-white p-3 text-[#5f6573] dark:text-[#5f6573]">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary">
                4
              </span>
              <p className="pt-1">
                Pilih tingkat dan tanggal, lalu lengkapi poster, lokasi,
                dan deskripsi. Proposal PDF serta foto lainnya dapat ditambahkan
                bila ada. Kemudian pilih{" "}
                <strong className="font-semibold text-heading dark:text-[#172033]">
                  Buat Training
                </strong>
                .
              </p>
            </li>
          </ol>

          <p className="rounded-xl bg-primary-soft p-3 text-primary-foreground">
            Belum menerima official akun organisasi? Hubungi Akmal atau Anida
            untuk bantuan terkait undangan akses ke Official Account.
          </p>

          <OfficialAccountGuideContacts
            contacts={contacts}
            canChat={canChat}
            loginRedirectTo="/trainings"
          />
        </div>
      </Modal>
    </>
  );
}
