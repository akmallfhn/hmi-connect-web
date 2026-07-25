interface MasterPlaceholderPageProps {
  title: string;
  description: string;
}

export default function MasterPlaceholderPage({
  title,
  description,
}: MasterPlaceholderPageProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 p-4 text-center sm:p-6 lg:p-8">
      <p className="text-2xl font-bold text-[#172033]">{title}</p>
      <p className="max-w-sm text-sm text-[#5f6573]">{description}</p>
      <span className="mt-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
        Segera hadir
      </span>
    </div>
  );
}
