import { Prisma } from "@prisma/client";
import type { FormSchema } from "@/lib/templates";

/**
 * Interpreta una imagen/PDF de formulario hacia un schema editable.
 * Con GEMINI_API_KEY / OPENAI_API_KEY usaremos visión; mientras tanto
 * devolvemos un borrador revisable (el flujo de producto ya es el correcto).
 */
export async function interpretFormImage(input: {
  fileName: string;
  mimeType: string;
}): Promise<{
  name: string;
  schema: FormSchema;
  notes: string;
}> {
  const baseName = input.fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .trim();

  const name = baseName
    ? baseName.charAt(0).toUpperCase() + baseName.slice(1)
    : "Formulario desde imagen";

  // TODO: llamar Gemini/OpenAI vision con el archivo y pedir JSON de fields.
  // Claves previstas: GEMINI_API_KEY o OPENAI_API_KEY.
  const hasAi =
    Boolean(process.env.GEMINI_API_KEY?.trim()) ||
    Boolean(process.env.OPENAI_API_KEY?.trim());

  const schema: FormSchema = {
    fields: [
      {
        id: "fecha",
        type: "date",
        label: "Fecha",
        required: true,
      },
      {
        id: "titulo",
        type: "text",
        label: "Título / tema",
        required: true,
        placeholder: "Revisar según el formato subido",
      },
      {
        id: "responsable",
        type: "text",
        label: "Responsable",
        required: true,
      },
      {
        id: "observaciones",
        type: "textarea",
        label: "Observaciones",
      },
      {
        id: "asistentes",
        type: "textarea",
        label: "Asistentes / firmas",
        placeholder: "Uno por línea — ajustar al papel",
      },
      {
        id: "firma",
        type: "signature",
        label: "Firma",
        required: true,
      },
    ],
  };

  const notes = hasAi
    ? "Hay clave de IA configurada: falta conectar el provider de visión. Este schema es borrador para revisar."
    : "Borrador sin IA todavía. Revisá y editá los campos según la imagen subida. Después conectamos Gemini/OpenAI para proponer el schema solo.";

  return { name, schema, notes };
}

export function schemaToJson(schema: FormSchema): Prisma.InputJsonValue {
  return schema as unknown as Prisma.InputJsonValue;
}
