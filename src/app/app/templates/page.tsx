import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/auth";
import { ensureCharlaTemplate, PAPER_SCAN_SLUG } from "@/lib/ensure-templates";
import { categoryLabel, categoryShort } from "@/lib/categories";
import type { RecordCategory } from "@prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Templates" };

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const session = await requireTenantSession();
  await ensureCharlaTemplate(session.tenantId);
  const params = await searchParams;
  const filter = params.categoria as RecordCategory | undefined;

  const templates = await prisma.formTemplate.findMany({
    where: {
      tenantId: session.tenantId,
      NOT: { slug: PAPER_SCAN_SLUG },
      ...(filter ? { category: filter } : {}),
    },
    orderBy: [{ category: "asc" }, { status: "asc" }, { updatedAt: "desc" }],
  });

  const grouped = templates.reduce<Record<string, typeof templates>>(
    (acc, t) => {
      const key = t.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(t);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-ink">
            Templates
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Capacitaciones, estudios, inspecciones y más. Subí tu formato o
            usá la biblioteca.
          </p>
        </div>
        <Link
          href="/app/templates/nuevo"
          className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-bold text-on-accent transition hover:bg-accent-strong"
        >
          Desde imagen
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterChip href="/app/templates" active={!filter} label="Todas" />
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
            href={`/app/templates?categoria=${c}`}
            active={filter === c}
            label={categoryShort(c)}
          />
        ))}
      </div>

      {templates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-paper-raised px-4 py-10 text-center">
          <p className="text-sm text-muted">No hay templates en esta categoría.</p>
          <Link
            href="/app/templates/nuevo"
            className="mt-4 inline-block text-sm font-semibold text-accent underline underline-offset-2"
          >
            Nuevo template
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, items]) => (
            <section key={cat} className="space-y-2">
              {!filter ? (
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  {categoryLabel(cat)}
                </h2>
              ) : null}
              <ul className="space-y-2">
                {items.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/app/templates/${t.id}`}
                      className="flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-line bg-paper-raised px-4 py-3 transition hover:border-accent/35"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate font-semibold text-ink">
                            {t.name}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                              t.status === "DRAFT"
                                ? "bg-line text-muted"
                                : "bg-accent/20 text-accent"
                            }`}
                          >
                            {t.status === "DRAFT" ? "Borrador" : "Listo"}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-muted">
                          {categoryShort(t.category)}
                          {" · "}
                          {t.source === "FROM_IMAGE"
                            ? "Desde imagen"
                            : t.source === "LIBRARY"
                              ? "Biblioteca"
                              : "Manual"}
                        </div>
                      </div>
                      <span aria-hidden className="text-accent">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
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
