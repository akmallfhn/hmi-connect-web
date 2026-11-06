"use client";

import { useState } from "react";
import {
  KONGRES_NATIONAL_COMMITTEE,
  KONGRES_STEERING_COMMITTEE,
} from "@/lib/kongres-data";
import KongresCommitteePostCard from "./KongresCommitteePostCard";
import { KONGRES_SECTION_BODY, KONGRES_SECTION_CLASS, SectionHeading, TapisBand } from "./KongresDecor";

type CommitteeTab = "sc" | "oc";

const TABS: { value: CommitteeTab; label: string }[] = [
  { value: "oc", label: "Organizing Committee" },
  { value: "sc", label: "Steering Committee" },
];

const OC_LEADERS = KONGRES_NATIONAL_COMMITTEE.filter((member) => member.leader);
const OC_DIVISIONS = KONGRES_NATIONAL_COMMITTEE.filter((member) => !member.leader);
const SC_LEADERS = KONGRES_STEERING_COMMITTEE.filter((member) => member.leader);
const SC_MEMBERS = KONGRES_STEERING_COMMITTEE.filter((member) => !member.leader);

export default function KongresCommitteeSection() {
  const [tab, setTab] = useState<CommitteeTab>("oc");

  return (
    <section id="panitia" className={`relative bg-[#04291a] text-white ${KONGRES_SECTION_CLASS}`}>
      <div className="absolute -left-40 top-20 size-[480px] rounded-full bg-[#0a8a42]/30 blur-[120px]" />
      <div className={`relative ${KONGRES_SECTION_BODY}`}>
        <SectionHeading
          tone="dark"
          eyebrow="Struktur Kepanitiaan"
          title="Panitia & Steering Committee"
        />

        <div
          role="tablist"
          aria-label="Struktur kepanitiaan"
          className="mt-8 inline-flex rounded-full border border-white/15 bg-white/5 p-1"
        >
          {TABS.map((item) => {
            const selected = tab === item.value;
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                id={`committee-tab-${item.value}`}
                aria-selected={selected}
                aria-controls={`committee-panel-${item.value}`}
                onClick={() => setTab(item.value)}
                className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition sm:px-5 ${
                  selected ? "bg-[#e8b628] text-[#04291a]" : "text-white/70 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`committee-panel-${tab}`}
          aria-labelledby={`committee-tab-${tab}`}
          className="mt-8"
        >
          {tab === "sc" ? (
            <>
              <ul className="mx-auto grid max-w-2xl grid-cols-2 gap-3 sm:gap-5">
                {SC_LEADERS.map((member) => (
                  <KongresCommitteePostCard key={member.name} member={member} tone="green" featured />
                ))}
              </ul>
              <h3 className="mt-12 text-center font-stack-sans-headline text-xl font-medium">
                Anggota SC
              </h3>
              <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                {SC_MEMBERS.map((member) => (
                  <KongresCommitteePostCard key={member.name} member={member} tone="green" />
                ))}
              </ul>
            </>
          ) : (
            <>
              <ul className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
                {/* The chair spans its own row on mobile and takes the middle column on desktop. */}
                {OC_LEADERS.map((member, index) => (
                  <KongresCommitteePostCard
                    key={member.name}
                    member={member}
                    tone="gold"
                    featured
                    className={
                      index === 0
                        ? "col-span-2 mx-auto w-[calc(50%-0.375rem)] sm:w-[calc(50%-0.625rem)] lg:order-2 lg:col-span-1 lg:w-full"
                        : index === 1
                          ? "lg:order-1"
                          : "lg:order-3"
                    }
                  />
                ))}
              </ul>
              <h3 className="mt-12 text-center font-stack-sans-headline text-xl font-medium">
                Kepala Divisi
              </h3>
              <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                {OC_DIVISIONS.map((member) => (
                  <KongresCommitteePostCard key={member.name} member={member} tone="gold" />
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
      <TapisBand className="absolute inset-x-0 bottom-0 text-[#e8b628]/30" />
    </section>
  );
}
