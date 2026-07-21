"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { getStoredAdminAuth, clearStoredAdminAuth } from "@/lib/admin/auth";
import { adminApi } from "@/lib/admin/api";
import { clearStoredAuth } from "@/lib/api";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    href: "/admin/pool-control",
    label: "Pool Control",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
  },
] as const;

function isNavActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    clearStoredAuth();

    const auth = getStoredAdminAuth();
    if (!auth && pathname !== "/admin/login") {
      router.push("/admin/login");
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    adminApi.logout();
    clearStoredAdminAuth();
    clearStoredAuth();
    router.push("/admin/login");
  };

  if (isAuthenticated === null && pathname !== "/admin/login") {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>;
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const currentPage = NAV_ITEMS.find((item) => isNavActive(pathname, item.href))?.label ?? "Admin";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <header className="sticky top-0 z-50 border-b border-[#222] bg-[#111]/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(255,255,255,0.03)]">
        <div className="h-16 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 lg:gap-8 min-w-0">
            <Link href="/admin" className="flex items-center gap-3 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-[#1a1a1a] border border-[#222] flex items-center justify-center group-hover:border-[#333] transition-colors">
                <img src="/assets/images/logoMark.png" alt="HNTR" className="w-5 h-5" />
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="font-bold text-sm tracking-tight text-white">HNTR</div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">Admin Console</div>
              </div>
            </Link>

            <div className="hidden md:block w-px h-7 bg-[#222]" />

            <nav className="hidden md:flex items-stretch h-16 -mb-px">
              {NAV_ITEMS.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                      active
                        ? "border-[#f50] text-white"
                        : "border-transparent text-gray-400 hover:text-white hover:border-[#333]"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1a1a] border border-[#222]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <span className="text-xs font-medium text-gray-400">Secure session</span>
            </div>

            <div className="hidden sm:flex items-center gap-3 pl-1">
              <div className="w-8 h-8 rounded-full bg-[#f50]/10 border border-[#f50]/20 flex items-center justify-center">
                <span className="text-xs font-bold text-[#f50]">A</span>
              </div>
              <div className="hidden md:block leading-tight">
                <div className="text-xs font-semibold text-white">Administrator</div>
                <div className="text-[10px] text-gray-500">{currentPage}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-gray-300 bg-[#1a1a1a] border border-[#222] hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Logout
            </button>

            <button
              type="button"
              onClick={() => setMobileNavOpen((open) => !open)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[#222] text-gray-300 hover:text-white hover:border-[#333] transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileNavOpen ? (
          <div className="md:hidden border-t border-[#222] bg-[#111]">
            <nav className="max-w-[1600px] mx-auto px-4 py-3 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active ? "bg-[#f50]/10 text-[#f50]" : "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
              <div className="mt-2 pt-3 border-t border-[#222] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-gray-400">Secure session</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20"
                >
                  Logout
                </button>
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <main className="flex-1 overflow-auto p-6 sm:p-8 max-w-[1600px] mx-auto w-full">{children}</main>
    </div>
  );
}
