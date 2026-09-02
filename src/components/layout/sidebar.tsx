import Link from "next/link";

import { LighthouseMark } from "@/components/brand/lighthouse-mark";

type SidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m1.35-5.4a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0Z" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 4.5A2.25 2.25 0 0 1 9 2.25h6a2.25 2.25 0 0 1 2.25 2.25v17.25L12 18.375l-5.25 3.375V4.5Z" />
    </svg>
  );
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <button
          aria-label="メニューを閉じる"
          className="fixed inset-0 z-30 bg-slate-950/35 md:hidden"
          onClick={onClose}
          type="button"
        />
      )}
      <aside
        aria-label="メインナビゲーション"
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-[#171717] px-5 py-6 text-white transition-transform md:static md:z-auto md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-2">
          <Link className="flex items-center gap-3 text-lg font-semibold tracking-tight text-white" href="/" onClick={onClose}>
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#f4c542] text-[#171717]">
              <LighthouseMark className="size-8" />
            </span>
            <span className="flex flex-col">
              <span className="text-base leading-tight">論文の灯台</span>
              <span className="mt-1 text-[10px] font-medium tracking-[0.08em] text-white/45">Lighthouse of Article</span>
            </span>
          </Link>
          <button
            aria-label="メニューを閉じる"
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 md:hidden"
            onClick={onClose}
            type="button"
          >
            <span aria-hidden="true" className="text-xl leading-none">×</span>
          </button>
        </div>

        <nav className="mt-10 space-y-2">
          <Link
            className="flex items-center gap-3 rounded-xl bg-[#f4c542] px-4 py-3 text-sm font-semibold text-[#171717] shadow-[0_8px_24px_rgba(244,197,66,0.16)]"
            href="/"
            onClick={onClose}
          >
            <SearchIcon />
            論文を検索
          </Link>
          <Link
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            href="/saved"
            onClick={onClose}
          >
            <BookmarkIcon />
            保存した論文
          </Link>
        </nav>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-white/50">
          <span className="mb-2 block text-[#f4c542]">KEEP THE LIGHT ON</span>
          論文を見つけて、あとから読み返せる場所。
        </div>
      </aside>
    </>
  );
}
