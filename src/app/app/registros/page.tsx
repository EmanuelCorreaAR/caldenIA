import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/auth";
import { categoryShort } from "@/lib/categories";
import type { RecordCategory } from "@prisma/client";
import { RegistrosClientFilter } from "./client-filter";

export const dynamic = "force-dynamic";
export const metadata = { title: "Registros" };

export default async function RegistrosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; cliente?: string }>;
}) {
  const session = await requireTenantSession();
  const params = await searchParams;
  const filter = params.categoria as RecordCategory | undefined;
  const clientId = params.cliente || undefined;

  const clients = await prisma.client.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const validClientId =
    clientId && clients.some((c) => c.id === clientId) ? clientId : undefined;

  const records = await prisma.formRecord.findMany({
    where: {
      plant: {
        client: {
          tenantId: session.tenantId,
          ...(validClientId ? { id: validClientId } : {}),
        },
      },
      ...(filter ? { category: filter } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      template: true,
      plant: { include: { client: true } },
    },
  });

  function categoryHref(categoria?: RecordCategory) {
    const q = new URLSearchParams();
    if (categoria) q.set("categoria", categoria);
    if (validClientId) q.set("cliente", validClientId);
    const s = q.toString();
    return s ? `/app/registros?${s}` : "/app/registros";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-ink">
          Registros
        </h1>
        <p className="mt-1 text-sm text-muted">
          Capacitaciones, estudios e inspecciones de todas tus plantas.
        </p>
      </div>

      {clients.length > 1 ? (
        <RegistrosClientFilter
          clients={clients}
          selectedClientId={validClientId}
          categoria={filter}
        />
      ) : null}

      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterChip href={categoryHref()} active={!filter} label="Todos" />
        {(
          [
            "CAPACITACION",
            "ESTUDIO",
            "INSPECCION",
            "ENTREGA_EPP",
            "MEDICION",
            "OTRO",
          ] as RecordCategory[]
        ).map((c) => (
          <FilterChip
            key={c}
            href={categoryHref(c)}
            active={filter === c}
            label={categoryShort(c)}
          />
        ))}
      </div>

      {records.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-paper-raised px-4 py-10 text-center">
          <p className="text-sm text-muted">
            {filter || validClientId
              ? "No hay registros con ese filtro."
              : "Todavía no hay registros. Entrá a una planta y cargá uno."}
          </p>
          <Link
            href="/app/clientes"
            className="mt-4 inline-block text-sm font-semibold text-accent underline underline-offset-2"
          >
            Ir a clientes
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {records.map((record) => {
            const answers = (record.answers ?? {}) as Record<string, string>;
            const tema =
              answers.titulo ||
              answers.tema ||
              record.template?.name ||
              "Registro";
            return (
              <li key={record.id}>
                <Link
                  href={`/app/clientes/${record.plant.clientId}/plantas/${record.plantId}/registros/${record.id}`}
                  className="flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-line bg-paper-raised px-4 py-3 transition hover:border-accent/35"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-ink">{tema}</div>
                    <div className="mt-1 truncate text-sm text-muted">
                      {categoryShort(record.category)}
                      {record.scanUrl ? " · Papel" : ""} ·{" "}
                      {record.plant.client.name} · {record.plant.name}
                      {record.submittedAt
                        ? ` · ${record.submittedAt.toLocaleDateString("es-AR")}`
                        : ""}
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
    </div>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-accent text-on-accent"
          : "border border-line bg-paper-raised text-muted hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}
