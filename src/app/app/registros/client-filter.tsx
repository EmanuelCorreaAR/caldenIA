"use client";

import { useRouter } from "next/navigation";

export function RegistrosClientFilter({
  clients,
  selectedClientId,
  categoria,
}: {
  clients: { id: string; name: string }[];
  selectedClientId?: string;
  categoria?: string;
}) {
  const router = useRouter();

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
        Cliente
      </span>
      <select
        value={selectedClientId ?? ""}
        onChange={(e) => {
          const q = new URLSearchParams();
          if (categoria) q.set("categoria", categoria);
          if (e.target.value) q.set("cliente", e.target.value);
          const s = q.toString();
          router.push(s ? `/app/registros?${s}` : "/app/registros");
        }}
        className="w-full max-w-md appearance-none rounded-xl border border-line bg-paper-raised bg-[length:12px] bg-[position:right_14px_center] bg-no-repeat py-2.5 pl-3 pr-11 text-sm text-ink outline-none focus:border-accent"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M2.5 4.5L6 8L9.5 4.5' stroke='%238a9a8e' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
        }}
      >
        <option value="">Todos los clientes</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}
