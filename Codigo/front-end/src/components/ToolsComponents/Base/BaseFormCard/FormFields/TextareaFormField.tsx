"use client";

import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Control, FieldValues, Path } from "react-hook-form";

interface FormFieldConfig {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  description?: string;
}

interface TextareaFormFieldProps<T extends FieldValues> {
  field: FormFieldConfig;
  control: Control<T>;
}


export const TextareaFormField = <T extends FieldValues>({
  field,
  control,
}: TextareaFormFieldProps<T>) => {
  return (
    <FormField
      control={control}
      name={field.name as Path<T>}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          {field.description && (
            <FormDescription>{field.description}</FormDescription>
          )}
          <FormControl>
            <Textarea
              placeholder={field.placeholder}
              className="min-h-[80px]"
              {...formField}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
