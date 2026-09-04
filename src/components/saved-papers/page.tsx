"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { PaperCard } from "@/components/papers/paper-card";
import type { ArxivPaper } from "@/lib/arxiv/types";
import type { SavedPaper } from "@/lib/papers/types";
import styles from "../article-search/article-search.module.css";

const PAGE_SIZE = 20;

type SavedPapersResponse = {
  totalResults: number;
  entries: SavedPaper[];
};

type SavedState = "loading" | "success" | "empty" | "error";

async function fetchSavedPapers(nextPage: number): Promise<SavedPapersResponse> {
  const response = await fetch(`/api/papers?page=${nextPage}`);
  const data = (await response.json()) as SavedPapersResponse & { error?: string };
  if (!response.ok) throw new Error(data.error ?? "保存論文の取得に失敗しました");
  return data;
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m1.35-5.4a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0Z" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg aria-hidden="true" className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 4.5A2.25 2.25 0 0 1 9 2.25h6a2.25 2.25 0 0 1 2.25 2.25v17.25L12 18.375l-5.25 3.375V4.5Z" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span aria-hidden="true" className={`${styles.menuIcon} ${open ? styles.menuIconOpen : ""}`}>
      <span />
      <span />
    </span>
  );
}

export default function SavedPapersPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<SavedPapersResponse | null>(null);
  const [state, setState] = useState<SavedState>("loading");
  const [savingArxivIds, setSavingArxivIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; paper?: ArxivPaper } | null>(null);

  const loadSavedPapers = useCallback(async (nextPage = 1) => {
    setPage(nextPage);
    setState("loading");

    try {
      const data = await fetchSavedPapers(nextPage);
      setResult(data);
      setState(data.entries.length === 0 ? "empty" : "success");
      return data;
    } catch {
      setResult(null);
      setState("error");
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchSavedPapers(1)
      .then((data) => {
        if (cancelled) return;
        setResult(data);
        setState(data.entries.length === 0 ? "empty" : "success");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleSave(paper: ArxivPaper) {
    setSavingArxivIds((current) => new Set(current).add(paper.arxivId));

    try {
      const response = await fetch(`/api/papers/${encodeURIComponent(paper.arxivId)}`, { method: "DELETE" });
      if (!response.ok) throw new Error("保存解除に失敗しました");

      setToast({ message: "論文の保存を解除しました" });
      const nextResult = await loadSavedPapers(page);
      if (nextResult?.entries.length === 0 && page > 1) await loadSavedPapers(page - 1);
    } catch {
      setToast({ message: "保存解除に失敗しました", paper });
    } finally {
      setSavingArxivIds((current) => {
        const next = new Set(current);
        next.delete(paper.arxivId);
        return next;
      });
    }
  }

  const totalPages = result ? Math.ceil(result.totalResults / PAGE_SIZE) : 0;

  return (
    <div className={styles.page}>
      <button
        aria-label={mobileOpen ? "メニューを閉じる" : "メニューを開く"}
        className={styles.mobileMenuButton}
        onClick={() => setMobileOpen((current) => !current)}
        type="button"
      >
        <MenuIcon open={mobileOpen} />
      </button>

      {mobileOpen && <button aria-label="メニューを閉じる" className={styles.mobileScrim} onClick={() => setMobileOpen(false)} type="button" />}

      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`} aria-label="メインナビゲーション">
        <div>
          <Link className={styles.brand} href="/" onClick={() => setMobileOpen(false)}>
            <span className={styles.brandMark}>◈</span>
            <span><span className={styles.brandName}>論文の灯台</span><span className={styles.brandCaption}>LIGHTHOUSE OF ARTICLE</span></span>
          </Link>
          <div className={styles.sidebarRule} />
          <nav className={styles.nav}>
            <Link className={styles.navLink} href="/" onClick={() => setMobileOpen(false)}><SearchIcon /><span>論文を検索</span></Link>
            <Link className={`${styles.navLink} ${styles.navLinkActive}`} href="/saved" onClick={() => setMobileOpen(false)}><BookmarkIcon /><span>保存した論文</span><span className={styles.navDot} /></Link>
          </nav>
        </div>
        <div className={styles.sidebarFooter}><span className={styles.footerSignal}><span /> KEEP THE LIGHT ON</span><p>気になった論文を見つけて、あとから読み返せる場所。</p><span className={styles.footerVersion}>MVP / PERSONAL RESEARCH DESK</span></div>
      </aside>

      <main className={styles.main}>
        <div className={styles.topline}><span>PERSONAL RESEARCH DESK</span><span className={styles.toplineStatus}><span /> SAVED PAPERS</span></div>
        <div className={styles.savedPageContent}>
          <header className={styles.savedPageHeader}>
            <div><p className={styles.eyebrow}><span /> YOUR RESEARCH ARCHIVE</p><h1>保存した論文。</h1></div>
            <p>あとで読み返したい論文を、ここに集めています。保存日時の新しい順に表示します。</p>
          </header>

          <section className={styles.resultsSection} aria-live="polite">
            <div className={styles.emptyStateHeader}><span className={styles.emptyIcon}>⌕</span><span>{state === "success" || state === "empty" ? `SAVED PAPERS / ${result?.totalResults ?? 0}` : "SAVED PAPERS"}</span></div>
            {state === "loading" && <div className={styles.emptyStateBody}><p className={styles.emptyTitle}>保存した論文を読み込んでいます…</p><p className={styles.emptyDescription}>研究アーカイブを確認しています。</p></div>}
            {state === "error" && <div className={styles.emptyStateBody}><p className={styles.emptyTitle}>読み込みに失敗しました</p><p className={styles.emptyDescription}>時間をおいて、もう一度お試しください。</p><button className={styles.retryButton} onClick={() => void loadSavedPapers(page)} type="button">再試行 ↻</button></div>}
            {state === "empty" && <div className={styles.emptyStateBody}><p className={styles.emptyTitle}>保存した論文はありません</p><p className={styles.emptyDescription}><Link href="/" className={styles.savedPageLink}>論文を検索して保存する →</Link></p></div>}
            {state === "success" && result && <div className={styles.resultsBody}><div className={styles.paperGrid}>{result.entries.map((paper) => <PaperCard key={paper.arxivId} paper={paper} saved saving={savingArxivIds.has(paper.arxivId)} onToggleSave={toggleSave} />)}</div><div className={styles.pagination}><button disabled={page === 1} onClick={() => void loadSavedPapers(page - 1)} type="button">← 前へ</button><span>{page} / {totalPages}</span><button disabled={page >= totalPages} onClick={() => void loadSavedPapers(page + 1)} type="button">次へ →</button></div></div>}
            {state !== "success" && <div className={styles.emptyStateFooter}><span>02 / ARCHIVE</span><span className={styles.emptyStateArrow}>↓</span><span>KEEP THE LIGHT ON</span></div>}
          </section>
        </div>
        {toast && <div className={styles.toast} role="status"><span>{toast.message}</span>{toast.paper && <button onClick={() => void toggleSave(toast.paper!)} type="button">再試行</button>}</div>}
      </main>
    </div>
  );
}
