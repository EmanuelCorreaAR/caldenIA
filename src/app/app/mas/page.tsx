import Link from "next/link";
import { requireTenantSession } from "@/lib/auth";

export const metadata = { title: "Más" };

export default async function MasPage() {
  await requireTenantSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-ink">
          Más
        </h1>
      </div>

      <ul className="space-y-2">
        <li>
          <Link
            href="/app/templates"
            className="flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-line bg-paper-raised px-4 py-3 transition hover:border-accent/35"
          >
            <div>
              <div className="font-semibold text-ink">Templates</div>
              <div className="text-sm text-muted">
                Biblioteca y schemas desde imagen/PDF
              </div>
            </div>
            <span aria-hidden className="text-accent">
              →
            </span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
