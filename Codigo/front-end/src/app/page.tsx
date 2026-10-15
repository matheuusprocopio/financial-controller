"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  LogIn,
  Menu,
  MessageSquare,
  Shield,
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    backendUser,
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
    let lastUpdate = 0;
    const throttleDelay = 1;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastUpdate >= throttleDelay) {
        setMousePosition({ x: e.clientX, y: e.clientY });
        lastUpdate = now;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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
      icon: <TrendingUp className="feature-icon" />,
      title: "Inteligência Artificial Avançada",
      description:
        "IA que analisa seus gastos, identifica padrões de consumo e oferece insights personalizados em tempo real.",
    },
    {
      icon: <MessageSquare className="feature-icon" />,
      title: "Registro Inteligente",
      description:
        "Registre suas transações de forma rápida e intuitiva através de conversas naturais com nosso assistente.",
    },
    {
      icon: <Target className="feature-icon" />,
      title: "Controle de Metas",
      description:
        "Defina e acompanhe suas metas financeiras com ajuda da IA que te mantém no caminho certo.",
    },
    {
      icon: <Bot className="feature-icon" />,
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

  const displayName = backendUser?.name || (isBackendAuthenticated ? "Carregando..." : "Minha Conta");
  const isLoggedIn = isBackendAuthenticated;
  const accountLabel = isLoggedIn ? "Minha Conta" : "Entrar";
  //console.log(isLoggedIn);
  const desktopAuthControls = isLoggedIn ? (
    <>
      <Button
        onClick={() => setLoginModalOpen(true)}
        variant="ghost"
        className="flex items-center gap-2 text-gray-200 transition hover:text-cyan-200"
      >
        <UserIcon className="h-4 w-4" />
        Minha conta
      </Button>
      <Link href="/chat">
        <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 font-semibold text-white shadow-[0_10px_30px_-12px_rgba(147,51,234,0.7)] transition hover:scale-[1.02]">
          Abrir App
        </Button>
      </Link>
    </>
  ) : (
    <>
      <Button
        onClick={() => setLoginModalOpen(true)}
        variant="ghost"
        className="flex items-center gap-2 text-gray-200 transition hover:text-cyan-200"
      >
        <LogIn className="h-4 w-4" />
        Entrar
      </Button>
      <Link href="/chat">
        <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 font-semibold text-white shadow-[0_10px_30px_-12px_rgba(147,51,234,0.7)] transition hover:scale-[1.02]">
          Abrir App
        </Button>
      </Link>
    </>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute h-96 w-96 rounded-full bg-purple-600/30 blur-[64px] transition-all duration-700 ease-out"
          style={{
            left: `${mousePosition.x - 192}px`,
            top: `${mousePosition.y - 192}px`,
          }}
        />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-cyan-400/20 blur-[64px] animate-pulse" />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-[64px] animate-pulse [animation-delay:1s]" />
      </div>

      <div className="pointer-events-none fixed inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400 blur-md opacity-60" />
              <Wallet className="relative z-10 h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-300 via-cyan-200 to-purple-300 bg-clip-text text-xl font-semibold text-transparent">
              FinancialController
            </span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-gray-300 transition hover:text-cyan-300">
              Recursos
            </a>
            <a href="#tech" className="text-gray-300 transition hover:text-cyan-300">
              Funcionalidades
            </a>
            {desktopAuthControls}
          </div>

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white transition hover:border-cyan-300 hover:text-cyan-300 md:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-black/80 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-gray-200 transition hover:text-cyan-300">
                Recursos
              </a>
              <a href="#tech" className="text-gray-200 transition hover:text-cyan-300">
                Funcionalidades
              </a>
              <Button
                onClick={() => setLoginModalOpen(true)}
                variant="outline"
                className="w-full border-white/20 text-white hover:border-cyan-300 hover:text-cyan-100"
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoggedIn ? <UserIcon className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                  {accountLabel}
                </span>
              </Button>
              <Link href="/chat">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 font-semibold text-white shadow-[0_10px_30px_-12px_rgba(147,51,234,0.7)]">
                  Abrir App
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      <section className="px-4 pb-20 pt-28 sm:pt-32">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-gray-200 shadow-lg backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.8)]" />
              <span className="whitespace-nowrap">
                Controle Financeiro com IA • Disponível Agora
              </span>
            </div>

            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Controle suas {" "}
              <span className="bg-gradient-to-r from-purple-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                Finanças
              </span>{" "}
              com Inteligência
            </h1>

            <p className="text-lg text-gray-300 md:text-xl">
              Use o poder da inteligência artificial para registrar gastos, entender seus hábitos financeiros e alcançar suas metas através de conversas simples.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/chat">
                <Button
                  size="lg"
                  className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-cyan-600 font-semibold text-white shadow-[0_20px_60px_-20px_rgba(34,211,238,0.6)] transition hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-transparent to-cyan-500/30 blur-lg" />
                  <span className="relative flex items-center gap-2">
                    Começar Agora
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 text-white transition hover:border-cyan-300 hover:text-cyan-100"
              >
                Ver Como Funciona
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent" />
                <div className="relative">
                  <div className="text-3xl font-bold text-white">100%</div>
                  <div className="text-sm text-gray-400">Interface por Chat</div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 to-transparent" />
                <div className="relative">
                  <div className="text-3xl font-bold text-white">IA</div>
                  <div className="text-sm text-gray-400">Análise Inteligente</div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent" />
                <div className="relative">
                  <div className="text-3xl font-bold text-white">24/7</div>
                  <div className="text-sm text-gray-400">Controle Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="px-4 py-20">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Recursos {" "}
              <span className="bg-gradient-to-r from-purple-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                Inteligentes
              </span>
            </h2>
            <p className="text-lg text-gray-300">
              Construído com as mais recentes inovações em IA para tornar o controle financeiro simples e eficiente.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card
                key={`${feature.title}-${index}`}
                className="relative overflow-hidden border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur transition hover:-translate-y-1 hover:border-cyan-300/40 hover:shadow-[0_20px_60px_-40px_rgba(8,145,178,0.8)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-400/10" />
                <div className="relative space-y-4">
                  <div className="relative inline-flex">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 blur-lg opacity-60" />
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 text-white shadow-lg">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-sm text-gray-300">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="tech" className="px-4 py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Controle Financeiro {" "}
              <span className="bg-gradient-to-r from-purple-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                do Futuro
              </span>
            </h2>
            <p className="text-lg text-gray-300">
              Nossa plataforma usa inteligência artificial avançada para oferecer uma experiência única de gestão financeira através de conversas naturais.
            </p>
            <div className="space-y-3">
              {techFeatures.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-200 backdrop-blur"
                >
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 blur-md opacity-60" />
                    <CheckCircle2 className="relative z-10 h-5 w-5 text-white" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/30 via-transparent to-cyan-400/30 blur-3xl" />
              <Card className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-12 shadow-[0_30px_80px_-60px_rgba(34,211,238,0.8)] backdrop-blur">
                <div className="relative flex h-40 items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(147,51,234,0.15),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(6,182,212,0.2),transparent_35%)]" />
                  <div className="absolute h-24 w-24 animate-pulse rounded-full bg-gradient-to-br from-purple-500/40 to-cyan-400/40 blur-xl" />
                  <TrendingUp className="relative z-10 h-16 w-16 text-white" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="security" className="px-4 pb-24">
        <div className="mx-auto max-w-5xl">
          <Card className="relative overflow-hidden border border-white/10 bg-gradient-to-r from-purple-700/30 via-black/40 to-cyan-700/30 p-10 shadow-[0_25px_80px_-60px_rgba(6,182,212,0.8)] backdrop-blur">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(147,51,234,0.3),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(6,182,212,0.25),transparent_35%)]" />
            <div className="relative flex flex-col items-center gap-6 text-center">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 blur-lg opacity-60" />
                <Shield className="relative z-10 h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-semibold sm:text-4xl">
                Pronto para Transformar suas Finanças?
              </h2>
              <p className="max-w-2xl text-lg text-gray-200">
                Junte-se à nova geração de controle financeiro. IA avançada, controle total, simplicidade máxima.
              </p>
              <Link href="/chat">
                <Button
                  size="lg"
                  className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-cyan-600 font-semibold text-white shadow-[0_20px_60px_-20px_rgba(34,211,238,0.6)] transition hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-transparent to-cyan-500/30 blur-lg" />
                  <span className="relative flex items-center gap-2">
                    Iniciar Conversa
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black/60 px-4 py-8 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400 blur-md opacity-60" />
              <Wallet className="relative z-10 h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-300 via-cyan-200 to-purple-300 bg-clip-text text-lg font-semibold text-transparent">
              FinancialController
            </span>
          </div>
          <p className="text-sm text-gray-400">
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
