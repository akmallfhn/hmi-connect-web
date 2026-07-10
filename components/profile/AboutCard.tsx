interface AboutCardProps {
  bio?: string;
}

export default function AboutCard({ bio }: AboutCardProps) {
  if (!bio) return null;

  return (
    <div className="border border-x-0 border-[#e6e9ef] bg-white p-5 shadow-sm lg:rounded-2xl lg:border-x">
      <h2 className="text-sm font-semibold text-[#172033]">Tentang</h2>
      <p className="mt-2 text-sm leading-6 text-[#5f6573]">{bio}</p>
    </div>
  );
}
