"use client";

import { useState } from "react";
import BaseFormCard, {
  FormFieldConfig,
} from "@/components/ToolsComponents/Base/BaseFormCard";
import { AccountType } from "@/types/account.type";
import { accountFilterSchema, type AccountFilterFormData } from "@/formSchemas";

interface IFilterAccounts {
  accounts: AccountType[];
  onFilteredAccounts: (filteredAccounts: AccountType[]) => void;
  onSendMessage?: (message: string) => Promise<void>;
}

const FilterAccounts = ({
  accounts,
  onFilteredAccounts,
  onSendMessage,
}: IFilterAccounts) => {
  const [isFiltering, setIsFiltering] = useState(false);

  const filterFields: FormFieldConfig[] = [
    {
      name: "nickname",
      label: "Nome da Conta",
      type: "text",
      placeholder: "Digite o nome da conta...",
      description: "Filtre contas pelo apelido ou nome",
    },
    {
      name: "financial_institution",
      label: "Instituição Financeira",
      type: "text",
      placeholder: "Digite a instituição financeira...",
      description: "Filtre contas pela instituição financeira",
    },
  ];

  const handleFilter = (filterData: AccountFilterFormData) => {
    setIsFiltering(true);

    let filteredAccounts = [...accounts];

    if (filterData.nickname && filterData.nickname.trim()) {
      const nicknameFilter = filterData.nickname.toLowerCase().trim();
      filteredAccounts = filteredAccounts.filter((account) =>
        account.name.toLowerCase().includes(nicknameFilter)
      );
    }

    if (
      filterData.financial_institution &&
      filterData.financial_institution.trim()
    ) {
      const institutionFilter = filterData.financial_institution
        .toLowerCase()
        .trim();
      filteredAccounts = filteredAccounts.filter((account) =>
        account.financialInstitution.toLowerCase().includes(institutionFilter)
      );
    }

    if (onSendMessage) {
      const filterMessage = `Filtrar contas com os seguintes critérios:
- Nome: ${filterData.nickname || "Todos"}
- Instituição: ${filterData.financial_institution || "Todas"}

Encontradas ${filteredAccounts.length} conta(s) com os filtros aplicados.`;

      onSendMessage(filterMessage);
    }

    onFilteredAccounts(filteredAccounts);

    setIsFiltering(false);
  };

  const handleClearFilters = () => {
    onFilteredAccounts(accounts);
    if (onSendMessage) {
      onSendMessage("Filtros limpos. Mostrando todas as contas.");
    }
  };

  return (
    <BaseFormCard
      title="Filtrar Contas"
      description="Use os campos abaixo para filtrar as contas por nome e instituição financeira"
      fields={filterFields}
      submitLabel={isFiltering ? "Filtrando..." : "Aplicar Filtros"}
      onSubmit={handleFilter}
      onCancel={handleClearFilters}
      cancelLabel="Limpar Filtros"
      defaultFormData={{
        nickname: "",
        financial_institution: "",
      }}
      validationSchema={accountFilterSchema}
      className="w-full max-w-md"
    />
  );
};

export default FilterAccounts;
