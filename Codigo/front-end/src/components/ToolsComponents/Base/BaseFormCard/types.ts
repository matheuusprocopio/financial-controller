import type { z } from "zod";


export interface FormFieldConfig {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "number"
    | "textarea"
    | "select"
    | "date"
    | "dateRange";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  description?: string;
}


export interface IBaseFormCard<T extends z.ZodType<any, any>> {
  title: string;
  description?: string;
  fields: FormFieldConfig[];
  submitLabel?: string;
  onSubmit: (data: z.infer<T>) => void;
  className?: string;
  defaultFormData?: Partial<z.infer<T>>;
  onCancel?: () => void;
  cancelLabel?: string;
  validationSchema: T;
}
