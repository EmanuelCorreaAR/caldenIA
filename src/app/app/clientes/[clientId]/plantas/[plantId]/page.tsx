import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clientId: string; plantId: string }>;
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
        <p className="mt-3 font-[family-name:var(--font-syne)] text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          Planta
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {plant.name}
        </h1>
        <p className="mt-2 text-sm text-muted">{plant.client.name}</p>
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

      <section className="rounded-2xl border border-line bg-paper-raised p-5">
        <h2 className="font-[family-name:var(--font-syne)] text-sm font-semibold uppercase tracking-[0.14em] text-muted">
          Próximo
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Acá van a vivir los activos con QR, charlas de 5 minutos y el baúl de
          PDFs de esta planta.
        </p>
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
