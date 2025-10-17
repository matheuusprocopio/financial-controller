"use client";

import type { Control, FieldValues } from "react-hook-form";
import type { FormFieldConfig } from "./types";
import {
  TextFormField,
  TextareaFormField,
  SelectFormField,
  DateFormField,
  DateRangeFormField,
} from "./FormFields";

interface FormFieldRendererProps<T extends FieldValues> {
  field: FormFieldConfig;
  control: Control<T>;
}


export const FormFieldRenderer = <T extends FieldValues>({
  field,
  control,
}: FormFieldRendererProps<T>) => {
  switch (field.type) {
    case "textarea":
      return <TextareaFormField field={field} control={control} />;

    case "select":
      return <SelectFormField field={field} control={control} />;

    case "date":
      return <DateFormField field={field} control={control} />;

    case "dateRange":
      return <DateRangeFormField field={field} control={control} />;

    case "text":
    case "email":
    case "number":
    default:
      return <TextFormField field={field} control={control} />;
  }
};
