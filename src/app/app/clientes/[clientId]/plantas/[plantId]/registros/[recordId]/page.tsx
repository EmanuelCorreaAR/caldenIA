import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryShort } from "@/lib/categories";
import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/auth";
import { parseFormSchema } from "@/lib/templates";

export const dynamic = "force-dynamic";
export const metadata = { title: "Registro" };

export default async function RegistroDetallePage({
  params,
}: {
  params: Promise<{ clientId: string; plantId: string; recordId: string }>;
}) {
  const session = await requireTenantSession();
  const { clientId, plantId, recordId } = await params;

  const record = await prisma.formRecord.findFirst({
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
  });

  if (!record) notFound();

  const answers = (record.answers ?? {}) as Record<string, string | boolean>;
  const title =
    String(answers.titulo ?? answers.tema ?? "") ||
    record.template?.name ||
    "Registro";
  const isScan = Boolean(record.scanUrl);
  const isPdf = record.scanUrl?.toLowerCase().endsWith(".pdf");
  const schema = record.template
    ? parseFormSchema(record.template.schema)
    : null;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link
          href={`/app/clientes/${clientId}/plantas/${plantId}`}
          className="text-sm font-medium text-muted transition hover:text-ink"
        >
          ← {record.plant.name}
        </Link>
        <p className="mt-3 font-[family-name:var(--font-syne)] text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          {categoryShort(record.category)}
          {isScan ? " · Papel" : ""} · {record.plant.client.name}
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-ink">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {record.submittedAt
            ? record.submittedAt.toLocaleString("es-AR")
            : record.createdAt.toLocaleString("es-AR")}
          {record.signedBy ? ` · ${record.signedBy}` : ""}
        </p>
      </div>

      {isScan && record.scanUrl ? (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Escaneo
          </h2>
          {isPdf ? (
            <a
              href={record.scanUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-sm font-semibold text-accent underline underline-offset-2"
            >
              Abrir PDF
            </a>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-line bg-paper-raised">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={record.scanUrl}
                alt={title}
                className="max-h-[28rem] w-full object-contain"
              />
            </div>
          )}
          {answers.fecha ? (
            <p className="text-sm text-muted">
              <span className="font-medium text-ink">Fecha · </span>
              {String(answers.fecha)}
            </p>
          ) : null}
          {answers.notas ? (
            <div className="rounded-2xl border border-line bg-paper-raised px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                Notas
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink">
                {String(answers.notas)}
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      {!isScan && schema ? (
        <section className="space-y-3 rounded-2xl border border-line bg-paper-raised p-4">
          {schema.fields.map((field) => {
            const raw = answers[field.id];
            if (
              field.type === "signature" &&
              typeof raw === "string" &&
              raw.startsWith("data:image/")
            ) {
              return (
                <div
                  key={field.id}
                  className="border-b border-line/60 pb-3 last:border-0 last:pb-0"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                    {field.label}
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={raw}
                    alt={field.label}
                    className="mt-2 max-h-32 rounded-xl border border-line bg-white"
                  />
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
              <div
                key={field.id}
                className="border-b border-line/60 pb-3 last:border-0 last:pb-0"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {field.label}
                </div>
                <div className="mt-1 whitespace-pre-wrap text-sm text-ink">
                  {value}
                </div>
              </div>
            );
          })}
        </section>
      ) : null}

      {!isScan ? (
        <Link
          href={`/app/clientes/${clientId}/plantas/${plantId}/registros/${recordId}/export`}
          className="flex h-12 w-full items-center justify-center rounded-full bg-accent text-sm font-bold text-on-accent transition hover:bg-accent-strong"
        >
          Exportar con logo de la marca
        </Link>
      ) : null}
    </div>
  );
}
