import { PLACEHOLDER_ABOUT } from "./mockData";

export default function AboutCard() {
  return (
    <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-[#172033]">Tentang</h2>
      <p className="mt-2 text-sm leading-6 text-[#5f6573]">
        {PLACEHOLDER_ABOUT}
      </p>
    </div>
  );
}
