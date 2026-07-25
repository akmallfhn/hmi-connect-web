import Link from "next/link";
import Button from "../buttons/Button";
import ForbiddenIllustration from "../illustrations/ForbiddenIllustration";
import NotFoundIllustration from "../illustrations/NotFoundIllustration";

type PageStateVariant = "forbidden" | "not_found";

const VARIANT_CONTENT: Record<
  PageStateVariant,
  { title: string; message: string; Illustration: typeof ForbiddenIllustration }
> = {
  forbidden: {
    title: "403 - Akses Ditolak",
    message:
      "Halaman ini dibatasi. Sepertinya kamu tidak memiliki izin yang cukup untuk mengaksesnya.",
    Illustration: ForbiddenIllustration,
  },
  not_found: {
    title: "404 - Halaman Tidak Ditemukan",
    message:
      "Maaf, halaman yang kamu cari tidak ada atau mungkin telah dipindahkan.",
    Illustration: NotFoundIllustration,
  },
};

interface PageStateProps {
  variant: PageStateVariant;
  backHref?: string;
  message?: string;
}

export default function PageState({
  variant,
  backHref = "/",
  message,
}: PageStateProps) {
  const {
    title,
    message: defaultMessage,
    Illustration,
  } = VARIANT_CONTENT[variant];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#f5f7fb] px-6 text-center">
      <div className="flex w-full max-w-64 overflow-hidden lg:max-w-80">
        <Illustration className="h-full w-full" />
      </div>
      <div className="flex max-w-md flex-col gap-2">
        <p className="text-2xl font-bold text-[#172033]">{title}</p>
        <p className="text-base text-[#5f6573] md:text-lg">
          {message ?? defaultMessage}
        </p>
      </div>
      <Link href={backHref}>
        <Button variant="tertiary" size="lg">
          Kembali ke Beranda
        </Button>
      </Link>
    </div>
  );
}
