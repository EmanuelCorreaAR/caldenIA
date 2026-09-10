"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, requireTenantSession } from "@/lib/auth";

function accesosPath(clientId: string, qs?: string) {
  const base = `/app/clientes/${clientId}/accesos`;
  return qs ? `${base}?${qs}` : base;
}

function err(clientId: string, msg: string): never {
  redirect(
    accesosPath(clientId, "error=" + encodeURIComponent(msg)),
  );
}

export async function createClientAccess(formData: FormData) {
  const session = await requireTenantSession();
  const clientId = String(formData.get("clientId") ?? "").trim();

  if (session.role !== "OWNER") {
    err(clientId || "", "Solo el owner puede dar accesos de cliente");
  }
  if (!clientId) {
    redirect("/app/clientes");
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    err(clientId, "Nombre, email y contraseña son obligatorios");
  }
  if (password.length < 8) {
    err(clientId, "La contraseña debe tener al menos 8 caracteres");
  }
  if (!email.includes("@")) {
    err(clientId, "Email inválido");
  }

  const client = await prisma.client.findFirst({
    where: { id: clientId, tenantId: session.tenantId },
  });
  if (!client) err(clientId, "Cliente no encontrado");

  const platformClash = await prisma.platformUser.findUnique({ where: { email } });
  if (platformClash) err(clientId, "Ese email pertenece a un operador de plataforma");

  const existing = await prisma.user.findFirst({
    where: { tenantId: session.tenantId, email },
  });
  if (existing) err(clientId, "Ya hay un usuario con ese email en esta marca");

  await prisma.user.create({
    data: {
      tenantId: session.tenantId,
      clientId,
      name,
      email,
      passwordHash: await hashPassword(password),
      role: "CLIENT",
      mustChangePassword: false,
    },
  });

  revalidatePath(`/app/clientes/${clientId}`);
  revalidatePath(`/app/clientes/${clientId}/accesos`);
  redirect(accesosPath(clientId, "ok=1"));
}

export async function removeClientAccess(formData: FormData) {
  const session = await requireTenantSession();
  const clientId = String(formData.get("clientId") ?? "").trim();
  const userId = String(formData.get("userId") ?? "").trim();

  if (session.role !== "OWNER") {
    err(clientId || "", "Solo el owner puede quitar accesos");
  }
  if (!clientId) redirect("/app/clientes");
  if (!userId) err(clientId, "Usuario inválido");
  if (userId === session.userId) err(clientId, "No podés eliminarte a vos mismo");

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      tenantId: session.tenantId,
      clientId,
      role: "CLIENT",
    },
  });
  if (!user) err(clientId, "Acceso no encontrado");

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath(`/app/clientes/${clientId}`);
  revalidatePath(`/app/clientes/${clientId}/accesos`);
  redirect(accesosPath(clientId, "ok=1"));
}
