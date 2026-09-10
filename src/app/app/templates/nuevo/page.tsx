import Link from "next/link";
import { createTemplateFromImage } from "../actions";
import { RECORD_CATEGORIES } from "@/lib/categories";

export const metadata = { title: "Template desde imagen" };

export default async function NuevoTemplatePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link
          href="/app/templates"
          className="text-sm font-medium text-muted transition hover:text-ink"
        >
          ← Templates
        </Link>
        <h1 className="mt-3 font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-ink">
          Subir formato
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Foto o PDF del formulario. Elegí la categoría (capacitación, estudio,
          etc.) y revisamos el schema.
        </p>
      </div>

      {params.error ? (
        <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-ink">
          {params.error}
        </div>
      ) : null}

      <form
        action={createTemplateFromImage}
        className="space-y-4 rounded-2xl border border-line bg-paper-raised p-5"
      >
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-ink">Categoría</span>
          <select
            name="category"
            defaultValue="CAPACITACION"
            className="h-12 w-full rounded-xl border-0 bg-void/60 px-4 text-base text-ink outline-none ring-1 ring-line focus:ring-2 focus:ring-accent"
          >
            {RECORD_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">Archivo</span>
          <input
            type="file"
            name="file"
            required
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-bold file:text-on-accent"
          />
        </label>
        <p className="text-xs text-muted">JPG, PNG, WEBP o PDF · máx. 8 MB</p>
        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center rounded-full bg-accent text-sm font-bold text-on-accent transition hover:bg-accent-strong"
        >
          Interpretar y crear borrador
        </button>
      </form>
    </div>
  );
}
