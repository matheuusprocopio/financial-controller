"use client";

import type React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { FormFieldRenderer } from "./FormFieldRenderer";
import type { IBaseFormCard } from "./types";


export type { FormFieldConfig, IBaseFormCard } from "./types";


const BaseFormCard = <T extends z.ZodType<any, any>>({
  title,
  description,
  fields,
  submitLabel = "Enviar",
  onSubmit,
  className,
  defaultFormData = {},
  onCancel,
  cancelLabel = "Cancelar",
  validationSchema,
}: IBaseFormCard<T>) => {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(validationSchema),
    defaultValues: defaultFormData as any,
    mode: "onChange",
  });


  useEffect(() => {
    form.reset(defaultFormData as any);
  }, [defaultFormData, form]);


  const handleSubmit = (data: z.infer<T>) => {
    onSubmit(data);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-4">
            {fields.map((field) => (
              <FormFieldRenderer
                key={field.name}
                field={field}
                control={form.control}
              />
            ))}
          </CardContent>

          <CardFooter className="flex gap-2 mt-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                {cancelLabel}
              </Button>
            )}
            <Button
              type="submit"
              className={cn("flex-1", !onCancel && "w-full")}
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Enviando..." : submitLabel}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default BaseFormCard;