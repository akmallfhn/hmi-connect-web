import EmptyStateIllustration from "../illustrations/EmptyStateIllustration";

interface EmptyStateProps {
  title: string;
  description: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center px-5 py-16 text-center">
      <EmptyStateIllustration className="h-auto w-56" aria-hidden="true" />
      <h2 className="mt-6 text-base font-semibold text-[#172033] xl:text-xl">
        {title}
      </h2>
      <p className="mt-1 max-w-md text-sm leading-6 text-[#5f6573] xl:text-base">
        {description}
      </p>
    </div>
  );
}
