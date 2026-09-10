import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireClientSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PortalPlantPage({
  params,
}: {
  params: Promise<{ plantId: string }>;
}) {
  const session = await requireClientSession();
  const { plantId } = await params;

  const plant = await prisma.plant.findFirst({
    where: {
      id: plantId,
      clientId: session.clientId,
      client: { tenantId: session.tenantId },
    },
    include: {
      client: { select: { name: true } },
      records: {
        orderBy: { createdAt: "desc" },
        include: { template: { select: { name: true } } },
      },
    },
  });
  if (!plant) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/portal"
          className="text-sm font-medium text-muted transition hover:text-ink"
        >
          ← Portal
        </Link>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          {plant.client.name}
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-ink">
          {plant.name}
        </h1>
        {plant.address ? (
          <p className="mt-1 text-sm text-muted">{plant.address}</p>
        ) : null}
      </div>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Registros
        </h2>
        {plant.records.length === 0 ? (
          <p className="text-sm text-muted">Sin registros en esta planta.</p>
        ) : (
          <ul className="space-y-2">
            {plant.records.map((record) => (
              <li key={record.id}>
                <Link
                  href={`/portal/plantas/${plant.id}/registros/${record.id}`}
                  className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-line bg-paper-raised px-4 py-3 transition hover:border-accent/35"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-ink">
                      {record.template?.name ??
                        ((record.answers as Record<string, string>)?.titulo ||
                          "Escaneo")}
                    </div>
                    <div className="text-xs text-muted">
                      {(
                        record.submittedAt ?? record.createdAt
                      ).toLocaleDateString("es-AR")}
                      {record.signedBy ? ` · ${record.signedBy}` : ""}
                    </div>
                  </div>
                  <span aria-hidden className="text-accent">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
