"use client";

import type React from "react";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "number"
    | "textarea"
    | "date"
    | "month"
    | "select"
    | "currency";
  placeholder?: string;
  required?: boolean;
  min?: string;
  options?: { value: string; label: string }[];
  description?: string;
}

interface IFormCard {
  title: string;
  description?: string;
  fields: FormField[];
  submitLabel?: string;
  alreadySubmitted?: boolean;
  onSubmit: (
    data: Record<string, string>
  ) => void | boolean | Promise<void | boolean>;
  className?: string;
  defaultFormData: Record<string, string>;
}

const FormCard = ({
  title,
  description,
  fields,
  submitLabel = "Enviar",
  onSubmit,
  className,
  alreadySubmitted,
  defaultFormData,
}: IFormCard) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const formatCurrencyMask = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "");
    if (!digitsOnly) return "";

    const numberValue = Number(digitsOnly) / 100;
    const [integerPart, decimalPart] = numberValue
      .toFixed(2)
      .split(".");
    const withSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `R$ ${withSeparators},${decimalPart}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = onSubmit(formData);
      const resolved = result instanceof Promise ? await result : result;

      if (resolved !== false) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    setFormData(defaultFormData);
  }, [defaultFormData]);

  useEffect(() => {
    if (alreadySubmitted) {
      setIsSubmitted(true);
    }
  }, [alreadySubmitted]);

  if (isSubmitted) {
    return (
      <Card className={cn("border-green-200 bg-green-50", className)}>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-green-800 font-medium">
              Formulário enviado com sucesso!
            </div>
            <div className="text-sm text-green-600 mt-1">
              Obrigado pelas informações.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
              {field.description && (
                <p className="text-xs text-muted-foreground">
                  {field.description}
                </p>
              )}
              {field.type === "textarea" ? (
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="min-h-[80px]"
                />
              ) : field.type === "currency" ? (
                <Input
                  id={field.name}
                  inputMode="numeric"
                  placeholder={field.placeholder}
                  required={field.required}
                  value={formData[field.name] || ""}
                  onChange={(e) =>
                    handleChange(field.name, formatCurrencyMask(e.target.value))
                  }
                />
              ) : field.type === "select" ? (
                <Select
                  value={formData[field.name] || ""}
                  onValueChange={(value) => handleChange(field.name, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={field.placeholder || "Selecione uma opção"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  required={field.required}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  min={field.min}
                />
              )}
          </div>
        ))}
      </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full mt-4">
            {submitLabel}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default FormCard;
