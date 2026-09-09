import Link from "next/link";

export default function HomePage() {
  return (
    <div className="bg-field relative min-h-dvh overflow-hidden">
      <div aria-hidden className="bg-grid absolute inset-0" />
      <div aria-hidden className="scan-line" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-6 sm:px-8 sm:pt-8 lg:px-10">
        <div className="flex items-center gap-3">
          <span
            className="animate-calden-pulse size-2.5 rounded-full bg-accent"
            aria-hidden
          />
          <span className="font-[family-name:var(--font-syne)] text-xl font-bold tracking-tight text-ink">
            CaldenIA
          </span>
        </div>
        <span className="font-[family-name:var(--font-syne)] text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
          HSE · campo
        </span>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100dvh-5rem)] w-full max-w-6xl items-center gap-10 px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:pb-20 lg:pt-12">
        <div>
          <p className="animate-calden-rise mb-5 font-[family-name:var(--font-syne)] text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            San Luis · Cuyo
          </p>
          <h1 className="animate-calden-rise-delay max-w-3xl font-[family-name:var(--font-syne)] text-[clamp(3rem,11vw,5.75rem)] font-extrabold leading-[0.9] tracking-tight text-ink lg:text-[clamp(3.5rem,6vw,6.25rem)]">
            CaldenIA
          </h1>
          <p className="animate-calden-rise-late mt-6 max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg">
            Charlas, checklists y actas desde el celular. QR en planta, PDF al
            instante, portal listo para tu cliente.
          </p>
          <div className="animate-calden-rise-late mt-10">
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-8 text-base font-bold text-on-accent transition hover:bg-accent-strong hover:shadow-[0_0_32px_rgba(198,241,53,0.35)] active:scale-[0.98]"
            >
              Entrar al campo
            </Link>
          </div>
        </div>

        <aside
          aria-hidden
          className="relative hidden min-h-[28rem] overflow-hidden rounded-[2rem] border border-line/70 bg-paper-raised/50 p-8 lg:block"
        >
          <div className="bg-grid absolute inset-0 opacity-60" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="animate-calden-pulse size-2 rounded-full bg-accent" />
              <span className="font-[family-name:var(--font-syne)] text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                En planta
              </span>
            </div>
            <div>
              <p className="font-[family-name:var(--font-syne)] text-3xl font-bold leading-tight tracking-tight text-ink xl:text-4xl">
                Formularios.
                <br />
                Evidencia.
                <br />
                <span className="text-accent">Entrega.</span>
              </p>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
                Pensado para el profesional HSE: una mano en el celular, la otra
                en el activo.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["QR", "PDF", "Portal"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-line bg-void/50 px-3 py-4 text-center font-[family-name:var(--font-syne)] text-sm font-bold text-ink"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
