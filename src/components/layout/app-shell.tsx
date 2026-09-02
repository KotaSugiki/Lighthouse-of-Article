"use client";

import { useState } from "react";

import { Sidebar } from "@/components/layout/sidebar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#fffaf0] text-[#171717]">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center bg-[#171717] px-5 text-white md:hidden">
          <button
            aria-label="メニューを開く"
            className="rounded-lg p-2 text-[#f4c542] hover:bg-white/10"
            onClick={() => setMobileOpen(true)}
            type="button"
          >
            <span aria-hidden="true" className="text-xl leading-none">☰</span>
          </button>
          <span className="ml-3 text-sm font-semibold tracking-tight">Lighthouse<span className="text-[#f4c542]">.</span></span>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
