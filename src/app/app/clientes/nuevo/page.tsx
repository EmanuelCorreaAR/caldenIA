import Link from "next/link";
import { createClient } from "../../actions";

export const metadata = { title: "Nuevo cliente" };

export default async function NuevoClientePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link
          href="/app/clientes"
          className="text-sm font-medium text-muted transition hover:text-ink"
        >
          ← Clientes
        </Link>
        <h1 className="mt-3 font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-ink">
          Nuevo cliente
        </h1>
        <p className="mt-1 text-sm text-muted">
          Cliente al que le brindás el servicio HSE. Después sumás plantas.
        </p>
      </div>

      {params.error ? (
        <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-ink">
          {params.error}
        </div>
      ) : null}

      <form action={createClient} className="space-y-4" autoComplete="off">
        <Field
          label="Razón social / nombre"
          name="name"
          required
          placeholder="Acme Industrial S.A."
          autoComplete="organization"
        />
        <Field
          label="CUIT"
          name="cuit"
          placeholder="30-12345678-9"
          autoComplete="off"
        />
        <Field
          label="ART"
          name="art"
          placeholder="Nombre de la ART"
          autoComplete="off"
        />
        <Field
          label="Contacto administrativo"
          name="contact"
          placeholder="nombre · teléfono · email"
          autoComplete="off"
        />
        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center rounded-full bg-accent text-sm font-bold text-on-accent transition hover:bg-accent-strong"
        >
          Guardar cliente
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-12 w-full rounded-xl border-0 bg-void/60 px-4 text-base text-ink outline-none ring-1 ring-line transition placeholder:text-muted focus:ring-2 focus:ring-accent"
      />
    </label>
  );
}
