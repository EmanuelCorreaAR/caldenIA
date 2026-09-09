import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppHomePage() {
  const session = await requireTenantSession();

  const [clientCount, plantCount, recordCount] = await Promise.all([
    prisma.client.count({ where: { tenantId: session.tenantId } }),
    prisma.plant.count({
      where: { client: { tenantId: session.tenantId } },
    }),
    prisma.formRecord.count({
      where: {
        plant: { client: { tenantId: session.tenantId } },
        status: { in: ["DRAFT", "SUBMITTED"] },
      },
    }),
  ]);

  const recentClients = await prisma.client.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { updatedAt: "desc" },
    take: 4,
    include: { _count: { select: { plants: true } } },
  });

  const shortcuts = [
    {
      href: "/app/clientes",
      title: "Clientes",
      body: "Empresas y plantas a cargo",
    },
    {
      href: "/app/registros",
      title: "Registros",
      body: "Charlas, checklists y actas",
    },
    {
      href: "/app/clientes/nuevo",
      title: "Alta rápida",
      body: "Sumar una empresa nueva",
    },
  ];

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Hoy en planta
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          {session.tenantName}: clientes, plantas y lo que viene en campo.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3 lg:gap-4">
        <Stat label="Clientes" value={String(clientCount)} />
        <Stat label="Plantas" value={String(plantCount)} />
        <Stat label="Registros abiertos" value={String(recordCount)} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
            Clientes recientes
          </h2>
          <Link
            href="/app/clientes"
            className="text-sm font-semibold text-accent transition hover:text-accent-strong"
          >
            Ver todos
          </Link>
        </div>
        {recentClients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-paper-raised px-4 py-8 text-center">
            <p className="text-sm text-muted">Todavía no cargaste empresas.</p>
            <Link
              href="/app/clientes/nuevo"
              className="mt-3 inline-block text-sm font-semibold text-accent underline underline-offset-2"
            >
              Crear el primer cliente
            </Link>
          </div>
        ) : (
          <ul className="grid gap-2 lg:grid-cols-2">
            {recentClients.map((client) => (
              <li key={client.id}>
                <Link
                  href={`/app/clientes/${client.id}`}
                  className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-line bg-paper-raised px-4 py-3 transition hover:border-accent/35"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-ink">
                      {client.name}
                    </div>
                    <div className="text-xs text-muted">
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
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
          Accesos
        </h2>
        <ul className="grid gap-2 lg:grid-cols-3">
          {shortcuts.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex min-h-16 items-center justify-between gap-4 rounded-2xl border border-line bg-paper-raised px-4 py-3 transition hover:border-accent/30 active:scale-[0.99]"
              >
                <div>
                  <div className="font-semibold text-ink">{item.title}</div>
                  <div className="text-sm text-muted">{item.body}</div>
                </div>
                <span aria-hidden className="text-accent">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-paper-raised px-4 py-4">
      <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
        {label}
      </div>
      <div className="mt-2 font-[family-name:var(--font-syne)] text-3xl font-bold text-ink">
        {value}
      </div>
    </div>
  );
}
