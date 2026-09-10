import { redirect } from "next/navigation";
import { loginAction } from "@/app/login/actions";
import { getSession, homeForSession } from "@/lib/auth";
import { PasswordInput } from "@/components/password-input";

export const metadata = { title: "Acceso" };

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const session = await getSession();
  if (session) {
    redirect(homeForSession(session));
  }

  const params = await searchParams;

  return (
    <div className="bg-field relative min-h-dvh overflow-hidden lg:grid lg:grid-cols-2">
      <div aria-hidden className="bg-grid absolute inset-0 opacity-70 lg:hidden" />
      <div aria-hidden className="scan-line lg:hidden" />

      <aside className="relative hidden overflow-hidden border-r border-line/60 lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <div aria-hidden className="bg-grid absolute inset-0 opacity-50" />
        <div aria-hidden className="scan-line" />
        <div className="relative z-10 inline-flex items-center gap-3">
          <span
            className="animate-calden-pulse size-2.5 rounded-full bg-accent"
            aria-hidden
          />
          <span className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-ink">
            CaldenIA
          </span>
        </div>
        <div className="relative z-10 max-w-md">
          <p className="font-[family-name:var(--font-syne)] text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            HSE · campo
          </p>
          <p className="mt-4 font-[family-name:var(--font-syne)] text-4xl font-bold leading-tight tracking-tight text-ink xl:text-5xl">
            Tu trabajo en planta, en orden.
          </p>
        </div>
      </aside>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-12 lg:mx-0 lg:max-w-none lg:px-16 xl:px-24">
        <div className="w-full lg:max-w-sm">
          <div className="inline-flex items-center gap-3 self-start lg:hidden">
            <span
              className="animate-calden-pulse size-2.5 rounded-full bg-accent"
              aria-hidden
            />
            <span className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-ink">
              CaldenIA
            </span>
          </div>

          <p className="mt-10 font-[family-name:var(--font-syne)] text-sm font-semibold uppercase tracking-[0.18em] text-accent lg:mt-0">
            Acceso
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Identificate
          </h1>

          <form
            action={loginAction}
            className="mt-10 space-y-3 rounded-3xl border border-line/80 bg-paper-raised/80 p-5 shadow-[0_0_0_1px_rgba(198,241,53,0.04)] backdrop-blur-md sm:p-6"
          >
            {params.next ? (
              <input type="hidden" name="next" value={params.next} />
            ) : null}

            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="Email"
              aria-label="Email"
              className="h-12 w-full rounded-2xl border-0 bg-void/60 px-4 text-base text-ink outline-none ring-1 ring-line transition placeholder:text-muted focus:ring-2 focus:ring-accent"
            />

            <PasswordInput
              name="password"
              required
              autoComplete="current-password"
            />

            {params.error ? (
              <p className="pt-1 text-sm text-danger">{params.error}</p>
            ) : null}

            <button
              type="submit"
              className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-accent text-sm font-bold text-on-accent transition hover:bg-accent-strong hover:shadow-[0_0_28px_rgba(198,241,53,0.3)] active:scale-[0.99]"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
