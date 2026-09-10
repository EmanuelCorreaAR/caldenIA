import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  return { title: client?.name ?? "Cliente" };
}

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const session = await requireTenantSession();
  const { clientId } = await params;

  const client = await prisma.client.findFirst({
    where: { id: clientId, tenantId: session.tenantId },
    include: {
      plants: { orderBy: { name: "asc" } },
    },
  });

  if (!client) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/app/clientes"
          className="text-sm font-medium text-muted transition hover:text-ink"
        >
          ← Clientes
        </Link>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-[family-name:var(--font-syne)] text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Cliente
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {client.name}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/app/clientes/${client.id}/accesos`}
              className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-paper-raised px-5 text-sm font-semibold text-ink transition hover:border-accent/40"
            >
              Accesos portal
            </Link>
            <Link
              href={`/app/clientes/${client.id}/plantas/nueva`}
              className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-bold text-on-accent transition hover:bg-accent-strong"
            >
              Nueva planta
            </Link>
          </div>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <Meta label="CUIT" value={client.cuit ?? "—"} />
        <Meta label="ART" value={client.art ?? "—"} />
        <Meta label="Contacto" value={client.contact ?? "—"} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-[family-name:var(--font-syne)] text-sm font-semibold uppercase tracking-[0.14em] text-muted">
            Plantas · {client.plants.length}
          </h2>
        </div>

        {client.plants.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-paper-raised px-4 py-10 text-center">
            <p className="text-sm text-muted">
              Este cliente todavía no tiene establecimientos.
            </p>
            <Link
              href={`/app/clientes/${client.id}/plantas/nueva`}
              className="mt-4 inline-block text-sm font-semibold text-accent underline underline-offset-2"
            >
              Agregar la primera planta
            </Link>
          </div>
        ) : (
          <ul className="grid gap-2 lg:grid-cols-2">
            {client.plants.map((plant) => (
              <li key={plant.id}>
                <Link
                  href={`/app/clientes/${client.id}/plantas/${plant.id}`}
                  className="flex min-h-16 items-center justify-between gap-4 rounded-2xl border border-line bg-paper-raised px-4 py-4 transition hover:border-accent/35 active:scale-[0.99]"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-ink">
                      {plant.name}
                    </div>
                    <div className="mt-1 truncate text-sm text-muted">
                      {plant.address || "Sin domicilio cargado"}
                      {plant.headcount != null
                        ? ` · ${plant.headcount} pers.`
                        : ""}
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
