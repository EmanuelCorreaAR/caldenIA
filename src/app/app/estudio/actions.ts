"use server";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenantSession, setSession } from "@/lib/auth";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function updateTenantBranding(formData: FormData) {
  const session = await requireTenantSession();

  if (session.role === "VIEWER") {
    redirect("/app/estudio?error=" + encodeURIComponent("Sin permiso"));
  }

  const name = String(formData.get("name") ?? "").trim();
  const license = String(formData.get("license") ?? "").trim() || null;
  const file = formData.get("logo");

  if (!name) {
    redirect(
      "/app/estudio?error=" + encodeURIComponent("El nombre es obligatorio"),
    );
  }

  let logoUrl: string | undefined;

  if (file instanceof File && file.size > 0) {
    if (!ALLOWED.has(file.type)) {
      redirect(
        "/app/estudio?error=" +
          encodeURIComponent("Logo: usá JPG, PNG o WEBP"),
      );
    }
    if (file.size > 2 * 1024 * 1024) {
      redirect(
        "/app/estudio?error=" + encodeURIComponent("El logo supera 2 MB"),
      );
    }

    const ext =
      file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const dir = path.join(
      process.cwd(),
      "public",
      "uploads",
      session.tenantId,
      "brand",
    );
    await mkdir(dir, { recursive: true });
    const filename = `logo-${randomUUID()}.${ext}`;
    await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
    logoUrl = `/uploads/${session.tenantId}/brand/${filename}`;
  }

  const updated = await prisma.tenant.update({
    where: { id: session.tenantId },
    data: {
      name,
      license,
      ...(logoUrl ? { logoUrl } : {}),
    },
  });

  await setSession({
    ...session,
    tenantName: updated.name,
    tenantLogoUrl: updated.logoUrl,
  });

  revalidatePath("/app", "layout");
  revalidatePath("/app/estudio");
  redirect("/app/estudio?ok=1");
}
