import { redirect } from "next/navigation";
import { PasswordInput } from "@/components/password-input";
import { getSession, homeForSession } from "@/lib/auth";
import { changePasswordFirstLogin } from "./actions";

export const metadata = { title: "Cambiar contraseña" };

export default async function CambiarClavePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (!session || session.kind !== "tenant") {
    redirect("/?next=/cambiar-clave");
  }
  if (!session.mustChangePassword) {
    redirect(homeForSession(session));
  }

  const params = await searchParams;

  return (
    <div className="bg-field relative min-h-dvh overflow-hidden">
      <div aria-hidden className="bg-grid absolute inset-0 opacity-70" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-12">
        <div className="inline-flex items-center gap-3">
          <span
            className="animate-calden-pulse size-2.5 rounded-full bg-accent"
            aria-hidden
          />
          <span className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-ink">
            CaldenIA
          </span>
        </div>

        <p className="mt-10 font-[family-name:var(--font-syne)] text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          Primer ingreso
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight text-ink">
          Cambiá tu contraseña
        </h1>
        <p className="mt-2 text-sm text-muted">
          Te dieron una clave temporal. Por seguridad, elegí una nueva antes de
          continuar.
        </p>

        <form
          action={changePasswordFirstLogin}
          className="mt-8 space-y-3 rounded-3xl border border-line/80 bg-paper-raised/80 p-5 backdrop-blur-md sm:p-6"
        >
          <PasswordInput
            name="current"
            required
            autoComplete="current-password"
            placeholder="Contraseña temporal"
            aria-label="Contraseña temporal"
          />
          <PasswordInput
            name="next"
            required
            autoComplete="new-password"
            placeholder="Nueva contraseña (mín. 8)"
            aria-label="Nueva contraseña"
          />
          <PasswordInput
            name="confirm"
            required
            autoComplete="new-password"
            placeholder="Repetir nueva contraseña"
            aria-label="Confirmar contraseña"
          />

          {params.error ? (
            <p className="pt-1 text-sm text-danger">{params.error}</p>
          ) : null}

          <button
            type="submit"
            className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-accent text-sm font-bold text-on-accent transition hover:bg-accent-strong active:scale-[0.99]"
          >
            Guardar y continuar
          </button>
        </form>
      </div>
    </div>
  );
}
