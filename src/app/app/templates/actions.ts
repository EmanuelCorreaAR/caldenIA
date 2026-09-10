"use server";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenantSession, slugify } from "@/lib/auth";
import { interpretFormImage, schemaToJson } from "@/lib/interpret-form";
import { isRecordCategory } from "@/lib/categories";
import type { RecordCategory } from "@prisma/client";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export async function createTemplateFromImage(formData: FormData) {
  const session = await requireTenantSession();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    redirect(
      "/app/templates/nuevo?error=" +
        encodeURIComponent("Subí una foto o PDF del formulario"),
    );
  }

  if (!ALLOWED.has(file.type)) {
    redirect(
      "/app/templates/nuevo?error=" +
        encodeURIComponent("Formato no soportado. Usá JPG, PNG, WEBP o PDF"),
    );
  }

  if (file.size > 8 * 1024 * 1024) {
    redirect(
      "/app/templates/nuevo?error=" +
        encodeURIComponent("El archivo supera 8 MB"),
    );
  }

  const ext =
    file.type === "application/pdf"
      ? "pdf"
      : file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";

  const dir = path.join(process.cwd(), "public", "uploads", session.tenantId);
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}.${ext}`;
  const abs = path.join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(abs, buffer);

  const sourceImageUrl = `/uploads/${session.tenantId}/${filename}`;
  const categoryRaw = String(formData.get("category") ?? "OTRO");
  const category: RecordCategory = isRecordCategory(categoryRaw)
    ? categoryRaw
    : "OTRO";

  const interpreted = await interpretFormImage({
    fileName: file.name || filename,
    mimeType: file.type,
  });

  let slug = slugify(interpreted.name) || `formulario-${Date.now()}`;
  const clash = await prisma.formTemplate.findUnique({
    where: { tenantId_slug: { tenantId: session.tenantId, slug } },
  });
  if (clash) slug = `${slug}-${Date.now().toString(36)}`;

  const template = await prisma.formTemplate.create({
    data: {
      tenantId: session.tenantId,
      name: interpreted.name,
      slug,
      description: "Generado desde imagen/PDF — revisar campos",
      category,
      status: "DRAFT",
      source: "FROM_IMAGE",
      sourceImageUrl,
      interpretNotes: interpreted.notes,
      schema: schemaToJson(interpreted.schema),
    },
  });

  revalidatePath("/app/templates");
  redirect(`/app/templates/${template.id}`);
}

export async function publishTemplate(formData: FormData) {
  const session = await requireTenantSession();
  const templateId = String(formData.get("templateId") ?? "");

  const template = await prisma.formTemplate.findFirst({
    where: { id: templateId, tenantId: session.tenantId },
  });
  if (!template) redirect("/app/templates");

  await prisma.formTemplate.update({
    where: { id: template.id },
    data: { status: "READY" },
  });

  revalidatePath("/app/templates");
  revalidatePath(`/app/templates/${template.id}`);
  redirect(`/app/templates/${template.id}`);
}
