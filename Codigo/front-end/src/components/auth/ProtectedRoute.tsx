"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface ProtectedRouteProps {
  children: ReactNode;
    publicRoutes?: string[];
}

export default function ProtectedRoute({ 
  children, 
  publicRoutes = [] 
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

   
    const isPublicRoute = pathname === "/" || publicRoutes.includes(pathname);
    if (!user && !isPublicRoute) {
      router.push("/?login=true");
    }
  }, [user, loading, pathname, router, publicRoutes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen background-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isPublicRoute = pathname === "/" || publicRoutes.includes(pathname);
  if (!user && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}
