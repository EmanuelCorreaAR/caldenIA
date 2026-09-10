import { submitPaperScanRecord, submitPlantRecord } from "@/app/app/actions";
import { PlantFormFields } from "@/components/plant-form-fields";
import { ScanCaptureField } from "@/components/scan-capture-field";
import { RECORD_CATEGORIES, categoryShort } from "@/lib/categories";
import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/auth";
import { ensureCharlaTemplate, PAPER_SCAN_SLUG } from "@/lib/ensure-templates";
import { parseFormSchema } from "@/lib/templates";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nuevo registro" };

export default async function NuevoRegistroPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string; plantId: string }>;
  searchParams: Promise<{ error?: string; template?: string; modo?: string }>;
}) {
  const session = await requireTenantSession();
  const { clientId, plantId } = await params;
  const query = await searchParams;

  const plant = await prisma.plant.findFirst({
    where: {
      id: plantId,
      clientId,
      client: { tenantId: session.tenantId },
    },
    include: { client: true },
  });
  if (!plant) notFound();

  await ensureCharlaTemplate(session.tenantId);

  const templates = await prisma.formTemplate.findMany({
    where: {
      tenantId: session.tenantId,
      status: "READY",
      NOT: { slug: PAPER_SCAN_SLUG },
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const pickHref = `/app/clientes/${clientId}/plantas/${plantId}/registros/nueva`;
  const backHref = `/app/clientes/${clientId}/plantas/${plantId}`;
  const today = new Date().toISOString().slice(0, 10);
  const isPaper = query.modo === "papel";
  const selectedId = query.template?.trim() || "";
  const selected = selectedId
    ? templates.find((t) => t.id === selectedId)
    : undefined;

  if (isPaper) {
    return (
      <div className="mx-auto max-w-lg space-y-6 pb-4">
        <div>
          <Link
            href={pickHref}
            className="text-sm font-medium text-muted transition hover:text-ink"
          >
            ← Elegir tipo
          </Link>
          <p className="mt-3 font-[family-name:var(--font-syne)] text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Escaneo · {plant.client.name}
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-ink">
            Papel firmado
          </h1>
          <p className="mt-1 text-sm text-muted">
            Sacá una foto del papel o subí un escaneo/PDF ya armado.
          </p>
        </div>

        {query.error ? (
          <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-ink">
            {query.error}
          </div>
        ) : null}

        <form action={submitPaperScanRecord} className="space-y-4">
          <input type="hidden" name="clientId" value={clientId} />
          <input type="hidden" name="plantId" value={plantId} />

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-ink">Categoría</span>
            <select
              name="category"
              required
              defaultValue="CAPACITACION"
              className="h-12 w-full rounded-xl border-0 bg-void/60 px-4 text-base text-ink outline-none ring-1 ring-line focus:ring-2 focus:ring-accent"
            >
              {RECORD_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.short}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-ink">Título</span>
            <input
              name="titulo"
              required
              placeholder="Ej. Charla EPP · turno mañana"
              className="h-12 w-full rounded-xl border-0 bg-void/60 px-4 text-base text-ink outline-none ring-1 ring-line focus:ring-2 focus:ring-accent"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-ink">Fecha</span>
            <input
              type="date"
              name="fecha"
              required
              defaultValue={today}
              className="h-12 w-full rounded-xl border-0 bg-void/60 px-4 text-base text-ink outline-none ring-1 ring-line focus:ring-2 focus:ring-accent"
            />
          </label>

          <ScanCaptureField />

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-ink">Notas</span>
            <textarea
              name="notas"
              rows={3}
              placeholder="Opcional"
              className="w-full rounded-xl border-0 bg-void/60 px-4 py-3 text-base text-ink outline-none ring-1 ring-line focus:ring-2 focus:ring-accent"
            />
          </label>

          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center rounded-full bg-accent text-sm font-bold text-on-accent transition hover:bg-accent-strong active:scale-[0.99]"
          >
            Guardar escaneo
          </button>
        </form>
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="mx-auto max-w-lg space-y-6 pb-4">
        <div>
          <Link
            href={backHref}
            className="text-sm font-medium text-muted transition hover:text-ink"
          >
            ← {plant.name}
          </Link>
          <p className="mt-3 font-[family-name:var(--font-syne)] text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            {plant.client.name}
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-ink">
            Nuevo registro
          </h1>
          <p className="mt-1 text-sm text-muted">
            Completá un template digital o subí el escaneo del papel.
          </p>
        </div>

        {query.error ? (
          <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-ink">
            {query.error}
          </div>
        ) : null}

        <ul className="space-y-2">
          <li>
            <Link
              href={`${pickHref}?modo=papel`}
              className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-accent/35 bg-accent/10 px-4 py-3 transition hover:border-accent/60"
            >
              <div className="min-w-0">
                <div className="truncate font-semibold text-ink">
                  Escanear papel
                </div>
                <div className="text-xs text-muted">
                  Foto con el celular o archivo/PDF del formulario
                </div>
              </div>
              <span aria-hidden className="text-accent">
                →
              </span>
            </Link>
          </li>
          {templates.map((t) => (
            <li key={t.id}>
              <Link
                href={`${pickHref}?template=${t.id}`}
                className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-line bg-paper-raised px-4 py-3 transition hover:border-accent/35"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold text-ink">{t.name}</div>
                  <div className="text-xs text-muted">
                    {categoryShort(t.category)} · digital
                  </div>
                </div>
                <span aria-hidden className="text-accent">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {templates.length === 0 ? (
          <p className="text-center text-sm text-muted">
            Sin templates digitales.{" "}
            <Link
              href="/app/templates"
              className="font-semibold text-accent underline underline-offset-2"
            >
              Crear uno
            </Link>
          </p>
        ) : null}
      </div>
    );
  }

  const schema = parseFormSchema(selected.schema);

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-4">
      <div>
        <Link
          href={pickHref}
          className="text-sm font-medium text-muted transition hover:text-ink"
        >
          ← Elegir tipo
        </Link>
        <p className="mt-3 font-[family-name:var(--font-syne)] text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          {categoryShort(selected.category)} · {plant.client.name}
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-ink">
          {selected.name}
        </h1>
        <p className="mt-1 text-sm text-muted">{plant.name}</p>
      </div>

      {query.error ? (
        <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-ink">
          {query.error}
        </div>
      ) : null}

      <form action={submitPlantRecord} className="space-y-4">
        <input type="hidden" name="clientId" value={clientId} />
        <input type="hidden" name="plantId" value={plantId} />
        <input type="hidden" name="templateId" value={selected.id} />

        <PlantFormFields
          fields={schema.fields}
          defaults={{
            fecha: today,
            expositor: session.name,
            responsable: session.name,
          }}
        />

        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center rounded-full bg-accent text-sm font-bold text-on-accent transition hover:bg-accent-strong active:scale-[0.99]"
        >
          Guardar registro
        </button>
      </form>
    </div>
  );
}
