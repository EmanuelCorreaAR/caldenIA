"use client";

import { useState } from "react";

type PasswordInputProps = {
  name: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  "aria-label"?: string;
  className?: string;
  inputClassName?: string;
};

export function PasswordInput({
  name,
  placeholder = "Contraseña",
  autoComplete = "current-password",
  required,
  "aria-label": ariaLabel = "Contraseña",
  className = "",
  inputClassName = "",
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <input
        type={visible ? "text" : "password"}
        name={name}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={
          inputClassName ||
          "h-12 w-full rounded-2xl border-0 bg-void/60 py-0 pl-4 pr-12 text-base text-ink outline-none ring-1 ring-line transition placeholder:text-muted focus:ring-2 focus:ring-accent"
        }
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted transition hover:text-accent"
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        aria-pressed={visible}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 3l18 18M10.5 10.6a2.75 2.75 0 0 0 3 3M9.4 5.5A10.4 10.4 0 0 1 12 5c6 0 9.5 7 9.5 7a16.6 16.6 0 0 1-3.2 3.9M6.2 6.3C3.9 8 2.5 12 2.5 12s3.5 7 9.5 7c1.4 0 2.7-.3 3.9-.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
