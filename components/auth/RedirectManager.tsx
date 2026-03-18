"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";

export default function RedirectManager({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
    const isPublicPage = pathname === '/' || isAuthPage;

    if (user && isAuthPage) {
      console.log("🚀 [RedirectManager] User detected on auth page, redirecting to /dashboard");
      router.push("/dashboard");
      // Fallback for hard navigation if router.push is ignored
      setTimeout(() => {
        if (window.location.pathname !== '/dashboard') {
          window.location.href = '/dashboard';
        }
      }, 500);
    } else if (!user && !isPublicPage) {
      console.log("🚀 [RedirectManager] Unauthenticated user on private page, redirecting to /login");
      router.push("/login");
    }
  }, [user, isLoading, pathname, router]);

  return <>{children}</>;
}
