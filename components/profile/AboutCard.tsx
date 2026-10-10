interface AboutCardProps {
  bio?: string;
}

export default function AboutCard({ bio }: AboutCardProps) {
  if (!bio) return null;

  return (
    <div className="border border-x-0 border-border bg-surface p-5 lg:rounded-2xl lg:border-x">
      <h2 className="text-sm font-stack-sans-headline font-medium text-heading xl:text-[15px]">
        Tentang
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground xl:text-[15px]">
        {bio}
      </p>
    </div>
  );
}
