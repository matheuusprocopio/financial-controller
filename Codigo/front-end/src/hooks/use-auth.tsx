"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  signOut,
  UserCredential,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import type { UserType } from "@/types/user.type";
import { deleteCookie, getCookie, setCookie } from "@/utils/cookies";
import { getUserById } from "@/utils/services/users";
import type { RequestError } from "@/utils/requestProvider";

const isRequestError = (response: unknown): response is RequestError => {
  return !!response && typeof response === "object" && "error" in (response as Record<string, unknown>);
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const SESSION_COOKIE = "financialcontroller_session_id";

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: any;
  sessionId?: string;
}

interface ValidateSessionOptions {
  skipStateUpdate?: boolean;
}

export interface UseAuthReturn {
  user: FirebaseUser | null;
  token: string | null;
  sessionId: string | null;
  backendUser: UserType | null;
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
  validateSession: (
    overrideSessionId?: string,
    options?: ValidateSessionOptions
  ) => Promise<AuthResponse>;
  logoutBackend: () => Promise<AuthResponse>;
  clearSession: () => void;
  loadBackendUser: () => Promise<UserType | null>;

  refreshToken: () => Promise<string | null>;
  getIdToken: () => Promise<string | null>;
}

function useProvideAuth(): UseAuthReturn {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [backendUser, setBackendUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [loadingBackendUser, setLoadingBackendUser] = useState<boolean>(false);

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

  const validateSession = useCallback(
    async (
      overrideSessionId?: string,
      options?: ValidateSessionOptions
    ): Promise<AuthResponse> => {
      const activeSessionId = overrideSessionId ?? sessionId;
      if (!activeSessionId) {
        throw new Error("Nenhuma sessão ativa");
      }

      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/auth/validate`, {
          method: "GET",
          headers: { "X-Session-Id": activeSessionId },
        });

        const data: AuthResponse = await response.json();

        if (response.ok && data.success) {
          setSessionId(activeSessionId);
          await setCookie(SESSION_COOKIE, activeSessionId);
          if (data.user && !options?.skipStateUpdate) {
            setBackendUser(data.user);
          }
          return data;
        } else {
          setSessionId(null);
          setBackendUser(null);
          throw new Error(data.message || "Sessão inválida ou expirada");
        }
      } catch (error: any) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [sessionId]
  );

  const loadBackendUser = useCallback(async (): Promise<UserType | null> => {
    const storedSession = sessionId ?? (await getCookie(SESSION_COOKIE));
    if (!storedSession) {
      setBackendUser(null);
      setSessionId(null);
      return null;
    }

    setLoadingBackendUser(true);
    try {
      const data = await validateSession(storedSession, {
        skipStateUpdate: true,
      });
      let resolvedUser = data.user ?? null;

      const shouldFetchFreshUser = resolvedUser?.id && storedSession;

      if (shouldFetchFreshUser) {
        try {
          const resp = await getUserById(resolvedUser!.id, storedSession);

          if (resp && !isRequestError(resp)) {
            resolvedUser = resp;
          }
        } catch (error) {
          console.error("Erro ao buscar dados atualizados do usuário:", error);
        }
      }

      setBackendUser(resolvedUser);

      return resolvedUser;
    } catch (error) {
      console.error("Erro ao carregar usuário do backend:", error);
      await deleteCookie(SESSION_COOKIE);
      setSessionId(null);
      setBackendUser(null);
      return null;
    } finally {
      setLoadingBackendUser(false);
    }
  }, [sessionId, validateSession]);

  useEffect(() => {
    loadBackendUser();
  }, [loadBackendUser]);

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem("sessionId", sessionId);
      return;
    }

    // Preserve the backend cookie; it is cleared explicitly during logout flows
    localStorage.removeItem("sessionId");
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
      if (sessionId) {
        try {
          await fetch(`${API_BASE}/auth/logout`, {
            method: "POST",
            headers: { "X-Session-Id": sessionId },
          });
        } catch (error) {
          console.error("Erro ao fazer logout do backend:", error);
        }
      }

      await deleteCookie(SESSION_COOKIE);
      setSessionId(null);
      setBackendUser(null);
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
        await setCookie(SESSION_COOKIE, data.sessionId);
        if (data.user) {
          setBackendUser(data.user);
        }
        return data;
      } else {
        throw new Error(data.message || "Erro ao fazer login no backend");
      }
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (!sessionId || backendUser) {
      return;
    }

    const ensureValidSession = async () => {
      try {
        await validateSession();
      } catch (error) {
        console.warn("Sessão do backend inválida ou expirada:", error);
      }
    };

    ensureValidSession();
  }, [sessionId, backendUser, validateSession]);


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
        await deleteCookie(SESSION_COOKIE);
        setBackendUser(null);
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

  // Descarta a sessão local quando o servidor já a recusou (o cookie é removido pelo middleware)
  const clearSession = useCallback(() => {
    setSessionId(null);
    setBackendUser(null);
  }, []);

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
    backendUser,
    loading: loading || initialLoading || loadingBackendUser,
    isAuthenticated: !!user,
    isBackendAuthenticated: !!sessionId,
    loginWithEmail,
    loginWithGoogle,
    signupWithEmail,
    logout,
    loginBackend,
    validateSession,
    logoutBackend,
    clearSession,
    loadBackendUser,
    refreshToken,
    getIdToken,
  };
}

const AuthContext = createContext<UseAuthReturn | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useProvideAuth();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider");
  }
  return context;
}
