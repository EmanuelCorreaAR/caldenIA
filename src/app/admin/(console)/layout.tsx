import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/login/actions";
import { requirePlatformSession } from "@/lib/auth";

export default async function AdminConsoleLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requirePlatformSession();

  return (
    <div className="bg-field min-h-dvh lg:flex">
      <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-line bg-paper-raised/80 px-4 py-5 backdrop-blur-md lg:flex">
        <div className="flex items-center gap-2 px-2">
          <Link
            href="/admin"
            className="font-[family-name:var(--font-syne)] text-lg font-bold tracking-tight text-ink"
          >
            CaldenIA
          </Link>
          <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-on-accent">
            Admin
          </span>
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-1 px-1">
          <Link
            href="/admin"
            className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-void/50"
          >
            Tenants
          </Link>
          <Link
            href="/admin/nuevo"
            className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-void/50 hover:text-ink"
          >
            Nuevo tenant
          </Link>
        </nav>
        <div className="space-y-2 px-2 pb-2">
          <p className="truncate text-xs text-muted">{session.email}</p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full rounded-full border border-line px-3 py-2 text-sm font-medium text-muted transition hover:text-ink"
            >
              Salir
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-b border-line/70 bg-paper/90 backdrop-blur-md lg:bg-paper/60">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <Link
                href="/admin"
                className="font-[family-name:var(--font-syne)] text-lg font-bold tracking-tight text-ink"
              >
                CaldenIA
              </Link>
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-on-accent">
                Admin
              </span>
            </div>
            <p className="hidden text-sm text-muted lg:block">Plataforma</p>
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-muted sm:inline lg:hidden">
                {session.email}
              </span>
              <form action={logoutAction} className="lg:hidden">
                <button
                  type="submit"
                  className="rounded-full border border-line bg-paper-raised px-3 py-1.5 text-sm font-medium text-ink transition hover:border-ink/20"
                >
                  Salir
                </button>
              </form>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
