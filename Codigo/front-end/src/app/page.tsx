"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn, Menu, User as UserIcon, Wallet, X } from "lucide-react";
import LoginModal from "@/components/auth/LoginModal";
import ProductPreview from "@/components/landing/ProductPreview";
import FeatureGrid from "@/components/landing/FeatureGrid";
import Faq from "@/components/landing/Faq";
import { useAuth } from "@/hooks/use-auth";

const NAV_LINKS = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#recursos", label: "Recursos" },
  { href: "#perguntas", label: "Perguntas" },
];

const STEPS = [
  {
    title: "Escreva ou fale",
    description:
      "Conte o que aconteceu do seu jeito: “almocei por 32 reais”, “recebi o salário”, “quanto gastei com mercado?”.",
  },
  {
    title: "O assistente organiza",
    description:
      "Ele identifica valor, data, conta e categoria e mostra um formulário já preenchido para você conferir.",
  },
  {
    title: "Acompanhe e decida",
    description:
      "Peça relatórios, compare meses e acompanhe suas metas sem sair da conversa.",
  },
];

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

  const isLoggedIn = isBackendAuthenticated;
  const primaryButton = "bg-neutral-100 font-medium text-neutral-950 hover:bg-white";
  const secondaryButton =
    "border border-white/15 bg-transparent font-medium text-neutral-200 hover:bg-white/5 hover:text-white";

  const brand = (
    <Link href="/" className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-md border border-white/15 bg-white/5">
        <Wallet className="h-4 w-4 text-neutral-200" />
      </div>
      <span className="text-[15px] font-medium tracking-tight text-neutral-100">
        FinancialController
      </span>
    </Link>
  );

  const accountButton = (className: string) => (
    <Button onClick={() => setLoginModalOpen(true)} className={className}>
      {isLoggedIn ? <UserIcon className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
      {isLoggedIn ? "Minha conta" : "Entrar"}
    </Button>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            {brand}
            <div className="hidden items-center gap-6 md:flex">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-neutral-400 transition-colors hover:text-neutral-100"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {accountButton("h-8 gap-2 bg-transparent px-3 text-sm text-neutral-400 hover:bg-white/5 hover:text-neutral-100")}
            <Link href="/chat">
              <Button size="sm" className={primaryButton}>
                Abrir app
              </Button>
            </Link>
          </div>

          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-300 transition-colors hover:bg-white/5 md:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/10 px-4 pb-4 md:hidden">
            <div className="flex flex-col py-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-sm text-neutral-300 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {accountButton(`gap-2 ${secondaryButton}`)}
              <Link href="/chat">
                <Button className={`w-full ${primaryButton}`}>Abrir app</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main>
        <section className="px-4 pt-20 sm:px-6 sm:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm text-neutral-500">Assistente financeiro com IA</p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
              Suas finanças, organizadas em uma conversa.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-400">
              Registre gastos, acompanhe metas e entenda para onde vai o seu dinheiro escrevendo ou falando com um assistente. Sem planilhas e sem formulários longos.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link href="/chat">
                <Button size="lg" className={`gap-2 ${primaryButton}`}>
                  Começar agora
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#como-funciona">
                <Button size="lg" className={secondaryButton}>
                  Como funciona
                </Button>
              </a>
            </div>
          </div>

          <div className="relative mx-auto mt-16 max-w-5xl sm:mt-20">
            <ProductPreview />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-neutral-950 to-transparent" />
          </div>
        </section>

        <section id="como-funciona" className="scroll-mt-14 px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Como funciona</h2>
              <p className="mt-3 text-lg text-neutral-400">
                Três passos, o mesmo lugar para tudo.
              </p>
            </div>
            <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {STEPS.map((step, index) => (
                <li key={step.title} className="border-t border-white/10 pt-6">
                  <span className="font-mono text-sm text-neutral-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-lg font-medium">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-neutral-400">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="recursos" className="scroll-mt-14 border-t border-white/10 px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Tudo o que você precisa para controlar o dia a dia
              </h2>
              <p className="mt-3 text-lg text-neutral-400">
                Transações, contas, cartões, categorias e metas, todos acessíveis pela conversa.
              </p>
            </div>
            <div className="mt-12">
              <FeatureGrid />
            </div>
          </div>
        </section>

        <section id="perguntas" className="scroll-mt-14 border-t border-white/10 px-4 py-24 sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Perguntas frequentes</h2>
              <p className="mt-3 text-neutral-400">O essencial para começar.</p>
            </div>
            <Faq />
          </div>
        </section>

        <section className="border-t border-white/10 px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Comece pela próxima compra.
            </h2>
            <p className="mt-4 text-lg text-neutral-400">
              Crie sua conta e registre seu primeiro gasto em menos de um minuto.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/chat">
                <Button size="lg" className={`gap-2 ${primaryButton}`}>
                  Abrir o app
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-4 py-12 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-[2fr_1fr_1fr]">
          <div className="space-y-3">
            {brand}
            <p className="max-w-xs text-sm leading-relaxed text-neutral-500">
              Controle financeiro pessoal por conversa, com inteligência artificial.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-neutral-200">Produto</h3>
            <ul className="mt-3 space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-neutral-500 transition-colors hover:text-neutral-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-neutral-200">Conta</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => setLoginModalOpen(true)}
                  className="text-sm text-neutral-500 transition-colors hover:text-neutral-200"
                >
                  {isLoggedIn ? "Minha conta" : "Entrar"}
                </button>
              </li>
              <li>
                <Link href="/chat" className="text-sm text-neutral-500 transition-colors hover:text-neutral-200">
                  Abrir app
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-6xl border-t border-white/10 pt-6 text-sm text-neutral-600">
          © {new Date().getFullYear()} FinancialController
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
