"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Wallet,
  TrendingUp,
  MessageSquare,
  Target,
  Bot,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Menu,
  X,
  Shield,
  LogIn,
  User
} from "lucide-react";
import Link from "next/link";
import LoginModal from "@/components/auth/LoginModal";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import "./landingPage.css";

function LandingTechContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { user, loading: userLoading } = useAuth();
  const userChecked = !userLoading;
  const searchParams = useSearchParams();
  const router = useRouter();

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

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!userChecked) return;
    
    const shouldOpenLogin = searchParams.get("login") === "true";
    if (shouldOpenLogin && !user) {
      setLoginModalOpen(true);
    }
  }, [searchParams, user, userChecked]);

  const handleLoginModalChange = (open: boolean) => {
    setLoginModalOpen(open);
    if (!open && searchParams.get("login") === "true") {
      router.replace("/", { scroll: false });
    }
  };

  const features = [
    {
      icon: <TrendingUp className="feature-icon" />,
      title: "Inteligência Artificial Avançada",
      description: "IA que analisa seus gastos, identifica padrões de consumo e oferece insights personalizados em tempo real."
    },
    {
      icon: <MessageSquare className="feature-icon" />,
      title: "Registro Inteligente",
      description: "Registre suas transações de forma rápida e intuitiva através de conversas naturais com nosso assistente."
    },
    {
      icon: <Target className="feature-icon" />,
      title: "Controle de Metas",
      description: "Defina e acompanhe suas metas financeiras com ajuda da IA que te mantém no caminho certo."
    },
    {
      icon: <Bot className="feature-icon" />,
      title: "Interface por Chat",
      description: "Gerencie suas finanças conversando naturalmente, sem complicações ou formulários complexos."
    } 
  ];

  const techFeatures = [
    "Registro automático de transações via chat",
    "Análise inteligente de padrões de gastos",
    "Acompanhamento de metas financeiras",
    "Insights personalizados com IA",
    "Categorização automática de despesas",
    "Relatórios e visualizações intuitivas"
  ];

  return (
    <div className="landing-container">

      <div className="animated-bg">
        <div
          className="mouse-follow-blur"
          style={{
            left: `${mousePosition.x - 192}px`,
            top: `${mousePosition.y - 192}px`,
          }}
        />
        <div className="static-blur-1" />
        <div className="static-blur-2" />
      </div>

      <div className="grid-overlay">
        <div className="grid-pattern" />
      </div>

 
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-content">
            <div className="nav-brand">
            <div className="nav-logo">
              <div className="nav-logo-glow" />
              <Wallet className="nav-logo-icon" />
              </div>
              <span className="nav-title">
                FinancialController
              </span>
            </div>


            <div className="nav-menu-desktop">
              <a href="#features" className="nav-link">Recursos</a>
              <a href="#tech" className="nav-link">Funcionalidades</a>
              
              {user ? (
                <>
                  <Button
                    onClick={() => setLoginModalOpen(true)}
                    variant="ghost"
                    className="nav-link gap-2"
                  >
                    <User className="h-4 w-4" />
                    {user.displayName}

                  </Button>
                  <Link href="/chat">
                    <Button className="nav-button">
                      Abrir App
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setLoginModalOpen(true)}
                    variant="ghost"
                    className="nav-link gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    Entrar
                  </Button>
                  <Link href="/chat">
                    <Button className="nav-button">
                      Abrir App
                    </Button>
                  </Link>
                </>
              )}
            </div>


            <button
              className="nav-mobile-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="nav-mobile-menu">
            <div className="nav-mobile-content">
              <a href="#features" className="nav-mobile-link">Recursos</a>
              <a href="#tech" className="nav-mobile-link">Funcionalidades</a>
              
              {user ? (
                <>
                  <Button
                    onClick={() => {
                      setLoginModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <User className="h-4 w-4" />
                    {user.email?.split('@')[0]}
                  </Button>
                  <Link href="/chat">
                    <Button className="nav-mobile-button-full">
                      Abrir App
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setLoginModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    Entrar
                  </Button>
                  <Link href="/chat">
                    <Button className="nav-mobile-button-full">
                      Abrir App
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>


      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <div className="hero-badge-dot" />
              <span className="hero-badge-text">Controle Financeiro com IA • Disponível Agora</span>
            </div>

            <h1 className="hero-title">
              Controle suas{" "}
              <span className="hero-title-gradient">
                Finanças
              </span>{" "}
              com Inteligência
            </h1>

            <p className="hero-description">
              Use o poder da inteligência artificial para registrar gastos, entender seus hábitos financeiros e alcançar suas metas através de conversas simples.
            </p>

            <div className="hero-buttons">
              <Link href="/chat">
                <Button size="lg" className="hero-button-primary">
                  <div className="hero-button-glow" />
                  <span className="hero-button-text">
                    Começar Agora
                    <ArrowRight className="hero-button-icon" />
                  </span>
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="hero-button-secondary"
              >
                Ver Como Funciona
              </Button>
            </div>

            <div className="hero-stats">
              <div className="stat-card">
                <div className="stat-card-glow" />
                <div className="stat-card-content">
                  <div className="stat-number">100%</div>
                  <div className="stat-label">Interface por Chat</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-glow" />
                <div className="stat-card-content">
                  <div className="stat-number">IA</div>
                  <div className="stat-label">Análise Inteligente</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-glow" />
                <div className="stat-card-content">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Controle Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section id="features" className="features-section">
        <div className="features-container">
          <div className="features-header">
            <h2 className="features-title">
              Recursos{" "}
              <span className="features-title-gradient">
                Inteligentes
              </span>
            </h2>
            <p className="features-subtitle">
              Construído com as mais recentes inovações em IA para tornar o controle financeiro simples e eficiente.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="feature-card"
              >
                <div className="feature-card-glow" />
                <div className="relative">
                  <div className="feature-icon-container">
                    <div className="feature-icon-glow" />
                    <div className="relative z-10 text-white">{feature.icon}</div>
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>


      <section id="tech" className="tech-section">
        <div className="tech-container">
          <div className="tech-content">
            <div>
              <h2 className="tech-title">
                Controle Financeiro{" "}
                <span className="tech-title-gradient">
                  do Futuro
                </span>
              </h2>
              <p className="tech-description">
                Nossa plataforma usa inteligência artificial avançada para oferecer uma experiência única de gestão financeira através de conversas naturais.
              </p>
              <div className="tech-features">
                {techFeatures.map((feature, index) => (
                  <div key={index} className="tech-feature">
                    <div className="tech-feature-icon-container">
                      <div className="tech-feature-icon-glow" />
                      <CheckCircle2 className="tech-feature-icon" />
                    </div>
                    <span className="tech-feature-text">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="tech-visual">
              <div className="tech-visual-glow" />
              <Card className="tech-card">
            <div className="tech-card-visual">
              <div className="tech-card-animation" />
              <TrendingUp className="tech-card-icon" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>


      <section id="security" className="cta-section">
        <div className="cta-container">
          <Card className="cta-card">
            <div className="cta-card-overlay" />
            <div className="cta-card-glow-1" />
            <div className="cta-card-glow-2" />
            <div className="cta-content">
              <div className="cta-icon-container">
                <Shield className="cta-icon" />
              </div>
              <h2 className="cta-title">
                Pronto para Transformar suas Finanças?
              </h2>
              <p className="cta-description">
                Junte-se à nova geração de controle financeiro.
                IA avançada, controle total, simplicidade máxima.
              </p>
              <Link href="/chat">
                <Button size="lg" className="cta-button">
                  <div className="cta-button-glow" />
                  <span className="cta-button-text">
                    Iniciar Conversa
                    <ChevronRight className="cta-button-icon" />
                  </span>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
          <div className="footer-logo">
            <div className="footer-logo-glow" />
            <Wallet className="footer-logo-icon" />
            </div>
            <span className="footer-title">
              FinancialController
            </span>
          </div>
          <p className="footer-copyright">
            © 2025 FinancialController. Seu controle financeiro inteligente via chat.
          </p>
        </div>
      </footer>

      <LoginModal open={loginModalOpen} onOpenChange={handleLoginModalChange} />
    </div>
  );
}

export default function LandingTech() {
  return (
    //adicionar loading pra tela não piscar branco
    <Suspense >
      
      <LandingTechContent />
    </Suspense>
  );
}
