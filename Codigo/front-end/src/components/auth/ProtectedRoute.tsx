"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

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
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (loading) return;
    const isPublicRoute = pathname === "/" || publicRoutes.includes(pathname);
    if (!isAuthenticated && !isPublicRoute) {
      router.push("/?login=true");
    }
  }, [isAuthenticated, loading, pathname, router, publicRoutes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen background-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isPublicRoute = pathname === "/" || publicRoutes.includes(pathname);
  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}
