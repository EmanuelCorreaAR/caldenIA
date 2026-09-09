"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/auth";

export async function createClient(formData: FormData) {
  const session = await requireTenantSession();

  const name = String(formData.get("name") ?? "").trim();
  const cuit = String(formData.get("cuit") ?? "").trim() || null;
  const art = String(formData.get("art") ?? "").trim() || null;
  const contact = String(formData.get("contact") ?? "").trim() || null;

  if (!name) {
    redirect(
      "/app/clientes/nuevo?error=" +
        encodeURIComponent("El nombre de la empresa es obligatorio"),
    );
  }

  const client = await prisma.client.create({
    data: {
      tenantId: session.tenantId,
      name,
      cuit,
      art,
      contact,
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/clientes");
  redirect(`/app/clientes/${client.id}`);
}

export async function createPlant(formData: FormData) {
  const session = await requireTenantSession();

  const clientId = String(formData.get("clientId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim() || null;
  const srtNumber = String(formData.get("srtNumber") ?? "").trim() || null;
  const headcountRaw = String(formData.get("headcount") ?? "").trim();
  const headcount = headcountRaw ? Number.parseInt(headcountRaw, 10) : null;

  if (!clientId || !name) {
    redirect(
      `/app/clientes/${clientId || ""}/plantas/nueva?error=` +
        encodeURIComponent("El nombre de la planta es obligatorio"),
    );
  }

  const client = await prisma.client.findFirst({
    where: { id: clientId, tenantId: session.tenantId },
  });

  if (!client) {
    redirect("/app/clientes");
  }

  const plant = await prisma.plant.create({
    data: {
      clientId,
      name,
      address,
      srtNumber,
      headcount:
        headcount !== null && Number.isFinite(headcount) ? headcount : null,
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/clientes");
  revalidatePath(`/app/clientes/${clientId}`);
  redirect(`/app/clientes/${clientId}/plantas/${plant.id}`);
}
