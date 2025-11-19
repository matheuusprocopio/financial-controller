"use client";

import { useState, useEffect, useCallback } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  signOut,
  UserCredential,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: any;
  sessionId?: string;
}

interface UseAuthReturn {
  user: FirebaseUser | null;
  token: string | null;
  sessionId: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isBackendAuthenticated: boolean;

  loginWithEmail: (email: string, password: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<string>;
  signupWithEmail: (
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<UserCredential>;
  logout: () => Promise<void>;
  loginBackend: (idToken: string) => Promise<AuthResponse>;
  validateSession: () => Promise<AuthResponse>;
  logoutBackend: () => Promise<AuthResponse>;

  refreshToken: () => Promise<string | null>;
  getIdToken: () => Promise<string | null>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
 // se mudar ele vai la e faz
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();
          setToken(idToken);
        } catch (error) {
          console.error("Erro ao obter token:", error);
          setToken(null);
        }
      } else {
        setToken(null);
        setSessionId(null);
      }
      
      setInitialLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const storedSessionId = localStorage.getItem("sessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
  }, []);

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem("sessionId", sessionId);
    } else {
      localStorage.removeItem("sessionId");
    }
  }, [sessionId]);

  const loginWithEmail = useCallback(
    async (email: string, password: string): Promise<UserCredential> => {
      if (!email || !password) {
        throw new Error("Por favor, preencha email e senha");
      }

      setLoading(true);
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const idToken = await userCredential.user.getIdToken();
        setToken(idToken);
        return userCredential;
      } catch (error: any) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );


  const loginWithGoogle = useCallback(async (): Promise<string> => {
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const idToken = await userCredential.user.getIdToken();
      setToken(idToken);
      return idToken;
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);


  const signupWithEmail = useCallback(
    async (
      email: string,
      password: string,
      confirmPassword: string
    ): Promise<UserCredential> => {
      if (!email || !password || !confirmPassword) {
        throw new Error("Por favor, preencha todos os campos");
      }

      if (password !== confirmPassword) {
        throw new Error("As senhas não coincidem");
      }

      if (password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres");
      }

      setLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const idToken = await userCredential.user.getIdToken();
        setToken(idToken);
        return userCredential;
      } catch (error: any) {
        if (error.code === "auth/email-already-in-use") {
          throw new Error("Este email já está cadastrado");
        } else if (error.code === "auth/invalid-email") {
          throw new Error("Email inválido");
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      // Faz logout do backend primeiro se houver sessão
      if (sessionId) {
        try {
          await fetch(`${API_BASE}/auth/logout`, {
            method: "POST",
            headers: { "X-Session-Id": sessionId },
          });
        } catch (error) {
          console.error("Erro ao fazer logout do backend:", error);
        }
        setSessionId(null);
      }

      await signOut(auth);
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);


  const loginBackend = useCallback(async (idTokenp?: string): Promise<AuthResponse> => {
    if (!idTokenp) {
      throw new Error("Por favor, faça login no Firebase primeiro");
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: idTokenp }),
      });

      const data: AuthResponse = await response.json();

      if (response.ok && data.success && data.sessionId) {
        setSessionId(data.sessionId);
        return data;
      } else {
        throw new Error(data.message || "Erro ao fazer login no backend");
      }
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [token]);


  const validateSession = useCallback(async (): Promise<AuthResponse> => {
    if (!sessionId) {
      throw new Error("Nenhuma sessão ativa");
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/validate`, {
        method: "GET",
        headers: { "X-Session-Id": sessionId },
      });

      const data: AuthResponse = await response.json();

      if (response.ok && data.success) {
        return data;
      } else {
        setSessionId(null);
        throw new Error(data.message || "Sessão inválida ou expirada");
      }
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);


  const logoutBackend = useCallback(async (): Promise<AuthResponse> => {
    if (!sessionId) {
      throw new Error("Nenhuma sessão para encerrar");
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { "X-Session-Id": sessionId },
      });

      const data: AuthResponse = await response.json();

      if (response.ok) {
        setSessionId(null);
        return data;
      } else {
        throw new Error(data.message || "Erro ao fazer logout");
      }
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    if (!user) {
      return null;
    }

    try {
      const idToken = await user.getIdToken(true);
      setToken(idToken);
      return idToken;
    } catch (error) {
      console.error("Erro ao atualizar token:", error);
      return null;
    }
  }, [user]);


  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!user) {
      return null;
    }

    try {
      const idToken = await user.getIdToken();
      setToken(idToken);
      return idToken;
    } catch (error) {
      console.error("Erro ao obter token:", error);
      return null;
    }
  }, [user]);

  return {

    user,
    token,
    sessionId,
    loading: loading || initialLoading,
    isAuthenticated: !!user,
    isBackendAuthenticated: !!sessionId,


    loginWithEmail,
    loginWithGoogle,
    signupWithEmail,
    logout,
    loginBackend,
    validateSession,
    logoutBackend,
    refreshToken,
    getIdToken,
  };
}

