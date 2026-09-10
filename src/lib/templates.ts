export type FormFieldType =
  | "text"
  | "textarea"
  | "date"
  | "number"
  | "checkbox"
  | "signature";

export type FormField = {
  id: string;
  type: FormFieldType;
  label: string;
  required?: boolean;
  placeholder?: string;
};

export type FormSchema = {
  fields: FormField[];
};

export const CHARLA_5_MIN_SLUG = "charla-5-minutos";

export const CHARLA_5_MIN_SCHEMA: FormSchema = {
  fields: [
    {
      id: "fecha",
      type: "date",
      label: "Fecha",
      required: true,
    },
    {
      id: "tema",
      type: "text",
      label: "Tema de la capacitación",
      required: true,
      placeholder: "Ej. uso de EPP en soldadura",
    },
    {
      id: "expositor",
      type: "text",
      label: "Expositor",
      required: true,
      placeholder: "Nombre del profesional o encargado",
    },
    {
      id: "sector",
      type: "text",
      label: "Sector / puesto",
      placeholder: "Producción, depósito, etc.",
    },
    {
      id: "asistentes",
      type: "textarea",
      label: "Asistentes",
      required: true,
      placeholder: "Uno por línea",
    },
    {
      id: "observaciones",
      type: "textarea",
      label: "Observaciones",
      placeholder: "Notas de la capacitación",
    },
    {
      id: "responsable",
      type: "text",
      label: "Responsable que registra",
      required: true,
      placeholder: "Nombre y apellido",
    },
    {
      id: "firma",
      type: "signature",
      label: "Firma",
      required: true,
    },
  ],
};

export function parseFormSchema(raw: unknown): FormSchema {
  if (
    raw &&
    typeof raw === "object" &&
    Array.isArray((raw as FormSchema).fields)
  ) {
    return raw as FormSchema;
  }
  return { fields: [] };
}

export function isSignatureDataUrl(value: string): boolean {
  return value.startsWith("data:image/") && value.length > 100;
}
