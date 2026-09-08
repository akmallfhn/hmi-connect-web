import Link from "next/link";

export type EntityInfoField = {
  label: string;
  value: string;
  href?: string;
};

interface EntityInfoCardProps {
  fields: EntityInfoField[];
}

export default function EntityInfoCard({ fields }: EntityInfoCardProps) {
  if (fields.length === 0) return null;

  return (
    <div className="border border-x-0 border-[#e6e9ef] bg-white p-5 lg:rounded-2xl lg:border-x lg:shadow-sm">
      <h2 className="text-sm font-semibold text-[#172033] xl:text-[15px]">
        Informasi
      </h2>

      <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label}>
            <dt className="text-xs text-[#5f6573] xl:text-[13px]">
              {field.label}
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-[#172033] xl:text-[15px]">
              {field.href ? (
                <Link href={field.href} className="hover:text-primary hover:underline">
                  {field.value}
                </Link>
              ) : (
                field.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
