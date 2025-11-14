"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  User,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { CheckCircle2, XCircle, Loader2, LogIn, LogOut, Mail, AlignCenter } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setStatus({
        type: "error",
        message: "Por favor, preencha email e senha",
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setStatus({ type: "success", message: "Login realizado com sucesso!" });

      setTimeout(() => {
        onOpenChange(false);
        router.push("/chat");
      }, 1000);
    } catch (error: any) {
      setStatus({
        type: "error",
        message: "Email ou senha inválidos",
      });
    } finally {
      setLoading(false);
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

    if (password !== confirmPassword) {
      setStatus({
        type: "error",
        message: "As senhas não coincidem",
      });
      return;
    }

    if (password.length < 6) {
      setStatus({
        type: "error",
        message: "A senha deve ter pelo menos 6 caracteres",
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setStatus({
        type: "success",
        message: "Conta criada com sucesso!",
      });

      setTimeout(() => {
        onOpenChange(false);
        router.push("/chat");
      }, 1000);
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setStatus({
          type: "error",
          message: "Este email já está cadastrado",
        });
      } else if (error.code === "auth/invalid-email") {
        setStatus({
          type: "error",
          message: "Email inválido",
        });
      } else {
        setStatus({
          type: "error",
          message: "Erro ao criar conta",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setStatus(null);

    try {
      await signInWithPopup(auth, googleProvider);
      setStatus({
        type: "success",
        message: "Login com Google realizado com sucesso!",
      });

      setTimeout(() => {
        onOpenChange(false);
        router.push("/chat");
      }, 1000);
    } catch (error: any) {
      setStatus({
        type: "error",
        message: "Erro ao fazer login com Google",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setStatus({ type: "info", message: "Logout realizado com sucesso!" });
    } catch (error: any) {
      setStatus({ type: "error", message: "Erro ao fazer logout" });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] px-50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-blue-500/20 text-white p-10">
        <DialogHeader className="space-y-3 mb-6  " style={{ padding: 30 }}>
          <DialogTitle className="text-3xl px-100 font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            {user ? "Minha Conta" : "Bem-vindo"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {user
              ? "Gerencie sua conta e preferências"
              : "Entre ou crie uma conta para continuar"}
          </DialogDescription>
        </DialogHeader>

        {status && (
          <Alert style={{
            paddingRight: 30, paddingLeft: 30, minHeight: 40, display: "flex", alignItems: "center"
          }}
            className={`border mb-6 flex  ${status.type === "success"
              ? "border-green-500/50 bg-green-500/10"
              : status.type === "error"
                ? "border-red-400/50 bg-red-400/10"
                : "border-blue-500/50 bg-blue-500/10"
              }`}
          >
            <div className="flex items-center gap-2" >
              {status.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : status.type === "error" ? (
                <XCircle className="w-4 h-4 text-red-400" />
              ) : (
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              )}
              <AlertDescription className="text-sm font-medium text-white">
                {status.message}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {user ? (
          <div className="space-y-8">
            <div className="p-8 bg-gradient-to-br from-blue-950/50 to-purple-950/50 rounded-xl border border-blue-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-purple-500/30">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-white">
                    {user.displayName || "Usuário"}
                  </p>
                  <p className="text-sm text-slate-400">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  onOpenChange(false);
                  router.push("/chat");
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg shadow-purple-500/30 transition-all h-12"
              >
                Abrir App
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex-1 border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-white h-12"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4 mr-2" />
                )}
                Sair
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="login" className="w-full" style={{ paddingRight: 30, paddingLeft: 30 }}>
            <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 border border-slate-800 h-12">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-400 font-medium"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-400 font-medium"
              >
                Criar Conta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" style={{ paddingTop: 30, paddingBottom: 30 }} className="space-y-6 mt-10">
              <div className="space-y-3" >
                <Label htmlFor="login-email" className="text-slate-300 font-medium text-sm">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="seu-email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleEmailLogin)}
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-12 text-base"
                />
              </div>
              <div className="space-y-3" style={{ paddingTop: 30, paddingBottom: 30 }}>
                <Label htmlFor="login-password" className="text-slate-300 font-medium text-sm">Senha</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleEmailLogin)}
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-12 text-base"
                />
              </div>
              <Button
                onClick={handleEmailLogin}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg shadow-purple-500/30 h-12 text-base mt-4"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <LogIn className="w-5 h-5 mr-2" />
                )}
                Entrar
              </Button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase" style={{ padding: 30 }}>
                  <span className="bg-slate-950 px-3 text-slate-500 font-medium">
                    ou continue com
                  </span>
                </div>
              </div>

              <Button
                onClick={handleGoogleLogin}
                className="w-full border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-white h-12 text-base font-medium"
                variant="outline"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Continuar com Google
              </Button>
            </TabsContent>

            <TabsContent value="signup" style={{ paddingTop: 30, paddingBottom: 30 }} className="space-y-6 mt-10" >
              <div className="space-y-3" >
                <Label htmlFor="signup-email" className="text-slate-300 font-medium text-sm">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="seu-email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20 h-12 text-base"
                />
              </div>
              <div className="space-y-3" style={{ paddingTop: 30 }}>
                <Label htmlFor="signup-password" className="text-slate-300 font-medium text-sm">Senha</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20 h-12 text-base"
                />
              </div>
              <div className="space-y-3" style={{ paddingTop: 30, paddingBottom: 30 }}>
                <Label htmlFor="signup-confirm-password" className="text-slate-300 font-medium text-sm">Confirmar Senha</Label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleEmailSignup)}
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20 h-12 text-base"
                />
              </div>
              <Button
                onClick={handleEmailSignup}
                className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-700 hover:via-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/30 h-12 text-base mt-4"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <LogIn className="w-5 h-5 mr-2" />
                )}
                Criar Conta
              </Button>

              <div className="relative my-8" >
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase" style={{ padding: 30 }}>
                  <span className="bg-slate-950 px-3 text-slate-500 font-medium" >
                    ou continue com
                  </span>
                </div>
              </div>

              <Button
                onClick={handleGoogleLogin}
                className="w-full border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-white h-12 text-base font-medium"
                variant="outline"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Continuar com Google
              </Button>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
