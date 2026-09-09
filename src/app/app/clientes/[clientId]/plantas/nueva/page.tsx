import Link from "next/link";
import { notFound } from "next/navigation";
import { createPlant } from "../../../../actions";
import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/auth";

export const metadata = { title: "Nueva planta" };

export default async function NuevaPlantaPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await requireTenantSession();
  const { clientId } = await params;
  const query = await searchParams;

  const client = await prisma.client.findFirst({
    where: { id: clientId, tenantId: session.tenantId },
  });
  if (!client) notFound();

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
          Nueva planta
        </h1>
        <p className="mt-1 text-sm text-muted">
          Establecimiento de {client.name}.
        </p>
      </div>

      {query.error ? (
        <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-ink">
          {query.error}
        </div>
      ) : null}

      <form action={createPlant} className="space-y-4">
        <input type="hidden" name="clientId" value={client.id} />
        <Field
          label="Nombre del establecimiento"
          name="name"
          required
          placeholder="Planta Villa Mercedes"
        />
        <Field
          label="Domicilio"
          name="address"
          placeholder="Calle, localidad, provincia"
        />
        <Field
          label="Nº establecimiento SRT"
          name="srtNumber"
          placeholder="Si aplica"
        />
        <Field
          label="Dotación"
          name="headcount"
          type="number"
          placeholder="Cantidad de personas"
        />
        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center rounded-full bg-accent text-sm font-bold text-on-accent transition hover:bg-accent-strong"
        >
          Guardar planta
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border-0 bg-void/60 px-4 text-base text-ink outline-none ring-1 ring-line transition placeholder:text-muted focus:ring-2 focus:ring-accent"
      />
    </label>
  );
}
