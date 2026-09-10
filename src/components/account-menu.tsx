"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { logoutAction } from "@/app/login/actions";

type Props = {
  name: string;
  email: string;
  tenantName: string;
  logoUrl?: string | null;
};

export function AccountMenu({ name, email, tenantName, logoUrl }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const initials = initialsFrom(name || email);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        aria-label={`Cuenta de ${email}`}
        onClick={() => setOpen((v) => !v)}
        className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-accent/20 text-xs font-bold text-accent ring-1 ring-accent/30 transition hover:bg-accent/30"
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-paper-raised shadow-lg shadow-void/40"
        >
          <div className="space-y-3 border-b border-line px-4 py-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                Usuario
              </div>
              <div
                className="mt-0.5 truncate text-sm font-semibold text-ink"
                title={email}
              >
                {email}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                Marca
              </div>
              <div className="mt-0.5 truncate text-sm text-ink">{tenantName}</div>
            </div>
          </div>
          <ul className="p-1.5">
            <li>
              <Link
                role="menuitem"
                href="/app/estudio"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-void/50"
              >
                Editar marca
              </Link>
            </li>
          </ul>
          <div className="border-t border-line p-1.5">
            <form action={logoutAction}>
              <button
                type="submit"
                role="menuitem"
                className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted transition hover:bg-void/50 hover:text-ink"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts[0].includes("@")) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
