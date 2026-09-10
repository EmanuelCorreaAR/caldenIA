"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/auth";
import { isRecordCategory } from "@/lib/categories";
import { ensurePaperScanTemplate } from "@/lib/ensure-templates";
import { isSignatureDataUrl, parseFormSchema } from "@/lib/templates";

const SCAN_ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]);

export async function createClient(formData: FormData) {
  const session = await requireTenantSession();

  const name = String(formData.get("name") ?? "").trim();
  const cuit = String(formData.get("cuit") ?? "").trim() || null;
  const art = String(formData.get("art") ?? "").trim() || null;
  const contact = String(formData.get("contact") ?? "").trim() || null;

  if (!name) {
    redirect(
      "/app/clientes/nuevo?error=" +
        encodeURIComponent("El nombre del cliente es obligatorio"),
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

export async function submitPlantRecord(formData: FormData) {
  const session = await requireTenantSession();

  const clientId = String(formData.get("clientId") ?? "");
  const plantId = String(formData.get("plantId") ?? "");
  const templateId = String(formData.get("templateId") ?? "");

  const plant = await prisma.plant.findFirst({
    where: {
      id: plantId,
      clientId,
      client: { tenantId: session.tenantId },
    },
  });

  if (!plant) {
    redirect("/app/clientes");
  }

  const template = await prisma.formTemplate.findFirst({
    where: {
      id: templateId,
      tenantId: session.tenantId,
      status: "READY",
    },
  });

  if (!template) {
    redirect(
      `/app/clientes/${clientId}/plantas/${plantId}/registros/nueva?error=` +
        encodeURIComponent("Elegí un template listo"),
    );
  }

  const schema = parseFormSchema(template.schema);
  const answers: Record<string, string | boolean> = {};
  const missing: string[] = [];

  for (const field of schema.fields) {
    if (field.type === "checkbox") {
      answers[field.id] = formData.get(field.id) === "on";
      if (field.required && !answers[field.id]) missing.push(field.label);
      continue;
    }

    if (field.type === "signature") {
      const value = String(formData.get(field.id) ?? "").trim();
      answers[field.id] = value;
      if (field.required && !isSignatureDataUrl(value)) {
        missing.push(field.label);
      }
      continue;
    }

    const value = String(formData.get(field.id) ?? "").trim();
    answers[field.id] = value;
    if (field.required && !value) missing.push(field.label);
  }

  if (missing.length > 0) {
    redirect(
      `/app/clientes/${clientId}/plantas/${plantId}/registros/nueva?template=${templateId}&error=` +
        encodeURIComponent(`Completá: ${missing.join(", ")}`),
    );
  }

  const signedBy = String(
    answers.responsable ?? answers.firma ?? session.name,
  );

  const record = await prisma.formRecord.create({
    data: {
      templateId: template.id,
      plantId,
      category: template.category,
      status: "SUBMITTED",
      answers,
      signedBy,
      submittedAt: new Date(),
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/registros");
  revalidatePath(`/app/clientes/${clientId}/plantas/${plantId}`);
  redirect(
    `/app/clientes/${clientId}/plantas/${plantId}/registros/${record.id}`,
  );
}

export async function submitPaperScanRecord(formData: FormData) {
  const session = await requireTenantSession();

  const clientId = String(formData.get("clientId") ?? "");
  const plantId = String(formData.get("plantId") ?? "");
  const categoryRaw = String(formData.get("category") ?? "OTRO");
  const titulo = String(formData.get("titulo") ?? "").trim();
  const fecha = String(formData.get("fecha") ?? "").trim();
  const notas = String(formData.get("notas") ?? "").trim();
  const file = formData.get("scan");

  const category = isRecordCategory(categoryRaw) ? categoryRaw : "OTRO";
  const errBase = `/app/clientes/${clientId}/plantas/${plantId}/registros/nueva?modo=papel`;

  const plant = await prisma.plant.findFirst({
    where: {
      id: plantId,
      clientId,
      client: { tenantId: session.tenantId },
    },
  });
  if (!plant) redirect("/app/clientes");

  if (!titulo) {
    redirect(errBase + "&error=" + encodeURIComponent("El título es obligatorio"));
  }
  if (!fecha) {
    redirect(errBase + "&error=" + encodeURIComponent("La fecha es obligatoria"));
  }
  if (!(file instanceof File) || file.size === 0) {
    redirect(
      errBase +
        "&error=" +
        encodeURIComponent("Subí la foto o PDF del papel"),
    );
  }
  if (!SCAN_ALLOWED.has(file.type) && !file.type.startsWith("image/")) {
    redirect(
      errBase +
        "&error=" +
        encodeURIComponent("Usá una foto (JPG/PNG) o PDF"),
    );
  }
  if (file.size > 8 * 1024 * 1024) {
    redirect(
      errBase + "&error=" + encodeURIComponent("El archivo supera 8 MB"),
    );
  }

  const ext =
    file.type === "application/pdf"
      ? "pdf"
      : file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : file.type.includes("heic") || file.type.includes("heif")
            ? "heic"
            : "jpg";
  const dir = path.join(
    process.cwd(),
    "public",
    "uploads",
    session.tenantId,
    "scans",
    plantId,
  );
  await mkdir(dir, { recursive: true });
  const filename = `scan-${randomUUID()}.${ext}`;
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  const scanUrl = `/uploads/${session.tenantId}/scans/${plantId}/${filename}`;
  const paperTemplate = await ensurePaperScanTemplate(session.tenantId);

  let record;
  try {
    record = await prisma.formRecord.create({
      data: {
        plantId,
        templateId: paperTemplate.id,
        category,
        status: "SUBMITTED",
        scanUrl,
        answers: {
          titulo,
          tema: titulo,
          fecha,
          notas,
          origen: "papel",
        },
        signedBy: session.name,
        submittedAt: new Date(),
      },
    });
  } catch (e) {
    console.error("submitPaperScanRecord", e);
    redirect(
      errBase +
        "&error=" +
        encodeURIComponent("No se pudo guardar el escaneo. Probá de nuevo."),
    );
  }

  revalidatePath("/app");
  revalidatePath("/app/registros");
  revalidatePath(`/app/clientes/${clientId}/plantas/${plantId}`);
  redirect(
    `/app/clientes/${clientId}/plantas/${plantId}/registros/${record.id}`,
  );
}

/** @deprecated usar submitPlantRecord */
export const submitCharlaRecord = submitPlantRecord;
