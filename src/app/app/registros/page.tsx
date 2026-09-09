import Link from "next/link";

export const metadata = { title: "Registros" };

export default function RegistrosPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-ink">
        Registros
      </h1>
      <p className="max-w-lg text-sm leading-relaxed text-muted">
        Acá van a vivir las charlas, checklists y actas por planta. Primero
        cargá clientes y establecimientos.
      </p>
      <Link
        href="/app/clientes"
        className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-bold text-on-accent"
      >
        Ir a clientes
      </Link>
    </div>
  );
}
