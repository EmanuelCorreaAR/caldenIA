import Link from "next/link";
import { notFound } from "next/navigation";
import { PasswordInput } from "@/components/password-input";
import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/auth";
import {
  createClientAccess,
  removeClientAccess,
} from "@/app/app/clientes/access-actions";

export const dynamic = "force-dynamic";

export default async function ClienteAccesosPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const session = await requireTenantSession();
  const { clientId } = await params;
  const query = await searchParams;
  const isOwner = session.role === "OWNER";

  const client = await prisma.client.findFirst({
    where: { id: clientId, tenantId: session.tenantId },
  });
  if (!client) notFound();

  const accesses = await prisma.user.findMany({
    where: { tenantId: session.tenantId, role: "CLIENT", clientId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link
          href={`/app/clientes/${client.id}`}
          className="text-sm font-medium text-muted transition hover:text-ink"
        >
          ← {client.name}
        </Link>
        <h1 className="mt-3 font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-ink">
          Accesos al portal
        </h1>
        <p className="mt-1 text-sm text-muted">
          Personas de {client.name} que entran al portal y solo ven las plantas
          y registros de este cliente.
        </p>
      </div>

      {query.error ? (
        <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-ink">
          {query.error}
        </div>
      ) : null}
      {query.ok ? (
        <div className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-ink">
          Accesos actualizados.
        </div>
      ) : null}

      {isOwner ? (
        <form
          action={createClientAccess}
          className="space-y-3 rounded-2xl border border-line bg-paper-raised p-5"
        >
          <input type="hidden" name="clientId" value={client.id} />
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Nuevo acceso
          </h2>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-ink">Nombre</span>
            <input
              name="name"
              required
              className="h-11 w-full rounded-xl border-0 bg-void/60 px-3 text-base text-ink outline-none ring-1 ring-line focus:ring-2 focus:ring-accent"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-ink">Email de acceso</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="off"
              className="h-11 w-full rounded-xl border-0 bg-void/60 px-3 text-base text-ink outline-none ring-1 ring-line focus:ring-2 focus:ring-accent"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-ink">Contraseña</span>
            <PasswordInput
              name="password"
              required
              autoComplete="new-password"
              placeholder="mínimo 8 caracteres"
              inputClassName="h-11 w-full rounded-xl border-0 bg-void/60 py-0 pl-3 pr-12 text-base text-ink outline-none ring-1 ring-line focus:ring-2 focus:ring-accent"
            />
            <span className="block text-xs text-muted">
              La definís vos y se la comunicás al contacto del cliente.
            </span>
          </label>
          <button
            type="submit"
            className="flex h-11 w-full items-center justify-center rounded-full bg-accent text-sm font-bold text-on-accent transition hover:bg-accent-strong"
          >
            Dar acceso
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted">
          Solo el owner puede crear o quitar accesos.
        </p>
      )}

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Accesos activos · {accesses.length}
        </h2>
        {accesses.length === 0 ? (
          <p className="text-sm text-muted">Todavía no hay accesos para este cliente.</p>
        ) : (
          <ul className="space-y-2">
            {accesses.map((u) => (
              <li
                key={u.id}
                className="flex items-start justify-between gap-3 rounded-2xl border border-line bg-paper-raised px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold text-ink">{u.name}</div>
                  <div className="truncate text-xs text-muted">{u.email}</div>
                </div>
                {isOwner ? (
                  <form action={removeClientAccess}>
                    <input type="hidden" name="clientId" value={client.id} />
                    <input type="hidden" name="userId" value={u.id} />
                    <button
                      type="submit"
                      className="shrink-0 text-xs font-semibold text-muted underline underline-offset-2 transition hover:text-danger"
                    >
                      Quitar
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
