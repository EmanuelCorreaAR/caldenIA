"use client";

import { useId, useRef, useState } from "react";

export function ScanCaptureField() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function clearPreview() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  }

  function openCamera() {
    const input = inputRef.current;
    if (!input) return;
    input.accept = "image/*";
    input.setAttribute("capture", "environment");
    input.click();
  }

  function openFile() {
    const input = inputRef.current;
    if (!input) return;
    input.accept = "image/jpeg,image/png,image/webp,image/*,application/pdf";
    input.removeAttribute("capture");
    input.click();
  }

  function onChange(file: File | null) {
    clearPreview();
    if (!file) {
      setFileName(null);
      return;
    }
    setFileName(file.name);
    if (file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
    }
  }

  return (
    <div className="space-y-3">
      <span className="block text-sm font-medium text-ink">Papel</span>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        name="scan"
        required
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={openCamera}
          className="flex h-11 items-center justify-center rounded-full border border-line bg-paper-raised text-sm font-semibold text-ink transition hover:border-accent/40"
        >
          Tomar foto
        </button>
        <button
          type="button"
          onClick={openFile}
          className="flex h-11 items-center justify-center rounded-full border border-line bg-paper-raised text-sm font-semibold text-ink transition hover:border-accent/40"
        >
          Subir archivo
        </button>
      </div>
      <p className="text-xs text-muted">
        Foto con el celular o archivo JPG/PNG/PDF · máx. 8 MB
      </p>
      {fileName ? (
        <p className="truncate text-xs font-medium text-accent">{fileName}</p>
      ) : null}
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Vista previa"
          className="max-h-48 w-full rounded-xl border border-line object-contain bg-void/40"
        />
      ) : null}
    </div>
  );
}
