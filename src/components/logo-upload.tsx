"use client";

import { useId, useState } from "react";

type Props = {
  currentUrl: string | null;
  tenantName: string;
  canEdit: boolean;
};

export function LogoUpload({ currentUrl, tenantName, canEdit }: Props) {
  const inputId = useId();
  const [preview, setPreview] = useState<string | null>(null);

  const shown = preview ?? currentUrl;

  function onPick(file: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    if (!file) {
      setPreview(null);
      return;
    }
    setPreview(URL.createObjectURL(file));
  }

  if (!canEdit) {
    return shown ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={shown}
        alt={`Logo ${tenantName}`}
        className="h-20 w-20 shrink-0 rounded-xl object-contain bg-void/40 p-1"
      />
    ) : (
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-line text-center text-[11px] leading-tight text-muted">
        Sin logo
      </div>
    );
  }

  return (
    <>
      <input
        id={inputId}
        type="file"
        name="logo"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
      <label
        htmlFor={inputId}
        className="group relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-void/40 transition hover:border-accent/50 hover:bg-accent/5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent"
      >
        {shown ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shown}
              alt={`Logo ${tenantName}`}
              className="h-full w-full object-contain p-1"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-void/70 text-center text-[11px] font-semibold leading-tight text-ink opacity-0 transition group-hover:opacity-100">
              Cambiar
            </span>
          </>
        ) : (
          <span className="px-1 text-center text-[11px] font-medium leading-tight text-muted group-hover:text-ink">
            Subir logo
          </span>
        )}
      </label>
    </>
  );
}
