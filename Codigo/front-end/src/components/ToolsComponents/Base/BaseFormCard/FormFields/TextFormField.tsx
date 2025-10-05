"use client";

import { Input } from "@/components/ui/input";
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

interface TextFormFieldProps<T extends FieldValues> {
  field: FormFieldConfig;
  control: Control<T>;
}


export const TextFormField = <T extends FieldValues>({
  field,
  control,
}: TextFormFieldProps<T>) => {
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
            <Input
              type={field.type}
              placeholder={field.placeholder}
              {...formField}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
