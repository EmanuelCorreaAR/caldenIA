import Link from "next/link";
import { LogoUpload } from "@/components/logo-upload";
import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/auth";
import { updateTenantBranding } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Marca" };

export default async function EstudioPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const session = await requireTenantSession();
  const params = await searchParams;

  const tenant = await prisma.tenant.findUniqueOrThrow({
    where: { id: session.tenantId },
  });

  const canEdit = session.role === "OWNER" || session.role === "TECH";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-ink">
          Marca
        </h1>
        <p className="mt-1 text-sm text-muted">
          Quién brinda el servicio HSE: nombre, matrícula y logo en los PDF.
          Puede ser una persona o un equipo.
        </p>
      </div>

      {params.error ? (
        <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-ink">
          {params.error}
        </div>
      ) : null}
      {params.ok ? (
        <div className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-ink">
          Marca guardada.
        </div>
      ) : null}

      {canEdit ? (
        <form action={updateTenantBranding} className="space-y-4">
          <div className="rounded-2xl border border-line bg-paper-raised p-5">
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-col items-center gap-1.5">
                <LogoUpload
                  currentUrl={tenant.logoUrl}
                  tenantName={tenant.name}
                  canEdit
                />
                <p className="text-center text-[10px] leading-tight text-muted">
                  JPG, PNG o WEBP · máx. 2 MB
                </p>
              </div>
              <div className="w-full space-y-3">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-ink">
                    Nombre de la marca
                  </span>
                  <input
                    name="name"
                    required
                    defaultValue={tenant.name}
                    className="h-11 w-full rounded-xl border-0 bg-void/60 px-3 text-base text-ink outline-none ring-1 ring-line focus:ring-2 focus:ring-accent"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-ink">Matrícula</span>
                  <input
                    name="license"
                    defaultValue={tenant.license ?? ""}
                    placeholder="Opcional"
                    className="h-11 w-full rounded-xl border-0 bg-void/60 px-3 text-base text-ink outline-none ring-1 ring-line focus:ring-2 focus:ring-accent"
                  />
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center rounded-full bg-accent text-sm font-bold text-on-accent transition hover:bg-accent-strong"
          >
            Guardar
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-paper-raised p-5">
            <div className="flex flex-col items-center gap-4">
              <LogoUpload
                currentUrl={tenant.logoUrl}
                tenantName={tenant.name}
                canEdit={false}
              />
              <div className="w-full text-center">
                <div className="font-[family-name:var(--font-syne)] text-lg font-bold text-ink">
                  {tenant.name}
                </div>
                {tenant.license ? (
                  <div className="text-sm text-muted">
                    Matrícula {tenant.license}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted">
            Solo OWNER/TECH pueden editar la marca.
          </p>
        </div>
      )}

      <Link
        href="/app/templates"
        className="inline-block text-sm font-semibold text-accent"
      >
        Ir a templates →
      </Link>
    </div>
  );
}
