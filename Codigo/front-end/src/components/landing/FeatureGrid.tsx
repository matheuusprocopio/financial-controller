import type { ReactNode } from "react";
import { Lock, Mic } from "lucide-react";

const FeatureCard = ({
  title,
  description,
  visual,
  className = "",
}: {
  title: string;
  description: string;
  visual: ReactNode;
  className?: string;
}) => (
  <div className={`flex flex-col bg-neutral-950 ${className}`}>
    <div className="flex min-h-[176px] flex-1 items-center justify-center border-b border-white/10 p-6">
      {visual}
    </div>
    <div className="p-6">
      <h3 className="font-medium text-neutral-100">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">{description}</p>
    </div>
  </div>
);

const VoiceVisual = () => (
  <div className="w-full max-w-sm space-y-3">
    <div className="ml-auto w-fit rounded-2xl bg-neutral-800 px-3.5 py-2 text-sm text-neutral-100">
      Paguei a conta de luz, 187 reais
    </div>
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-neutral-900 px-4 py-3">
      <span className="h-2 w-2 rounded-full bg-red-500" />
      <div className="flex flex-1 items-center gap-[3px]">
        {[6, 12, 18, 10, 22, 14, 8, 16, 20, 9, 13, 6, 11, 17, 7].map((height, index) => (
          <span key={index} className="w-[3px] rounded-full bg-neutral-500" style={{ height }} />
        ))}
      </div>
      <span className="text-xs tabular-nums text-neutral-400">0:04</span>
      <Mic className="h-4 w-4 text-neutral-400" />
    </div>
  </div>
);

const CategoriesVisual = () => (
  <div className="flex max-w-xs flex-wrap justify-center gap-2">
    {["Alimentação", "Moradia", "Transporte", "Saúde", "Lazer", "Educação", "Assinaturas"].map(
      (category, index) => (
        <span
          key={category}
          className={`rounded-full border px-3 py-1 text-xs ${
            index === 0
              ? "border-white/30 bg-white/10 text-neutral-100"
              : "border-white/10 text-neutral-400"
          }`}
        >
          {category}
        </span>
      )
    )}
  </div>
);

const AccountsVisual = () => (
  <div className="w-full max-w-xs divide-y divide-white/10 rounded-lg border border-white/10 text-sm">
    {[
      { name: "Conta corrente", value: "R$ 3.240,18", negative: false },
      { name: "Poupança", value: "R$ 12.500,00", negative: false },
      { name: "Cartão de crédito", value: "− R$ 1.186,40", negative: true },
    ].map((account) => (
      <div key={account.name} className="flex items-center justify-between px-4 py-2.5">
        <span className="text-neutral-400">{account.name}</span>
        <span className={`tabular-nums ${account.negative ? "text-red-400" : "text-neutral-100"}`}>
          {account.value}
        </span>
      </div>
    ))}
  </div>
);

const GoalsVisual = () => (
  <div className="w-full max-w-xs space-y-4">
    {[
      { name: "Reserva de emergência", progress: 72 },
      { name: "Viagem de férias", progress: 38 },
    ].map((goal) => (
      <div key={goal.name} className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-neutral-300">{goal.name}</span>
          <span className="tabular-nums text-neutral-500">{goal.progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10">
          <div className="h-1.5 rounded-full bg-neutral-200" style={{ width: `${goal.progress}%` }} />
        </div>
      </div>
    ))}
  </div>
);

const REPORT = [
  { month: "mai", value: 3.1 },
  { month: "jun", value: 3.6 },
  { month: "jul", value: 2.9 },
  { month: "ago", value: 4.2 },
  { month: "set", value: 3.4 },
  { month: "out", value: 3.9 },
];

const ReportsVisual = () => {
  const max = Math.max(...REPORT.map((item) => item.value));
  return (
    <div className="w-full max-w-sm">
      <div className="flex h-28 items-end gap-3 border-b border-white/10">
        {REPORT.map((item, index) => (
          <div
            key={item.month}
            className={`flex-1 rounded-t-[4px] ${index === REPORT.length - 1 ? "bg-[#3987e5]" : "bg-white/15"}`}
            style={{ height: `${(item.value / max) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-2 flex gap-3">
        {REPORT.map((item) => (
          <span key={item.month} className="flex-1 text-center text-[11px] text-neutral-500">
            {item.month}
          </span>
        ))}
      </div>
    </div>
  );
};

const SecurityVisual = () => (
  <div className="flex flex-col items-center gap-3 text-center">
    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5">
      <Lock className="h-5 w-5 text-neutral-300" />
    </div>
    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-400">
      Login com Google ou e-mail
    </span>
  </div>
);

const FeatureGrid = () => (
  <div className="grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 md:grid-cols-3">
    <FeatureCard
      className="md:col-span-2"
      title="Registre por texto ou por voz"
      description="Escreva como falaria com alguém ou grave um áudio. O assistente entende o valor, a data e o tipo da transação."
      visual={<VoiceVisual />}
    />
    <FeatureCard
      title="Categorias automáticas"
      description="O assistente sugere a categoria de cada lançamento a partir das que você criou. Você confirma antes de salvar."
      visual={<CategoriesVisual />}
    />
    <FeatureCard
      title="Contas e cartões"
      description="Cadastre suas contas e cartões e veja o saldo de cada conta em um só lugar."
      visual={<AccountsVisual />}
    />
    <FeatureCard
      title="Metas com progresso"
      description="Defina quanto quer juntar e até quando, e acompanhe quanto já guardou."
      visual={<GoalsVisual />}
    />
    <FeatureCard
      title="Seus dados, só seus"
      description="Cada conta acessa apenas as próprias informações. Nada é compartilhado entre usuários."
      visual={<SecurityVisual />}
    />
    <FeatureCard
      className="md:col-span-3"
      title="Relatórios quando você pedir"
      description="Pergunte quanto gastou no mês, em qual categoria ou como os gastos mudaram. A resposta vem em gráfico, direto na conversa."
      visual={<ReportsVisual />}
    />
  </div>
);

export default FeatureGrid;
