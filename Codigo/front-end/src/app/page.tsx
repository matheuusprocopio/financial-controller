"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  LogIn,
  Menu,
  MessageSquare,
  Target,
  TrendingUp,
  User as UserIcon,
  Wallet,
  X,
} from "lucide-react";
import LoginModal from "@/components/auth/LoginModal";
import { useAuth } from "@/hooks/use-auth";

export default function LandingTech() {
  return (
    <Suspense fallback={null}>
      <LandingTechContent />
    </Suspense>
  );
}

function LandingTechContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    isBackendAuthenticated,
    loading: authLoading,
    clearSession,
  } = useAuth();
  const authChecked = !authLoading;
  const sessionReason = searchParams.get("session");
  const loginNotice =
    sessionReason === "expired"
      ? "Sua sessão expirou. Entre novamente para continuar."
      : sessionReason === "unavailable"
        ? "Não foi possível validar sua sessão. Entre novamente para continuar."
        : undefined;

  // O middleware recusou a sessão: o estado local ainda pode achar que o usuário está logado
  useEffect(() => {
    if (sessionReason) clearSession();
  }, [sessionReason, clearSession]);

  useEffect(() => {
    if (!authChecked) return;

    const shouldOpenLogin = searchParams.get("login") === "true";
    if (shouldOpenLogin && !isBackendAuthenticated) {
      setLoginModalOpen(true);
    }
  }, [searchParams, isBackendAuthenticated, authChecked]);

  const handleLoginModalChange = (open: boolean) => {
    setLoginModalOpen(open);

    const shouldClearLoginParam =
      !open &&
      searchParams.get("login") === "true" &&
      !isBackendAuthenticated;

    if (shouldClearLoginParam) {
      router.replace("/", { scroll: false });
    }
  };

  const features = [
    {
      icon: <TrendingUp className="h-4 w-4" />,
      title: "Inteligência Artificial Avançada",
      description:
        "IA que analisa seus gastos, identifica padrões de consumo e oferece insights personalizados em tempo real.",
    },
    {
      icon: <MessageSquare className="h-4 w-4" />,
      title: "Registro Inteligente",
      description:
        "Registre suas transações de forma rápida e intuitiva através de conversas naturais com nosso assistente.",
    },
    {
      icon: <Target className="h-4 w-4" />,
      title: "Controle de Metas",
      description:
        "Defina e acompanhe suas metas financeiras com ajuda da IA que te mantém no caminho certo.",
    },
    {
      icon: <Bot className="h-4 w-4" />,
      title: "Interface por Chat",
      description:
        "Gerencie suas finanças conversando naturalmente, sem complicações ou formulários complexos.",
    },
  ];

  const techFeatures = [
    "Registro automático de transações via chat",
    "Análise inteligente de padrões de gastos",
    "Acompanhamento de metas financeiras",
    "Insights personalizados com IA",
    "Categorização automática de despesas",
    "Relatórios e visualizações intuitivas",
  ];

  const isLoggedIn = isBackendAuthenticated;
  const accountLabel = isLoggedIn ? "Minha Conta" : "Entrar";
  //console.log(isLoggedIn);
  const primaryButton =
    "bg-neutral-100 font-medium text-neutral-950 hover:bg-white";
  const secondaryButton =
    "border border-white/15 bg-transparent font-medium text-neutral-200 hover:bg-white/5 hover:text-white";

  const desktopAuthControls = (
    <>
      <Button
        onClick={() => setLoginModalOpen(true)}
        variant="ghost"
        size="sm"
        className="gap-2 text-neutral-400 hover:bg-white/5 hover:text-neutral-100"
      >
        {isLoggedIn ? <UserIcon className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
        {isLoggedIn ? "Minha conta" : "Entrar"}
      </Button>
      <Link href="/chat">
        <Button size="sm" className={primaryButton}>
          Abrir App
        </Button>
      </Link>
    </>
  );

  const brand = (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-md border border-white/15 bg-white/5">
        <Wallet className="h-4 w-4 text-neutral-200" />
      </div>
      <span className="text-[15px] font-medium tracking-tight text-neutral-100">
        FinancialController
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {brand}

          <div className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-neutral-400 transition-colors hover:text-neutral-100">
              Recursos
            </a>
            <a href="#tech" className="text-sm text-neutral-400 transition-colors hover:text-neutral-100">
              Funcionalidades
            </a>
            <div className="flex items-center gap-2">{desktopAuthControls}</div>
          </div>

          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-neutral-300 transition-colors hover:bg-white/5 md:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-neutral-950 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              <a href="#features" className="text-sm text-neutral-300 transition-colors hover:text-white">
                Recursos
              </a>
              <a href="#tech" className="text-sm text-neutral-300 transition-colors hover:text-white">
                Funcionalidades
              </a>
              <Button
                onClick={() => setLoginModalOpen(true)}
                className={`w-full gap-2 ${secondaryButton}`}
              >
                {isLoggedIn ? <UserIcon className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                {accountLabel}
              </Button>
              <Link href="/chat">
                <Button className={`w-full ${primaryButton}`}>Abrir App</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      <section className="px-4 pb-20 pt-32 sm:px-6 sm:pt-40 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Controle financeiro com IA · Disponível agora
            </div>

            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Controle suas finanças{" "}
              <span className="text-neutral-500">com inteligência.</span>
            </h1>

            <p className="max-w-2xl text-lg leading-relaxed text-neutral-400">
              Use o poder da inteligência artificial para registrar gastos, entender seus hábitos financeiros e alcançar suas metas através de conversas simples.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/chat">
                <Button size="lg" className={`gap-2 ${primaryButton}`}>
                  Começar agora
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" className={secondaryButton}>
                  Ver como funciona
                </Button>
              </a>
            </div>
          </div>

          <dl className="mt-20 grid border-y border-white/10 sm:grid-cols-3 sm:divide-x sm:divide-white/10">
            {[
              { value: "100%", label: "Interface por chat" },
              { value: "IA", label: "Análise inteligente" },
              { value: "24/7", label: "Controle total" },
            ].map((stat) => (
              <div key={stat.label} className="border-b border-white/10 py-6 last:border-b-0 sm:border-b-0 sm:px-6 sm:first:pl-0">
                <dt className="text-sm text-neutral-500">{stat.label}</dt>
                <dd className="mt-1 text-2xl font-semibold tracking-tight">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="features" className="scroll-mt-14 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Recursos inteligentes
            </h2>
            <p className="text-lg text-neutral-400">
              Construído com as mais recentes inovações em IA para tornar o controle financeiro simples e eficiente.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={`${feature.title}-${index}`} className="space-y-3 bg-neutral-950 p-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-neutral-300">
                  {feature.icon}
                </div>
                <h3 className="font-medium">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tech" className="scroll-mt-14 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Controle financeiro do futuro
            </h2>
            <p className="text-lg text-neutral-400">
              Nossa plataforma usa inteligência artificial avançada para oferecer uma experiência única de gestão financeira através de conversas naturais.
            </p>
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {techFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-3 py-3 text-sm text-neutral-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-neutral-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-white/10 bg-neutral-900/50">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <Bot className="h-4 w-4 text-neutral-400" />
              <span className="text-sm text-neutral-400">Assistente financeiro</span>
            </div>
            <div className="space-y-4 p-5 text-sm">
              <div className="ml-auto w-fit max-w-[80%] rounded-lg bg-neutral-100 px-3.5 py-2 text-neutral-950">
                Gastei R$ 42,90 no mercado hoje
              </div>
              <div className="w-fit max-w-[85%] space-y-3 rounded-lg border border-white/10 px-3.5 py-3 text-neutral-300">
                <p>Registrei o gasto:</p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-neutral-400">
                  <dt>Categoria</dt>
                  <dd className="text-neutral-200">Alimentação</dd>
                  <dt>Valor</dt>
                  <dd className="font-medium tabular-nums text-red-400">− R$ 42,90</dd>
                  <dt>Data</dt>
                  <dd className="text-neutral-200">Hoje</dd>
                </dl>
              </div>
              <div className="ml-auto w-fit max-w-[80%] rounded-lg bg-neutral-100 px-3.5 py-2 text-neutral-950">
                Quanto já gastei com alimentação este mês?
              </div>
              <div className="flex w-fit items-center gap-2 rounded-lg border border-white/10 px-3.5 py-2 text-neutral-300">
                <TrendingUp className="h-4 w-4 text-neutral-500" />
                <span>
                  <span className="font-medium tabular-nums text-neutral-100">R$ 1.284,50</span> em outubro
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 rounded-xl border border-white/10 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Pronto para transformar suas finanças?
            </h2>
            <p className="text-neutral-400">
              IA avançada, controle total, simplicidade máxima.
            </p>
          </div>
          <Link href="/chat">
            <Button size="lg" className={`shrink-0 gap-2 ${primaryButton}`}>
              Iniciar conversa
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {brand}
          <p className="text-sm text-neutral-500">
            © 2025 FinancialController. Seu controle financeiro inteligente via chat.
          </p>
        </div>
      </footer>

      <LoginModal
        open={loginModalOpen}
        onOpenChange={handleLoginModalChange}
        notice={loginNotice}
      />
    </div>
  );
}
