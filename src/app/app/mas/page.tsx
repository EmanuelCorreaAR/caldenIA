import { requireTenantSession } from "@/lib/auth";

export const metadata = { title: "Más" };

export default async function MasPage() {
  const session = await requireTenantSession();

  return (
    <div className="space-y-4">
      <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-ink">
        Más
      </h1>
      <div className="rounded-2xl border border-line bg-paper-raised px-4 py-4">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Estudio
        </div>
        <div className="mt-2 font-semibold text-ink">{session.tenantName}</div>
        <div className="mt-1 text-sm text-muted">
          {session.name} · {session.email} · {session.role}
        </div>
      </div>
      <p className="text-sm text-muted">
        Templates, portal del cliente y ajustes llegan en las próximas
        iteraciones.
      </p>
    </div>
  );
}
