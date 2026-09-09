import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/login/actions";
import { getSession, requireTenantSession } from "@/lib/auth";

const nav = [
  { href: "/app", label: "Inicio", icon: HomeIcon },
  { href: "/app/clientes", label: "Clientes", icon: ClientsIcon },
  { href: "/app/registros", label: "Registros", icon: RecordsIcon },
  { href: "/app/mas", label: "Más", icon: MoreIcon },
] as const;

export default async function AppLayout({ children }: { children: ReactNode }) {
  const existing = await getSession();
  if (existing?.kind === "platform") {
    redirect("/admin");
  }

  const session = await requireTenantSession();

  return (
    <div className="bg-field min-h-dvh lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-paper-raised/80 px-4 py-5 backdrop-blur-md lg:flex xl:w-64">
        <div className="flex items-center gap-2.5 px-2">
          <span
            className="animate-calden-pulse size-2 rounded-full bg-accent"
            aria-hidden
          />
          <Link
            href="/app"
            className="font-[family-name:var(--font-syne)] text-lg font-bold tracking-tight text-ink"
          >
            CaldenIA
          </Link>
        </div>
        <p className="mt-3 truncate px-2 text-xs text-muted">{session.tenantName}</p>

        <nav aria-label="Principal" className="mt-8 flex flex-1 flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-void/50 hover:text-ink"
            >
              <item.icon />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <form action={logoutAction} className="px-2 pb-2">
          <button
            type="submit"
            className="w-full rounded-full border border-line px-3 py-2 text-sm font-medium text-muted transition hover:border-accent/40 hover:text-ink"
          >
            Salir
          </button>
        </form>
      </aside>

      {/* Mobile shell + desktop main */}
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-paper lg:mx-0 lg:max-w-none lg:bg-transparent">
        <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/90 px-4 py-3 backdrop-blur-md sm:px-6 lg:border-line lg:bg-paper/70 lg:px-8">
          <div className="flex items-center justify-between gap-3 lg:mx-auto lg:max-w-5xl">
            <div className="flex items-center gap-2.5 lg:hidden">
              <span
                className="animate-calden-pulse size-2 rounded-full bg-accent"
                aria-hidden
              />
              <Link
                href="/app"
                className="font-[family-name:var(--font-syne)] text-lg font-bold tracking-tight text-ink"
              >
                CaldenIA
              </Link>
            </div>
            <h1 className="hidden font-[family-name:var(--font-syne)] text-lg font-bold tracking-tight text-ink lg:block">
              Panel
            </h1>
            <div className="flex items-center gap-2">
              <span className="max-w-[9rem] truncate rounded-full bg-void/40 px-3 py-1 text-xs font-medium text-muted sm:max-w-none lg:bg-paper-raised">
                {session.tenantName}
              </span>
              <form action={logoutAction} className="lg:hidden">
                <button
                  type="submit"
                  className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-muted transition hover:text-ink"
                >
                  Salir
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 sm:pb-32 sm:pt-6 lg:mx-auto lg:w-full lg:max-w-5xl lg:px-8 lg:pb-10 lg:pt-8">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav
          aria-label="Principal"
          className="safe-pb fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper-raised/95 backdrop-blur-md lg:hidden"
        >
          <ul className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 pt-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-medium text-muted transition hover:bg-ink/5 hover:text-ink active:scale-[0.98]"
                >
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClientsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 20v-1.2A3.8 3.8 0 0 1 11.8 15h.4A3.8 3.8 0 0 1 16 18.8V20"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M4.5 20v-.8A3.2 3.2 0 0 1 7.7 16H8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="6.5" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function RecordsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="5"
        y="3.5"
        width="14"
        height="17"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8.5 8h7M8.5 12h7M8.5 16h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="6.5" cy="12" r="1.4" fill="currentColor" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
      <circle cx="17.5" cy="12" r="1.4" fill="currentColor" />
    </svg>
  );
}
