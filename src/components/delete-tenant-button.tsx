"use client";

import { deleteTenant } from "@/app/admin/actions";

export function DeleteTenantButton({
  tenantId,
  tenantName,
}: {
  tenantId: string;
  tenantName: string;
}) {
  return (
    <form
      action={deleteTenant}
      onSubmit={(e) => {
        const ok = window.confirm(
          `¿Eliminar “${tenantName}”?\nSe borran usuarios, clientes, plantas y registros. No se puede deshacer.`,
        );
        if (!ok) e.preventDefault();
      }}
    >
      <input type="hidden" name="tenantId" value={tenantId} />
      <button
        type="submit"
        className="rounded-full border border-danger/40 bg-danger/10 px-3 py-1.5 text-xs font-semibold text-danger transition hover:bg-danger/20"
      >
        Eliminar
      </button>
    </form>
  );
}
