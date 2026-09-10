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
    redirect("/?error=" + encodeURIComponent("Email y contraseña son obligatorios"));
  }

  // 1) Operador de plataforma
  const platformUser = await prisma.platformUser.findUnique({ where: { email } });
  if (platformUser?.active) {
    const ok = await verifyPassword(password, platformUser.passwordHash);
    if (!ok) {
      redirect("/?error=" + encodeURIComponent("Credenciales inválidas"));
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
    include: { tenant: true, client: true },
    orderBy: { createdAt: "asc" },
  });

  if (!tenantUser) {
    redirect("/?error=" + encodeURIComponent("Credenciales inválidas"));
  }

  if (tenantUser.tenant.status === "SUSPENDED") {
    redirect("/?error=" + encodeURIComponent("Este estudio está suspendido"));
  }

  if (tenantUser.role === "CLIENT" && !tenantUser.clientId) {
    redirect("/?error=" + encodeURIComponent("Acceso de cliente incompleto"));
  }

  const ok = await verifyPassword(password, tenantUser.passwordHash);
  if (!ok) {
    redirect("/?error=" + encodeURIComponent("Credenciales inválidas"));
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
    clientId: tenantUser.clientId,
    clientName: tenantUser.client?.name ?? null,
    mustChangePassword: tenantUser.mustChangePassword,
    tenantLogoUrl: tenantUser.tenant.logoUrl,
  };
  await setSession(session);
  if (tenantUser.mustChangePassword) {
    redirect("/cambiar-clave");
  }
  redirect(safeNext(next, homeForSession(session)));
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

function safeNext(next: string, fallback: string): string {
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  // Un CLIENT no puede forzar /app vía next
  if (fallback === "/portal" && next.startsWith("/app")) return fallback;
  if (fallback === "/app" && next.startsWith("/portal")) return fallback;
  return next || fallback;
}
