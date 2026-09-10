"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TenantStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword, requirePlatformSession, slugify } from "@/lib/auth";
import { ensureCharlaTemplate } from "@/lib/ensure-templates";
import { logoutAction } from "@/app/login/actions";

export { logoutAction as logoutPlatformAdmin };

async function requireAdmin() {
  await requirePlatformSession();
}

export async function createTenantWithOwner(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const ownerName = String(formData.get("ownerName") ?? "").trim();
  const ownerEmail = String(formData.get("ownerEmail") ?? "").trim().toLowerCase();
  const ownerPassword = String(formData.get("ownerPassword") ?? "");
  const license = String(formData.get("license") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const activateNow = formData.get("activate") === "on";

  if (!name || !ownerName || !ownerEmail || !ownerPassword) {
    redirect(
      "/admin/nuevo?error=" +
        encodeURIComponent(
          "Nombre del estudio, dueño, email y contraseña son obligatorios",
        ),
    );
  }

  if (ownerPassword.length < 8) {
    redirect(
      "/admin/nuevo?error=" +
        encodeURIComponent("La contraseña del owner debe tener al menos 8 caracteres"),
    );
  }

  if (!ownerEmail.includes("@")) {
    redirect("/admin/nuevo?error=" + encodeURIComponent("Email del owner inválido"));
  }

  const slug = slugify(slugInput || name);
  if (!slug) {
    redirect("/admin/nuevo?error=" + encodeURIComponent("Slug inválido"));
  }

  const existing = await prisma.tenant.findUnique({ where: { slug } });
  if (existing) {
    redirect(
      "/admin/nuevo?error=" +
        encodeURIComponent(`Ya existe un tenant con slug “${slug}”`),
    );
  }

  const platformClash = await prisma.platformUser.findUnique({
    where: { email: ownerEmail },
  });
  if (platformClash) {
    redirect(
      "/admin/nuevo?error=" +
        encodeURIComponent("Ese email pertenece a un operador de plataforma"),
    );
  }

  const status = activateNow ? TenantStatus.ACTIVE : TenantStatus.PENDING;
  const passwordHash = await hashPassword(ownerPassword);

  const tenant = await prisma.$transaction(async (tx) => {
    const created = await tx.tenant.create({
      data: {
        name,
        slug,
        license,
        notes,
        status,
        activatedAt: activateNow ? new Date() : null,
      },
    });

    await tx.user.create({
      data: {
        tenantId: created.id,
        name: ownerName,
        email: ownerEmail,
        passwordHash,
        role: "OWNER",
        mustChangePassword: true,
      },
    });

    return created;
  });

  await ensureCharlaTemplate(tenant.id);

  revalidatePath("/admin");
  redirect("/admin");
}

export async function setTenantStatus(formData: FormData) {
  await requireAdmin();

  const tenantId = String(formData.get("tenantId") ?? "");
  const next = String(formData.get("status") ?? "") as TenantStatus;

  if (!tenantId || !Object.values(TenantStatus).includes(next)) {
    return;
  }

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      status: next,
      activatedAt: next === TenantStatus.ACTIVE ? new Date() : undefined,
    },
  });

  revalidatePath("/admin");
}

export async function deleteTenant(formData: FormData) {
  await requireAdmin();

  const tenantId = String(formData.get("tenantId") ?? "").trim();
  if (!tenantId) return;

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return;

  await prisma.tenant.delete({ where: { id: tenantId } });

  try {
    const { rm } = await import("fs/promises");
    const path = await import("path");
    await rm(path.join(process.cwd(), "public", "uploads", tenantId), {
      recursive: true,
      force: true,
    });
  } catch {
    // uploads opcionales
  }

  revalidatePath("/admin");
}
