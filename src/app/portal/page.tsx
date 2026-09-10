import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireClientSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Portal" };

export default async function PortalHomePage() {
  const session = await requireClientSession();

  const client = await prisma.client.findFirst({
    where: { id: session.clientId, tenantId: session.tenantId },
    include: {
      plants: {
        orderBy: { name: "asc" },
        include: {
          _count: { select: { records: true } },
          records: {
            orderBy: { createdAt: "desc" },
            take: 8,
            include: { template: { select: { name: true, category: true } } },
          },
        },
      },
    },
  });

  if (!client) {
    return (
      <p className="text-sm text-muted">
        No se encontró la empresa asociada a tu acceso. Contactá a{" "}
        {session.tenantName}.
      </p>
    );
  }

  const recent = client.plants.flatMap((p) =>
    p.records.map((r) => ({ ...r, plantName: p.name, plantId: p.id })),
  );
  recent.sort(
    (a, b) =>
      (b.submittedAt ?? b.createdAt).getTime() -
      (a.submittedAt ?? a.createdAt).getTime(),
  );
  const recentSlice = recent.slice(0, 10);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-ink">
          {client.name}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Documentación HSE que {session.tenantName} gestiona para tu empresa.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Plantas
        </h2>
        {client.plants.length === 0 ? (
          <p className="text-sm text-muted">Todavía no hay plantas cargadas.</p>
        ) : (
          <ul className="space-y-2">
            {client.plants.map((plant) => (
              <li key={plant.id}>
                <Link
                  href={`/portal/plantas/${plant.id}`}
                  className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-line bg-paper-raised px-4 py-3 transition hover:border-accent/35"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-ink">
                      {plant.name}
                    </div>
                    <div className="text-xs text-muted">
                      {plant._count.records}{" "}
                      {plant._count.records === 1 ? "registro" : "registros"}
                      {plant.address ? ` · ${plant.address}` : ""}
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

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Últimos registros
        </h2>
        {recentSlice.length === 0 ? (
          <p className="text-sm text-muted">Sin registros todavía.</p>
        ) : (
          <ul className="space-y-2">
            {recentSlice.map((record) => (
              <li key={record.id}>
                <Link
                  href={`/portal/plantas/${record.plantId}/registros/${record.id}`}
                  className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-line bg-paper-raised px-4 py-3 transition hover:border-accent/35"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-ink">
                      {record.template?.name ??
                        ((record.answers as Record<string, string>)?.titulo ||
                          "Escaneo")}
                    </div>
                    <div className="text-xs text-muted">
                      {record.plantName}
                      {" · "}
                      {(
                        record.submittedAt ?? record.createdAt
                      ).toLocaleDateString("es-AR")}
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
