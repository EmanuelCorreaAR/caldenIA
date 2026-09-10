"use client";

import type { FormField } from "@/lib/templates";
import { SignaturePad } from "@/components/signature-pad";

type PlantFormFieldsProps = {
  fields: FormField[];
  defaults?: Record<string, string>;
};

export function PlantFormFields({ fields, defaults = {} }: PlantFormFieldsProps) {
  return (
    <>
      {fields.map((field) => {
        if (field.type === "signature") {
          return (
            <SignaturePad
              key={field.id}
              name={field.id}
              label={field.label}
              required={field.required}
            />
          );
        }

        if (field.type === "textarea") {
          return (
            <label key={field.id} className="block space-y-1.5">
              <span className="text-sm font-medium text-ink">
                {field.label}
                {field.required ? " *" : ""}
              </span>
              <textarea
                name={field.id}
                required={field.required}
                rows={4}
                placeholder={field.placeholder}
                className="w-full rounded-xl border-0 bg-void/60 px-4 py-3 text-base text-ink outline-none ring-1 ring-line transition placeholder:text-muted focus:ring-2 focus:ring-accent"
              />
            </label>
          );
        }

        if (field.type === "checkbox") {
          return (
            <label
              key={field.id}
              className="flex min-h-12 items-center gap-3 rounded-xl border border-line bg-paper-raised px-4"
            >
              <input
                type="checkbox"
                name={field.id}
                className="size-4 accent-[var(--accent)]"
              />
              <span className="text-sm text-ink">{field.label}</span>
            </label>
          );
        }

        return (
          <label key={field.id} className="block space-y-1.5">
            <span className="text-sm font-medium text-ink">
              {field.label}
              {field.required ? " *" : ""}
            </span>
            <input
              type={
                field.type === "date"
                  ? "date"
                  : field.type === "number"
                    ? "number"
                    : "text"
              }
              name={field.id}
              required={field.required}
              placeholder={field.placeholder}
              defaultValue={defaults[field.id]}
              className="h-12 w-full rounded-xl border-0 bg-void/60 px-4 text-base text-ink outline-none ring-1 ring-line transition placeholder:text-muted focus:ring-2 focus:ring-accent"
            />
          </label>
        );
      })}
    </>
  );
}
