import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  CHARLA_5_MIN_SCHEMA,
  CHARLA_5_MIN_SLUG,
} from "@/lib/templates";

export const PAPER_SCAN_SLUG = "escaneo-papel";

const PAPER_SCAN_SCHEMA = {
  fields: [
    {
      id: "titulo",
      type: "text",
      label: "Título",
      required: true,
    },
    {
      id: "fecha",
      type: "date",
      label: "Fecha",
      required: true,
    },
    {
      id: "notas",
      type: "textarea",
      label: "Notas",
    },
  ],
} as const;

/** Template de biblioteca: charla de 5 minutos → categoría Capacitaciones */
export async function ensureCharlaTemplate(tenantId: string) {
  return prisma.formTemplate.upsert({
    where: {
      tenantId_slug: { tenantId, slug: CHARLA_5_MIN_SLUG },
    },
    update: {
      name: "Charla de 5 minutos",
      description: "Capacitación breve en planta",
      category: "CAPACITACION",
      schema: CHARLA_5_MIN_SCHEMA as unknown as Prisma.InputJsonValue,
      status: "READY",
      source: "LIBRARY",
    },
    create: {
      tenantId,
      name: "Charla de 5 minutos",
      slug: CHARLA_5_MIN_SLUG,
      description: "Capacitación breve en planta",
      category: "CAPACITACION",
      status: "READY",
      source: "LIBRARY",
      schema: CHARLA_5_MIN_SCHEMA as unknown as Prisma.InputJsonValue,
    },
  });
}

/** Template contenedor para registros por foto/PDF del papel */
export async function ensurePaperScanTemplate(tenantId: string) {
  return prisma.formTemplate.upsert({
    where: {
      tenantId_slug: { tenantId, slug: PAPER_SCAN_SLUG },
    },
    update: {
      name: "Escaneo en papel",
      description: "Foto o PDF de un formulario firmado en papel",
      category: "OTRO",
      schema: PAPER_SCAN_SCHEMA as unknown as Prisma.InputJsonValue,
      status: "READY",
      source: "LIBRARY",
    },
    create: {
      tenantId,
      name: "Escaneo en papel",
      slug: PAPER_SCAN_SLUG,
      description: "Foto o PDF de un formulario firmado en papel",
      category: "OTRO",
      status: "READY",
      source: "LIBRARY",
      schema: PAPER_SCAN_SCHEMA as unknown as Prisma.InputJsonValue,
    },
  });
}
