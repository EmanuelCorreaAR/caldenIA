import Link from "next/link";
import { notFound } from "next/navigation";
import { publishTemplate } from "../actions";
import { categoryShort } from "@/lib/categories";
import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/auth";
import { parseFormSchema } from "@/lib/templates";

export const dynamic = "force-dynamic";

export default async function TemplateDetallePage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const session = await requireTenantSession();
  const { templateId } = await params;

  const template = await prisma.formTemplate.findFirst({
    where: { id: templateId, tenantId: session.tenantId },
  });
  if (!template) notFound();

  const schema = parseFormSchema(template.schema);
  const isImage =
    template.sourceImageUrl &&
    !template.sourceImageUrl.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/app/templates"
          className="text-sm font-medium text-muted transition hover:text-ink"
        >
          ← Templates
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-ink">
            {template.name}
          </h1>
          <span className="rounded-full bg-paper-raised px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted ring-1 ring-line">
            {categoryShort(template.category)}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              template.status === "DRAFT"
                ? "bg-line text-muted"
                : "bg-accent/20 text-accent"
            }`}
          >
            {template.status === "DRAFT" ? "Borrador" : "Listo"}
          </span>
        </div>
        {template.description ? (
          <p className="mt-2 text-sm text-muted">{template.description}</p>
        ) : null}
      </div>

      {template.interpretNotes ? (
        <div className="rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-ink">
          {template.interpretNotes}
        </div>
      ) : null}

      {template.sourceImageUrl ? (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Original
          </h2>
          {isImage ? (
            <div className="overflow-hidden rounded-2xl border border-line bg-paper-raised">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={template.sourceImageUrl}
                alt="Formulario original"
                className="max-h-80 w-full object-contain"
              />
            </div>
          ) : (
            <a
              href={template.sourceImageUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-sm font-semibold text-accent underline underline-offset-2"
            >
              Abrir PDF original
            </a>
          )}
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Schema propuesto · {schema.fields.length} campos
        </h2>
        <ul className="space-y-2">
          {schema.fields.map((field) => (
            <li
              key={field.id}
              className="rounded-2xl border border-line bg-paper-raised px-4 py-3"
            >
              <div className="font-semibold text-ink">{field.label}</div>
              <div className="mt-1 text-xs text-muted">
                {field.id} · {field.type}
                {field.required ? " · obligatorio" : ""}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {template.status === "DRAFT" ? (
        <form action={publishTemplate}>
          <input type="hidden" name="templateId" value={template.id} />
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center rounded-full bg-accent text-sm font-bold text-on-accent transition hover:bg-accent-strong sm:w-auto sm:px-8"
          >
            Marcar como listo
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted">
          Listo para usar en registros de planta.
        </p>
      )}
    </div>
  );
}
