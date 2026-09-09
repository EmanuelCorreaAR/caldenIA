import Link from "next/link";
import { TenantStatus } from "@prisma/client";
import { setTenantStatus } from "../actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

const statusLabel: Record<TenantStatus, string> = {
  PENDING: "Pendiente",
  ACTIVE: "Activo",
  SUSPENDED: "Suspendido",
};

const statusClass: Record<TenantStatus, string> = {
  PENDING: "bg-line text-muted",
  ACTIVE: "bg-accent/15 text-accent-strong",
  SUSPENDED: "bg-danger/15 text-danger",
};

export default async function AdminHomePage() {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: {
        where: { role: "OWNER" },
        take: 1,
      },
      _count: { select: { users: true, clients: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-syne)] text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Tenants
          </h1>
          <p className="mt-1 text-sm text-muted">
            Habilitá estudios HSE y su primer usuario OWNER.
          </p>
        </div>
        <Link
          href="/admin/nuevo"
          className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-bold text-on-accent transition hover:bg-accent-strong"
        >
          Nuevo tenant
        </Link>
      </div>

      {tenants.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-paper-raised px-4 py-10 text-center">
          <p className="text-sm text-muted">Todavía no hay estudios cargados.</p>
          <Link
            href="/admin/nuevo"
            className="mt-3 inline-block text-sm font-semibold text-ink underline underline-offset-2"
          >
            Crear el primero
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {tenants.map((tenant) => {
            const owner = tenant.users[0];
            return (
              <li
                key={tenant.id}
                className="rounded-2xl border border-line bg-paper-raised p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-ink">{tenant.name}</h2>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClass[tenant.status]}`}
                      >
                        {statusLabel[tenant.status]}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted">
                      /{tenant.slug}
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      Owner:{" "}
                      {owner ? (
                        <>
                          {owner.name} · {owner.email}
                        </>
                      ) : (
                        "sin owner"
                      )}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {tenant._count.users} usuarios · {tenant._count.clients}{" "}
                      clientes
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {tenant.status !== "ACTIVE" ? (
                      <StatusButton
                        tenantId={tenant.id}
                        status="ACTIVE"
                        label="Activar"
                      />
                    ) : null}
                    {tenant.status !== "SUSPENDED" ? (
                      <StatusButton
                        tenantId={tenant.id}
                        status="SUSPENDED"
                        label="Suspender"
                      />
                    ) : null}
                    {tenant.status === "SUSPENDED" ? (
                      <StatusButton
                        tenantId={tenant.id}
                        status="PENDING"
                        label="A pendiente"
                      />
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StatusButton({
  tenantId,
  status,
  label,
}: {
  tenantId: string;
  status: TenantStatus;
  label: string;
}) {
  return (
    <form action={setTenantStatus}>
      <input type="hidden" name="tenantId" value={tenantId} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className="rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-ink/25"
      >
        {label}
      </button>
    </form>
  );
}
