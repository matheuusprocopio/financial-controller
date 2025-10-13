"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CreditCard,
  Zap,
  Lock,
  Cpu,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Menu,
  X,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import "./landingPage.css";

export default function LandingTech() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let lastUpdate = 0;
    const throttleDelay = 1; // ~60fps (1000ms / 60fps = 16.67ms)

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();

      // Só atualiza se passou tempo suficiente
      if (now - lastUpdate >= throttleDelay) {
        setMousePosition({ x: e.clientX, y: e.clientY });
        lastUpdate = now;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: <Cpu className="feature-icon" />,
      title: "AI-Powered Intelligence",
      description: "Advanced machine learning algorithms analyze your spending patterns in real-time."
    },
    {
      icon: <Zap className="feature-icon" />,
      title: "Lightning Fast",
      description: "Process transactions and generate insights at unprecedented speeds with our optimized engine."
    },
    {
      icon: <Lock className="feature-icon" />,
      title: "info 3",
      description: "descrição 3."
    },
    {
      icon: <Sparkles className="feature-icon" />,
      title: "info 4",
      description: "descrição 4."
    } 
  ];

  const techFeatures = [
    "Real-time transaction monitoring",
    "Predictive spending analytics",
    "Blockchain-verified security",
    "API integration ready",
    "Cloud-native architecture",
    "Zero-knowledge encryption"
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
                <CreditCard className="nav-logo-icon" />
              </div>
              <span className="nav-title">
                FinancialController
              </span>
            </div>


            <div className="nav-menu-desktop">
              <a href="#features" className="nav-link">Features</a>
              <a href="#tech" className="nav-link">Technology</a>
              <a href="#security" className="nav-link">Security</a>
              <Link href="/chat">
                <Button className="nav-button">
                  Launch App
                </Button>
              </Link>
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
              <a href="#features" className="nav-mobile-link">Features</a>
              <a href="#tech" className="nav-mobile-link">Technology</a>
              <a href="#security" className="nav-mobile-link">Security</a>
              <Link href="/chat">
                <Button className="nav-mobile-button-full">
                  Launch App
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>


      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <div className="hero-badge-dot" />
              <span className="hero-badge-text">Next-Gen Financial AI • Now Live</span>
            </div>

            <h1 className="hero-title">
              The Future of{" "}
              <span className="hero-title-gradient">
                Finance
              </span>{" "}
              is Here
            </h1>

            <p className="hero-description">
              Harness the power of artificial intelligence and cutting-edge technology to revolutionize
              how you manage your credit cards and finances.
            </p>

            <div className="hero-buttons">
              <Link href="/chat">
                <Button size="lg" className="hero-button-primary">
                  <div className="hero-button-glow" />
                  <span className="hero-button-text">
                    Access Platform
                    <ArrowRight className="hero-button-icon" />
                  </span>
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="hero-button-secondary"
              >
                View Documentation
              </Button>
            </div>

            <div className="hero-stats">
              <div className="stat-card">
                <div className="stat-card-glow" />
                <div className="stat-card-content">
                  <div className="stat-number">num 1</div>
                  <div className="stat-label">info 1</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-glow" />
                <div className="stat-card-content">
                  <div className="stat-number">num 2</div>
                  <div className="stat-label">info 2</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-glow" />
                <div className="stat-card-content">
                  <div className="stat-number">num 3</div>
                  <div className="stat-label">info 3</div>
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
              Advanced{" "}
              <span className="features-title-gradient">
                Technology
              </span>
            </h2>
            <p className="features-subtitle">
              Built with the latest innovations in AI, security, and cloud computing.
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
                Built for{" "}
                <span className="tech-title-gradient">
                  Tomorrow
                </span>
              </h2>
              <p className="tech-description">
                Our platform leverages cutting-edge technology to deliver unmatched performance,
                security, and scalability.
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
                  <Cpu className="tech-card-icon" />
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
                <Lock className="cta-icon" />
              </div>
              <h2 className="cta-title">
                Ready to Experience the Future?
              </h2>
              <p className="cta-description">
                Join the next generation of financial management.
                Advanced AI, maximum security, zero compromise.
              </p>
              <Link href="/chat">
                <Button size="lg" className="cta-button">
                  <div className="cta-button-glow" />
                  <span className="cta-button-text">
                    Initialize System
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
              <CreditCard className="footer-logo-icon" />
            </div>
            <span className="footer-title">
              FinancialController
            </span>
          </div>
          <p className="footer-copyright">
            © 2025 FinancialController. Powered by advanced AI technology.
          </p>
        </div>
      </footer>
    </div>
  );
}
