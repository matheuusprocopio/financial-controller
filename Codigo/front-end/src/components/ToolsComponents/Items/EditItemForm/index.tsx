"use client";

import { updateItemAction } from "@/actions/item";
import { getItemById } from "@/utils/services/items";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listCategories } from "@/utils/services/categories";
import { listAccounts } from "@/utils/services/accounts";

interface IEditItemForm {
  data?: {
    itemId?: string;
    name?: string;
    description?: string;
    amount?: number;
    date?: string;
    type?: "income" | "expense";
    categoryId?: string;
    accountId?: string;
  };
}

const EditItemForm = ({ data }: IEditItemForm) => {
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [accounts, setAccounts] = useState<Array<{ id: string; nickname: string }>>([]);
  const [itemData, setItemData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: 0,
    type: "expense" as "income" | "expense",
    categoryId: "",
    accountId: "",
    date: new Date(),
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!data?.itemId) {
        setLoading(false);
        return;
      }

      try {
        const [categoriesResp, accountsResp, itemResp] = await Promise.all([
          listCategories("7c1f1e0d-8f5b-4c8b-96b5-2a42e9f7328e"),
          listAccounts("7c1f1e0d-8f5b-4c8b-96b5-2a42e9f7328e"),
          getItemById(data.itemId),
        ]);

        if (Array.isArray(categoriesResp)) {
          setCategories(categoriesResp);
        }

        if (Array.isArray(accountsResp)) {
          setAccounts(accountsResp);
        }

        if (itemResp && !("error" in itemResp)) {
          setItemData(itemResp);
          setFormData({
            name: data.name ?? itemResp.name ?? "",
            description: data.description ?? itemResp.description ?? "",
            amount: data.amount ?? itemResp.amount ?? 0,
            type: (data.type ?? itemResp.type ?? "expense") as "income" | "expense",
            categoryId: data.categoryId ?? itemResp.categoryId ?? "",
            accountId: data.accountId ?? itemResp.accountId ?? "",
            date: data.date ? new Date(data.date) : (itemResp.date ? new Date(itemResp.date) : new Date()),
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.itemId]);

  const handleSubmit = async () => {
    if (!data?.itemId) return;

    const payload: any = {};
    
    if (formData.name !== itemData?.name) payload.name = formData.name;
    if (formData.description !== itemData?.description) payload.description = formData.description;
    if (formData.amount !== itemData?.amount) payload.amount = formData.amount;
    if (formData.type !== itemData?.type) payload.type = formData.type;
    if (formData.categoryId !== itemData?.categoryId) payload.categoryId = formData.categoryId;
    if (formData.accountId !== itemData?.accountId) payload.accountId = formData.accountId;
    
    const itemDate = itemData?.date ? new Date(itemData.date).toISOString().split("T")[0] : null;
    const newDate = formData.date.toISOString().split("T")[0];
    if (newDate !== itemDate) payload.date = newDate;

    await updateItemAction(data.itemId, payload);
    setIsSubmitted(true);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data?.itemId) {
    return (
      <Card className="w-full max-w-2xl border-red-500">
        <CardHeader>
          <CardTitle className="text-red-600">Erro</CardTitle>
          <CardDescription>ID do item não fornecido</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-2xl border-green-500 bg-green-50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="text-green-600">Transação atualizada com sucesso!</CardTitle>
          <CardDescription className="text-green-600">
            {formData.type === "income" ? "Receita" : "Despesa"} de R$ {formData.amount.toFixed(2)} atualizada
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Editar transação</CardTitle>
        <CardDescription>
          Revise e confirme as alterações na transação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da transação</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Salário, Almoço, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descreva a transação..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as "income" | "expense" })}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="account">Conta</Label>
          <Select
            value={formData.accountId}
            onValueChange={(value) => setFormData({ ...formData, accountId: value })}
          >
            <SelectTrigger id="account">
              <SelectValue placeholder="Selecione uma conta" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.nickname}
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
            value={formData.date.toISOString().split("T")[0]}
            onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} className="w-full">
          Confirmar alterações
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EditItemForm;
