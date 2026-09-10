import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ plantId: string }>;
}) {
  const { plantId } = await params;
  const plant = await prisma.plant.findUnique({ where: { id: plantId } });
  return { title: plant?.name ?? "Planta" };
}

export default async function PlantaDetallePage({
  params,
}: {
  params: Promise<{ clientId: string; plantId: string }>;
}) {
  const session = await requireTenantSession();
  const { clientId, plantId } = await params;

  const plant = await prisma.plant.findFirst({
    where: {
      id: plantId,
      clientId,
      client: { tenantId: session.tenantId },
    },
    include: {
      client: true,
      _count: { select: { records: true, assets: true } },
      records: {
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { template: true },
      },
    },
  });

  if (!plant) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/app/clientes/${plant.clientId}`}
          className="text-sm font-medium text-muted transition hover:text-ink"
        >
          ← {plant.client.name}
        </Link>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-[family-name:var(--font-syne)] text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Planta
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {plant.name}
            </h1>
            <p className="mt-2 text-sm text-muted">{plant.client.name}</p>
          </div>
          <Link
            href={`/app/clientes/${clientId}/plantas/${plantId}/registros/nueva`}
            className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-bold text-on-accent transition hover:bg-accent-strong"
          >
            Nuevo registro
          </Link>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Meta label="Domicilio" value={plant.address ?? "—"} />
        <Meta label="Nº SRT" value={plant.srtNumber ?? "—"} />
        <Meta
          label="Dotación"
          value={plant.headcount != null ? String(plant.headcount) : "—"}
        />
        <Meta label="Activos" value={String(plant._count.assets)} />
        <Meta label="Registros" value={String(plant._count.records)} />
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-syne)] text-sm font-semibold uppercase tracking-[0.14em] text-muted">
          Últimos registros
        </h2>

        {plant.records.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-paper-raised px-4 py-10 text-center">
            <p className="text-sm text-muted">
              Todavía no hay registros en esta planta.
            </p>
            <Link
              href={`/app/clientes/${clientId}/plantas/${plantId}/registros/nueva`}
              className="mt-4 inline-block text-sm font-semibold text-accent underline underline-offset-2"
            >
              Crear el primero
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {plant.records.map((record) => {
              const answers = (record.answers ?? {}) as Record<string, string>;
              const tema =
                answers.titulo ||
                answers.tema ||
                record.template?.name ||
                "Registro";
              return (
                <li key={record.id}>
                  <Link
                    href={`/app/clientes/${clientId}/plantas/${plantId}/registros/${record.id}`}
                    className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-line bg-paper-raised px-4 py-3 transition hover:border-accent/35"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-ink">
                        {tema}
                      </div>
                      <div className="text-xs text-muted">
                        {record.template?.name ?? "Escaneo papel"}
                        {record.scanUrl ? " · papel" : ""}
                        {" · "}
                        {record.submittedAt
                          ? record.submittedAt.toLocaleDateString("es-AR")
                          : record.createdAt.toLocaleDateString("es-AR")}
                        {record.signedBy ? ` · ${record.signedBy}` : ""}
                      </div>
                    </div>
                    <span aria-hidden className="text-accent">
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-paper-raised px-4 py-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </div>
      <div className="mt-2 break-words text-sm font-medium text-ink">{value}</div>
    </div>
  );
}
