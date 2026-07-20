"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { getStoredAdminAuth, clearStoredAdminAuth } from "@/lib/admin/auth";
import { adminApi } from "@/lib/admin/api";
import { clearStoredAuth } from "@/lib/api";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Admin session must not reuse the member wallet JWT.
    clearStoredAuth();

    const auth = getStoredAdminAuth();
    if (!auth && pathname !== "/admin/login") {
      router.push("/admin/login");
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  if (isAuthenticated === null && pathname !== "/admin/login") {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>;
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <header className="h-20 border-b border-[#222] bg-[#111] flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link href="/admin" className="flex items-center gap-3">
            <img src="/assets/images/logoMark.png" alt="HNTR" className="w-8 h-8" />
            <span className="font-bold text-xl tracking-tight">HNTR ADMIN</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/admin"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${pathname === "/admin" ? "bg-[#f50] text-white" : "text-gray-400 hover:text-white hover:bg-[#222]"}`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/pool-control"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${pathname === "/admin/pool-control" ? "bg-[#f50] text-white" : "text-gray-400 hover:text-white hover:bg-[#222]"}`}
            >
              Pool Control
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Admin Session</span>
            <span className="text-[10px] text-green-500 font-medium">Active & Secure</span>
          </div>
          <button
            onClick={() => {
              adminApi.logout();
              clearStoredAdminAuth();
              clearStoredAuth();
              router.push("/admin/login");
            }}
            className="px-4 py-2 bg-[#1a1a1a] hover:bg-red-500/10 hover:text-red-500 border border-[#222] rounded-lg text-xs font-bold transition-all"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  );
}
