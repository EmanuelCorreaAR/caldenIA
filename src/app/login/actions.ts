"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  clearSession,
  homeForSession,
  setSession,
  verifyPassword,
  type Session,
} from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "").trim();

  if (!email || !password) {
    redirect("/login?error=" + encodeURIComponent("Email y contraseña son obligatorios"));
  }

  // 1) Operador de plataforma
  const platformUser = await prisma.platformUser.findUnique({ where: { email } });
  if (platformUser?.active) {
    const ok = await verifyPassword(password, platformUser.passwordHash);
    if (!ok) {
      redirect("/login?error=" + encodeURIComponent("Credenciales inválidas"));
    }

    const session: Session = {
      kind: "platform",
      userId: platformUser.id,
      email: platformUser.email,
      name: platformUser.name,
    };
    await setSession(session);
    redirect(safeNext(next, homeForSession(session)));
  }

  // 2) Usuario de un estudio (tenant)
  const tenantUser = await prisma.user.findFirst({
    where: {
      email,
      tenant: { status: { in: ["ACTIVE", "PENDING"] } },
    },
    include: { tenant: true },
    orderBy: { createdAt: "asc" },
  });

  if (!tenantUser) {
    redirect("/login?error=" + encodeURIComponent("Credenciales inválidas"));
  }

  if (tenantUser.tenant.status === "SUSPENDED") {
    redirect("/login?error=" + encodeURIComponent("Este estudio está suspendido"));
  }

  const ok = await verifyPassword(password, tenantUser.passwordHash);
  if (!ok) {
    redirect("/login?error=" + encodeURIComponent("Credenciales inválidas"));
  }

  const session: Session = {
    kind: "tenant",
    userId: tenantUser.id,
    tenantId: tenantUser.tenantId,
    tenantName: tenantUser.tenant.name,
    tenantSlug: tenantUser.tenant.slug,
    email: tenantUser.email,
    name: tenantUser.name,
    role: tenantUser.role,
  };
  await setSession(session);
  redirect(safeNext(next, homeForSession(session)));
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

function safeNext(next: string, fallback: string): string {
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  // plataforma no puede forzar ir a /app vía next si no corresponde: el home ya es correcto
  return next || fallback;
}
