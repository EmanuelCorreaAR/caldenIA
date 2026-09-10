import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/auth";
import { parseFormSchema } from "@/lib/templates";
import { PrintButton } from "@/components/print-button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Exportar registro" };

export default async function ExportRegistroPage({
  params,
}: {
  params: Promise<{ clientId: string; plantId: string; recordId: string }>;
}) {
  const session = await requireTenantSession();
  const { clientId, plantId, recordId } = await params;

  const [tenant, record] = await Promise.all([
    prisma.tenant.findUniqueOrThrow({ where: { id: session.tenantId } }),
    prisma.formRecord.findFirst({
      where: {
        id: recordId,
        plantId,
        plant: {
          clientId,
          client: { tenantId: session.tenantId },
        },
      },
      include: {
        template: true,
        plant: { include: { client: true } },
      },
    }),
  ]);

  if (!record) notFound();
  if (record.scanUrl || !record.template) {
    redirect(
      `/app/clientes/${clientId}/plantas/${plantId}/registros/${recordId}`,
    );
  }

  const schema = parseFormSchema(record.template.schema);
  const answers = (record.answers ?? {}) as Record<string, string | boolean>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/app/clientes/${clientId}/plantas/${plantId}/registros/${recordId}`}
          className="text-sm font-medium text-muted transition hover:text-ink"
        >
          ← Volver al registro
        </Link>
        <PrintButton />
      </div>

      <article className="export-sheet rounded-2xl border border-line bg-white p-6 text-black sm:p-8">
        <header className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-5">
          <div className="flex items-center gap-3">
            {tenant.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tenant.logoUrl}
                alt=""
                className="h-14 w-14 object-contain"
              />
            ) : null}
            <div>
              <div className="text-lg font-bold tracking-tight text-neutral-900">
                {tenant.name}
              </div>
              {tenant.license ? (
                <div className="text-xs text-neutral-500">
                  Matrícula {tenant.license}
                </div>
              ) : null}
            </div>
          </div>
          <div className="text-right text-xs text-neutral-500">
            <div>CaldenIA</div>
            <div>
              {record.submittedAt
                ? record.submittedAt.toLocaleString("es-AR")
                : record.createdAt.toLocaleString("es-AR")}
            </div>
          </div>
        </header>

        <div className="mt-5">
          <h1 className="text-xl font-bold text-neutral-900">
            {record.template.name}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            {record.plant.client.name} · {record.plant.name}
            {record.plant.address ? ` · ${record.plant.address}` : ""}
          </p>
          {record.signedBy ? (
            <p className="mt-1 text-sm text-neutral-600">
              Registró: {record.signedBy}
            </p>
          ) : null}
        </div>

        <dl className="mt-6 space-y-4">
          {schema.fields.map((field) => {
            const raw = answers[field.id];
            if (
              field.type === "signature" &&
              typeof raw === "string" &&
              raw.startsWith("data:image/")
            ) {
              return (
                <div key={field.id} className="border-b border-neutral-100 pb-3">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                    {field.label}
                  </dt>
                  <dd className="mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={raw}
                      alt={field.label}
                      className="max-h-28 border border-neutral-200 bg-white"
                    />
                  </dd>
                </div>
              );
            }
            const value =
              typeof raw === "boolean"
                ? raw
                  ? "Sí"
                  : "No"
                : String(raw ?? "—") || "—";
            return (
              <div key={field.id} className="border-b border-neutral-100 pb-3">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  {field.label}
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-neutral-900">
                  {value}
                </dd>
              </div>
            );
          })}
        </dl>

        <footer className="mt-8 grid grid-cols-2 gap-8 pt-6 text-sm text-neutral-600">
          <div>
            <div className="border-b border-neutral-400 pb-10" />
            <div className="mt-2 text-xs">Firma responsable</div>
          </div>
          <div>
            <div className="border-b border-neutral-400 pb-10" />
            <div className="mt-2 text-xs">Aclaración</div>
          </div>
        </footer>
      </article>

      <p className="no-print text-xs text-muted">
        En el diálogo de impresión elegí “Guardar como PDF” para descargarlo.
      </p>
    </div>
  );
}
