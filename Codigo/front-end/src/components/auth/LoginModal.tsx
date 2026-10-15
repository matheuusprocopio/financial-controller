"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  LogIn,
  LogOut,
  X,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notice?: string;
}

export default function LoginModal({ open, onOpenChange, notice }: LoginModalProps) {
  const router = useRouter();
  const {
    user: firebaseUser,
    backendUser,
    loading,
    loginWithEmail,
    loginWithGoogle,
    loginBackend,
    signupWithEmail,
    logout,
  } = useAuth();
  const [status, setStatus] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  useEffect(() => {
    if (!open) {
      setStatus(null);
      return;
    }
    setActiveTab("login");
    setStatus(notice ? { type: "info", message: notice } : null);
  }, [open, notice]);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setStatus({
        type: "error",
        message: "Por favor, preencha email e senha",
      });
      return;
    }

    setStatus(null);

    try {
      const credential = await loginWithEmail(email, password);
      const idToken = await credential.user.getIdToken();
      await loginBackend(idToken);
      setStatus({ type: "success", message: "Login realizado com sucesso!" });

      setTimeout(() => {
        onOpenChange(false);
        router.push("/chat");
      }, 1000);
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "Email ou senha inválidos",
      });
    }
  };

  const handleEmailSignup = async () => {
    if (!email || !password || !confirmPassword) {
      setStatus({
        type: "error",
        message: "Por favor, preencha todos os campos",
      });
      return;
    }

    setStatus(null);

    try {
      const credential = await signupWithEmail(email, password, confirmPassword);
      const idToken = await credential.user.getIdToken();
      await loginBackend(idToken);
      setStatus({
        type: "success",
        message: "Conta criada com sucesso!",
      });

      setTimeout(() => {
        onOpenChange(false);
        router.push("/chat");
      }, 1000);
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "Erro ao criar conta",
      });
    }
  };

  const handleGoogleLogin = async () => {
    setStatus(null);

    try {
      const token = await loginWithGoogle();
      setStatus({
        type: "success",
        message: "Login com Google realizado com sucesso!",
      });
      await loginBackend(token);

      setTimeout(() => {
        onOpenChange(false);
        router.push("/chat");
      }, 1000);
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "Erro ao fazer login com Google",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setStatus({ type: "info", message: "Logout realizado com sucesso!" });
    } catch (error: any) {
      setStatus({ type: "error", message: error.message || "Erro ao fazer logout" });
    }
  };

  const handleKeyPress = (
    e: KeyboardEvent<HTMLInputElement>,
    action: () => void,
  ) => {
    if (e.key === "Enter" && !loading) {
      action();
    }
  };

  if (!open) return null;

  const closeModal = () => {
    if (loading) return;
    onOpenChange(false);
  };

  const statusStyles = {
    success: "border-green-500/40 bg-green-500/10 text-green-200",
    error: "border-red-500/40 bg-red-500/10 text-red-200",
    info: "border-blue-500/40 bg-blue-500/10 text-blue-200",
  } as const;

  const accountName = backendUser?.name || "Usuário";
  const accountEmail = backendUser?.email || firebaseUser?.email || "";
  const accountInitial = accountName?.[0]?.toUpperCase() || accountEmail?.[0]?.toUpperCase() || "U";
  const isBackendAuthenticated = !!backendUser;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={closeModal}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-50 w-full max-w-xl overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white shadow-[0_40px_120px_-60px_rgba(34,211,238,0.7)]"
      >
        <div className="flex items-center justify-between border-b border-white/5 px-8 py-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-200/70">
              FinancialController
            </p>
            <h2 className="text-3xl font-bold leading-tight">
              {isBackendAuthenticated ? "Minha Conta" : "Bem-vindo"}
            </h2>
            <p className="text-sm text-slate-400">
              {isBackendAuthenticated
                ? "Gerencie sua conta e preferências"
                : "Entre ou crie uma conta para continuar"}
            </p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white"
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative px-8 py-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent" />
          <div className="relative space-y-6">
            {status && (
              <div
                className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium ${statusStyles[status.type]}`}
              >
                {status.type === "success" && <CheckCircle2 className="h-4 w-4" />}
                {status.type === "error" && <XCircle className="h-4 w-4" />}
                {status.type === "info" && <Shield className="h-4 w-4" />}
                <span>{status.message}</span>
              </div>
            )}

            {isBackendAuthenticated ? (
              <div className="space-y-8">
                <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 p-6 shadow-inner">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-2xl font-bold shadow-lg shadow-purple-500/30">
                      {accountInitial}
                    </div>
                    <div>
                      <p className="text-lg font-semibold">
                        {accountName}
                      </p>
                      <p className="text-sm text-slate-400">{accountEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      router.push("/chat");
                    }}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 px-6 py-3 text-sm font-semibold shadow-[0_20px_60px_-25px_rgba(99,102,241,0.9)] transition hover:scale-[1.01]"
                  >
                    Abrir App
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loading}
                    className="flex-1 rounded-2xl border border-white/10 bg-slate-900/60 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                      Sair
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-2 rounded-2xl border border-white/10 bg-black/30 p-1 text-sm font-semibold text-slate-400">
                  {(["login", "signup"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-xl px-4 py-2 transition ${
                        activeTab === tab
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_10px_30px_-20px_rgba(56,189,248,0.8)]"
                          : "hover:text-white"
                      }`}
                    >
                      {tab === "login" ? "Entrar" : "Criar Conta"}
                    </button>
                  ))}
                </div>

                {activeTab === "login" ? (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label htmlFor="login-email" className="text-sm text-slate-300">
                        Email
                      </label>
                      <input
                        id="login-email"
                        type="email"
                        placeholder="seu-email@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, handleEmailLogin)}
                        className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="login-password" className="text-sm text-slate-300">
                        Senha
                      </label>
                      <input
                        id="login-password"
                        type="password"
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, handleEmailLogin)}
                        className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleEmailLogin}
                      disabled={loading}
                      className="w-full rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 px-4 py-3 text-sm font-semibold shadow-[0_20px_60px_-25px_rgba(37,99,235,0.9)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="flex items-center justify-center gap-2">
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <LogIn className="h-4 w-4" />
                        )}
                        Entrar
                      </span>
                    </button>

                    <div className="relative py-4 text-center text-xs uppercase tracking-[0.4em] text-slate-500">
                      <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
                      <span className="relative bg-slate-950 px-3">ou continue com</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      )}
                      Continuar com Google
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label htmlFor="signup-email" className="text-sm text-slate-300">
                        Email
                      </label>
                      <input
                        id="signup-email"
                        type="email"
                        placeholder="seu-email@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="signup-password" className="text-sm text-slate-300">
                        Senha
                      </label>
                      <input
                        id="signup-password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="signup-confirm-password"
                        className="text-sm text-slate-300"
                      >
                        Confirmar Senha
                      </label>
                      <input
                        id="signup-confirm-password"
                        type="password"
                        placeholder="Digite a senha novamente"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, handleEmailSignup)}
                        className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleEmailSignup}
                      disabled={loading}
                      className="w-full rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold shadow-[0_20px_60px_-25px_rgba(168,85,247,0.8)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="flex items-center justify-center gap-2">
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <LogIn className="h-4 w-4" />
                        )}
                        Criar Conta
                      </span>
                    </button>

                    <div className="relative py-4 text-center text-xs uppercase tracking-[0.4em] text-slate-500">
                      <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
                      <span className="relative bg-slate-950 px-3">ou continue com</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      )}
                      Continuar com Google
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
