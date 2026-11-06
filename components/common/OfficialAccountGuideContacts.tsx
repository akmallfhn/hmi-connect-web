"use client";

import Link from "next/link";
import SendMessageButton from "../profile/SendMessageButton";

export type GuideContact = {
  id: string;
  username: string;
  full_name: string;
  avatar?: string;
};

type GuideContacts = { akmal: GuideContact | null; anida: GuideContact | null };

export default function OfficialAccountGuideContacts({
  contacts,
  canChat = true,
  loginRedirectTo = "/trainings",
}: {
  contacts: GuideContacts;
  canChat?: boolean;
  loginRedirectTo?: string;
}) {
  const entries = [
    { name: "Akmal", role: "Developer HMI Connect", contact: contacts.akmal },
    { name: "Anida", role: "Wakabid PAO PB HMI", contact: contacts.anida },
  ];

  return (
    <section aria-label="Narahubung" className="grid gap-3 sm:grid-cols-2">
      {entries.map(({ name, role, contact }) => (
        <div key={name} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white p-3">
          <div className="min-w-0">
            <p className="truncate font-semibold text-heading dark:text-[#172033]">{name}</p>
            <p className="text-xs text-[#5f6573]">{role}</p>
          </div>
          {contact && canChat ? (
            <SendMessageButton
              userId={contact.id}
              username={contact.username}
              fullName={contact.full_name}
              avatar={contact.avatar}
              className="shrink-0"
            />
          ) : contact ? (
            <Link
              href={`/auth/login?redirectTo=${encodeURIComponent(loginRedirectTo)}`}
              className="shrink-0 text-xs font-semibold text-primary-foreground hover:underline"
            >
              Masuk untuk chat
            </Link>
          ) : (
            <span className="shrink-0 text-xs text-[#5f6573]">Akun chat tidak ditemukan</span>
          )}
        </div>
      ))}
    </section>
  );
}
