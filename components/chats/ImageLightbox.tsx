"use client";

interface ImageLightboxProps {
  url: string;
  onClose: () => void;
}

export default function ImageLightbox({ url, onClose }: ImageLightboxProps) {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- remote attachment served by Supabase Storage */}
      <img
        src={url}
        alt="Lampiran"
        className="max-h-[85vh] max-w-full rounded-lg object-contain"
      />
    </div>
  );
}
