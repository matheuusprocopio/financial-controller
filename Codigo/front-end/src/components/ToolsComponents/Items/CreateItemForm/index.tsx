"use client";

import { createItemAction } from "@/actions/item";
import FormCard from "@/components/chat/gen-ui/FormCard";
import { useState, useEffect } from "react";
import { listCategories } from "@/utils/services/categories";
import { listAccounts } from "@/utils/services/accounts";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ICreateItemForm {
  data: {
    name?: string;
    description?: string;
    amount?: number;
    date?: string;
    type?: "income" | "expense";
    categoryId?: string;
    accountId?: string;
    suggestedCategoryName?: string;
    suggestedAccountName?: string;
  };
}

const CreateItemForm = ({ data }: ICreateItemForm) => {
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [accounts, setAccounts] = useState<Array<{ id: string; nickname: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: data?.name ?? "",
    description: data?.description ?? "",
    amount: data?.amount?.toString() ?? "0",
    date: data?.date ?? new Date().toISOString().split("T")[0],
    type: data?.type ?? "expense",
    categoryId: data?.categoryId ?? "",
    accountId: data?.accountId ?? "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResp, accountsResp] = await Promise.all([
          listCategories("7c1f1e0d-8f5b-4c8b-96b5-2a42e9f7328e"),
          listAccounts("7c1f1e0d-8f5b-4c8b-96b5-2a42e9f7328e"),
        ]);

        if (Array.isArray(categoriesResp)) {
          setCategories(categoriesResp);
          if (!formData.categoryId && categoriesResp.length > 0) {
            setFormData(prev => ({ ...prev, categoryId: categoriesResp[0].id }));
          }
        }

        if (Array.isArray(accountsResp)) {
          setAccounts(accountsResp);
          if (!formData.accountId && accountsResp.length > 0) {
            setFormData(prev => ({ ...prev, accountId: accountsResp[0].id }));
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    
    await createItemAction({
      name: formData.name,
      description: formData.description,
      amount: parseFloat(formData.amount),
      type: formData.type as "income" | "expense",
      categoryId: formData.categoryId,
      accountId: formData.accountId,
      date: formData.date,
      userId: "7c1f1e0d-8f5b-4c8b-96b5-2a42e9f7328e",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-green-800 font-medium">
              {formData.type === "income" ? "Receita" : "Despesa"} adicionada com sucesso!
            </div>
            <div className="text-sm text-green-600 mt-1">
              R$ {parseFloat(formData.amount).toFixed(2)} - {formData.name}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">✨ Confirmar Transação</CardTitle>
        <CardDescription>
          A IA preencheu automaticamente. Revise e confirme ou ajuste conforme necessário.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da transação</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Almoço, Uber, Salário..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalhes da transação..."
              required
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as "income" | "expense" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">
              Categoria
              {data?.suggestedCategoryName && (
                <span className="text-xs text-muted-foreground ml-2">
                  (Sugestão: {data.suggestedCategoryName})
                </span>
              )}
            </Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountId">
              Conta
              {data?.suggestedAccountName && (
                <span className="text-xs text-muted-foreground ml-2">
                  (Sugestão: {data.suggestedAccountName})
                </span>
              )}
            </Label>
            <Select
              value={formData.accountId}
              onValueChange={(value) => setFormData({ ...formData, accountId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma conta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.nickname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full">
            Confirmar e adicionar
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreateItemForm;
