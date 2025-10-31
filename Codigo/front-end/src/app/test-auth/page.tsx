"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signInWithEmailAndPassword, signInWithPopup, User, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { CheckCircle2, XCircle, Loader2, LogIn, LogOut, Shield } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function TestAuthPage() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Verifica se há usuário logado ao carregar
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();
          setToken(idToken);
        } catch (error) {
          console.error("Erro ao obter token:", error);
        }
      } else {
        setToken("");
        setSessionId("");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setStatus({ type: "error", message: "Por favor, preencha email e senha" });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      setToken(idToken);
      setStatus({ type: "success", message: "Login realizado com sucesso!" });
    } catch (error: any) {
      setStatus({ type: "error", message: error.message || "Erro ao fazer login" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const idToken = await userCredential.user.getIdToken();
      setToken(idToken);
      setStatus({ type: "success", message: "Login com Google realizado com sucesso!" });
    } catch (error: any) {
      setStatus({ type: "error", message: error.message || "Erro ao fazer login com Google" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setStatus({ type: "info", message: "Logout realizado com sucesso!" });
      
      // Se houver sessão, faz logout no backend também
      if (sessionId) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: { "X-Session-Id": sessionId },
        });
        setSessionId("");
      }
    } catch (error: any) {
      setStatus({ type: "error", message: error.message || "Erro ao fazer logout" });
    } finally {
      setLoading(false);
    }
  };

  const handleBackendLogin = async () => {
    if (!token) {
      setStatus({ type: "error", message: "Por favor, faça login no Firebase primeiro" });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSessionId(data.sessionId);
        setStatus({ type: "success", message: "Login no backend realizado com sucesso!" });
      } else {
        setStatus({ type: "error", message: data.message || "Erro ao fazer login no backend" });
      }
    } catch (error: any) {
      setStatus({ type: "error", message: error.message || "Erro ao conectar com o backend" });
    } finally {
      setLoading(false);
    }
  };

  const handleValidateSession = async () => {
    if (!sessionId) {
      setStatus({ type: "error", message: "Por favor, faça login no backend primeiro" });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch(`${API_BASE}/auth/validate`, {
        method: "GET",
        headers: { "X-Session-Id": sessionId },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus({ type: "success", message: "Sessão válida!" });
      } else {
        setStatus({ type: "error", message: data.message || "Sessão inválida" });
      }
    } catch (error: any) {
      setStatus({ type: "error", message: error.message || "Erro ao validar sessão" });
    } finally {
      setLoading(false);
    }
  };

  const handleBackendLogout = async () => {
    if (!sessionId) {
      setStatus({ type: "error", message: "Nenhuma sessão para encerrar" });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { "X-Session-Id": sessionId },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSessionId("");
        setStatus({ type: "success", message: "Logout do backend realizado com sucesso!" });
      } else {
        setStatus({ type: "error", message: data.message || "Erro ao fazer logout" });
      }
    } catch (error: any) {
      setStatus({ type: "error", message: error.message || "Erro ao conectar com o backend" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="w-8 h-8" />
          Teste de Autenticação Firebase
        </h1>
        <p className="text-muted-foreground mt-2">
          Teste a integração entre Firebase Authentication e o backend
        </p>
      </div>

      {status && (
        <Alert className={`mb-4 ${
          status.type === "success" ? "border-green-500" : 
          status.type === "error" ? "border-red-500" : 
          "border-blue-500"
        }`}>
          <div className="flex items-center gap-2">
            {status.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : status.type === "error" ? (
              <XCircle className="w-4 h-4 text-red-500" />
            ) : (
              <Loader2 className="w-4 h-4 text-blue-500" />
            )}
            <AlertDescription>{status.message}</AlertDescription>
          </div>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Seção Firebase */}
        <Card>
          <CardHeader>
            <CardTitle>1. Login Firebase</CardTitle>
            <CardDescription>
              Autentique-se com Firebase (Email/Senha ou Google)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    ✅ Logado como: {user.email}
                  </p>
                </div>
                {token && (
                  <div className="space-y-2">
                    <Label>Token Firebase</Label>
                    <Input
                      value={token.substring(0, 50) + "..."}
                      readOnly
                      className="font-mono text-xs"
                    />
                  </div>
                )}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout Firebase
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="email">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="google">Google</TabsTrigger>
                </TabsList>
                <TabsContent value="email" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu-email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleEmailLogin}
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4 mr-2" />
                    )}
                    Login com Email
                  </Button>
                </TabsContent>
                <TabsContent value="google">
                  <Button
                    onClick={handleGoogleLogin}
                    className="w-full"
                    variant="outline"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4 mr-2" />
                    )}
                    Login com Google
                  </Button>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        {/* Seção Backend */}
        <Card>
          <CardHeader>
            <CardTitle>2. Login Backend</CardTitle>
            <CardDescription>
              Autentique-se no backend usando o token Firebase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessionId ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    ✅ Sessão ativa
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Session ID</Label>
                  <Input
                    value={sessionId.substring(0, 50) + "..."}
                    readOnly
                    className="font-mono text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleValidateSession}
                    variant="outline"
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Validar"
                    )}
                  </Button>
                  <Button
                    onClick={handleBackendLogout}
                    variant="destructive"
                    className="flex-1"
                    disabled={loading}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Faça login no Firebase primeiro para obter um token.
                </p>
                <Button
                  onClick={handleBackendLogin}
                  className="w-full"
                  disabled={loading || !token}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4 mr-2" />
                  )}
                  Login no Backend
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações do Usuário */}
      {user && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informações do Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-mono">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">UID:</span>
                <span className="font-mono text-xs">{user.uid}</span>
              </div>
              {user.displayName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nome:</span>
                  <span>{user.displayName}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

