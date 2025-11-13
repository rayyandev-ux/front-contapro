"use client";
import { useState } from "react";

type Props = {
  src: string;
  alt?: string;
  className?: string;
};

export default function ImagePreview({ src, alt, className }: Props) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="p-4 text-sm text-red-700 bg-red-50">
        No se pudo cargar la imagen.
        <div className="mt-2">
          <a href={src} target="_blank" rel="noreferrer" className="underline">Abrir en nueva pestaña</a>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={className ?? "h-auto max-h-[70vh] w-auto max-w-full mx-auto object-contain bg-white"}
      style={{ imageRendering: "auto" }}
    />
  );
}