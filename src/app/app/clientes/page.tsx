import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Clientes" };

export default async function ClientesPage() {
  const session = await requireTenantSession();

  const clients = await prisma.client.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { plants: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Clientes
          </h1>
          <p className="mt-1 text-sm text-muted">
            Clientes a cargo de {session.tenantName}.
          </p>
        </div>
        <Link
          href="/app/clientes/nuevo"
          className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-bold text-on-accent transition hover:bg-accent-strong"
        >
          Nuevo cliente
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-paper-raised px-4 py-12 text-center">
          <p className="font-[family-name:var(--font-syne)] text-lg font-semibold text-ink">
            Todavía no hay clientes
          </p>
          <p className="mt-2 text-sm text-muted">
            Cargá el primer cliente y después sus plantas.
          </p>
        </div>
      ) : (
        <ul className="grid gap-2 lg:grid-cols-2">
          {clients.map((client) => (
            <li key={client.id}>
              <Link
                href={`/app/clientes/${client.id}`}
                className="flex min-h-16 items-center justify-between gap-4 rounded-2xl border border-line bg-paper-raised px-4 py-4 transition hover:border-accent/35 active:scale-[0.99]"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold text-ink">
                    {client.name}
                  </div>
                  <div className="mt-1 text-sm text-muted">
                    {client.cuit ? `CUIT ${client.cuit} · ` : ""}
                    {client._count.plants}{" "}
                    {client._count.plants === 1 ? "planta" : "plantas"}
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
    </div>
  );
}
