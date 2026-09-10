import Link from "next/link";
import { createTenantWithOwner } from "../../actions";
import { PasswordInput } from "@/components/password-input";

export const metadata = { title: "Nuevo tenant" };

export default async function NewTenantPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="text-sm font-medium text-muted transition hover:text-ink"
        >
          ← Tenants
        </Link>
        <h1 className="mt-3 font-[family-name:var(--font-syne)] text-2xl font-semibold tracking-tight text-ink">
          Habilitar estudio
        </h1>
        <p className="mt-1 text-sm text-muted">
          Crea la marca (tenant) y su primer usuario OWNER. Ese owner entra en `/`
          y en el primer ingreso debe cambiar la contraseña temporal; después da
          accesos de portal a sus empresas cliente.
        </p>
      </div>

      {params.error ? (
        <div className="rounded-2xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-ink">
          {params.error}
        </div>
      ) : null}

      <form
        action={createTenantWithOwner}
        className="space-y-4 rounded-2xl border border-line bg-paper-raised p-5"
      >
        <Field
          label="Nombre del estudio"
          name="name"
          required
          placeholder="Higiene SRL San Luis"
        />
        <Field
          label="Slug (opcional)"
          name="slug"
          placeholder="higiene-san-luis"
          hint="URL interna. Si lo dejás vacío se genera del nombre."
        />
        <Field label="Matrícula / licencia (opcional)" name="license" />
        <Field
          label="Nombre del owner"
          name="ownerName"
          required
          placeholder="Ana Pérez"
        />
        <Field
          label="Email del owner"
          name="ownerEmail"
          type="email"
          required
          placeholder="ana@estudio.com"
        />
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-ink">
            Contraseña inicial del owner
          </span>
          <PasswordInput
            name="ownerPassword"
            required
            autoComplete="new-password"
            placeholder="mínimo 8 caracteres"
            inputClassName="h-12 w-full rounded-xl border border-line bg-paper py-0 pl-3 pr-12 text-base text-ink outline-none ring-accent focus:ring-2"
          />
          <span className="block text-xs text-muted">
            La usa para entrar en el panel del estudio.
          </span>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-ink">Notas internas</span>
          <textarea
            name="notes"
            rows={3}
            className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-base text-ink outline-none ring-accent focus:ring-2"
            placeholder="Cómo llegó, plan, etc."
          />
        </label>

        <label className="flex min-h-12 items-center gap-3 rounded-xl border border-line bg-paper px-3">
          <input
            type="checkbox"
            name="activate"
            defaultChecked
            className="size-4 accent-[var(--accent-strong)]"
          />
          <span className="text-sm text-ink">Activar ahora (status ACTIVE)</span>
        </label>

        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center rounded-full bg-accent text-sm font-bold text-on-accent transition hover:bg-accent-strong sm:w-auto sm:px-8"
        >
          Crear tenant + owner
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
  hint,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  type?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-line bg-paper px-3 text-base text-ink outline-none ring-accent focus:ring-2"
      />
      {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}
