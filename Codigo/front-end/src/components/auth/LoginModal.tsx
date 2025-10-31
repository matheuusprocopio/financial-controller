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
import { CheckCircle2, XCircle, Loader2, LogIn, LogOut, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

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
      
      // Redirect to chat after successful login
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
      
      // Redirect to chat after successful signup
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
      
      // Redirect to chat after successful login
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {user ? "Minha Conta" : "Entrar"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Gerencie sua conta e preferências"
              : "Entre ou crie uma conta para começar"}
          </DialogDescription>
        </DialogHeader>

        {status && (
          <Alert
            className={`mb-4 ${
              status.type === "success"
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : status.type === "error"
                ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                : "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            }`}
          >
            <div className="flex items-center gap-2">
              {status.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : status.type === "error" ? (
                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              ) : (
                <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              )}
              <AlertDescription className="text-sm font-medium">
                {status.message}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {user ? (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.displayName || "Usuário"}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  onOpenChange(false);
                  router.push("/chat");
                }}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Abrir App
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex-1"
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
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="seu-email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleEmailLogin)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Senha</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleEmailLogin)}
                />
              </div>
              <Button
                onClick={handleEmailLogin}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4 mr-2" />
                )}
                Entrar
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    ou
                  </span>
                </div>
              </div>

              <Button
                onClick={handleGoogleLogin}
                className="w-full"
                variant="outline"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Continuar com Google
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="seu-email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Senha</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">Confirmar Senha</Label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleEmailSignup)}
                />
              </div>
              <Button
                onClick={handleEmailSignup}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4 mr-2" />
                )}
                Criar Conta
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    ou
                  </span>
                </div>
              </div>

              <Button
                onClick={handleGoogleLogin}
                className="w-full"
                variant="outline"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
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

