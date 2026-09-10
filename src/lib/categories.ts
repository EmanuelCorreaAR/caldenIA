import type { RecordCategory } from "@prisma/client";

export const RECORD_CATEGORIES: Array<{
  value: RecordCategory;
  label: string;
  short: string;
}> = [
  { value: "CAPACITACION", label: "Capacitaciones", short: "Capacitación" },
  { value: "ESTUDIO", label: "Estudios", short: "Estudio" },
  { value: "INSPECCION", label: "Inspecciones", short: "Inspección" },
  { value: "ENTREGA_EPP", label: "Entrega de EPP", short: "EPP" },
  { value: "MEDICION", label: "Mediciones", short: "Medición" },
  { value: "OTRO", label: "Otros", short: "Otro" },
];

export function categoryLabel(value: RecordCategory | string): string {
  return (
    RECORD_CATEGORIES.find((c) => c.value === value)?.label ?? "Otros"
  );
}

export function categoryShort(value: RecordCategory | string): string {
  return (
    RECORD_CATEGORIES.find((c) => c.value === value)?.short ?? "Otro"
  );
}

export function isRecordCategory(value: string): value is RecordCategory {
  return RECORD_CATEGORIES.some((c) => c.value === value);
}
