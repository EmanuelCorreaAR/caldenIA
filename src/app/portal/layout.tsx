import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/login/actions";
import { getSession, requireClientSession } from "@/lib/auth";

export default async function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const existing = await getSession();
  if (existing?.kind === "platform") redirect("/admin");
  if (existing?.kind === "tenant" && existing.role !== "CLIENT") {
    redirect("/app");
  }

  const session = await requireClientSession();

  return (
    <div className="bg-field min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-paper lg:max-w-3xl">
        <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/90 px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="animate-calden-pulse size-2 shrink-0 rounded-full bg-accent"
                  aria-hidden
                />
                <span className="truncate font-[family-name:var(--font-syne)] text-lg font-bold tracking-tight text-ink">
                  {session.tenantName}
                </span>
              </div>
              <p className="mt-0.5 truncate pl-4 text-xs text-muted">
                Portal · {session.clientName ?? "Cliente"}
              </p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted transition hover:text-ink"
              >
                Salir
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6">{children}</main>

        <footer className="border-t border-line px-4 py-3 text-center text-[11px] text-muted">
          <Link href="/portal" className="font-medium text-muted hover:text-ink">
            Inicio portal
          </Link>
        </footer>
      </div>
    </div>
  );
}
