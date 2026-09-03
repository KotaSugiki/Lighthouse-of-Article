"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { FormEvent } from "react";

import type { ArxivPaper, ArxivSearchResponse } from "@/lib/arxiv/types";
import styles from "./article-search.module.css";

const PAGE_SIZE = 20;

type SearchState = "idle" | "loading" | "success" | "empty" | "error";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "公開日不明" : new Intl.DateTimeFormat("ja-JP").format(date);
}

function PaperCard({ paper }: { paper: ArxivPaper }) {
  return (
    <article className={styles.paperCard}>
      <div className={styles.paperCardMeta}>
        <span>{paper.categories[0] ?? "arXiv"}</span>
        <span>{formatDate(paper.publishedAt)}</span>
      </div>
      <h2 className={styles.paperTitle}>{paper.title}</h2>
      <p className={styles.paperAuthors}>{paper.authors.slice(0, 3).join(", ") || "著者情報なし"}</p>
      <p className={styles.paperAbstract}>{paper.abstract}</p>
      <div className={styles.paperCardFooter}>
        <span>arXiv:{paper.arxivId}</span>
        <a href={paper.arxivUrl} rel="noreferrer" target="_blank">arXivで読む ↗</a>
      </div>
    </article>
  );
}

function BeaconMark() {
  return (
    <svg aria-hidden="true" className={styles.beaconMark} fill="none" viewBox="0 0 48 48">
      <path d="m6 19 12-4v5L6 24v-5Zm36 0-12-4v5l12 4v-5Z" fill="currentColor" opacity=".48" />
      <path d="M20 14h8l-1.25 6h-5.5L20 14Z" fill="currentColor" />
      <path d="M21 20h6l2.5 20h-11L21 20Z" fill="currentColor" />
      <path d="M17 40h14M19 13h10M22 9h4v4h-4V9Z" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
      <path d="M24 5v4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <circle cx="24" cy="17" r="1.5" fill="#E0F4FF" />
    </svg>
  );
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

export default function DraftPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<ArxivSearchResponse | null>(null);
  const [state, setState] = useState<SearchState>("idle");

  async function runSearch(nextPage = 0) {
    const normalizedKeyword = keyword.trim();
    if (!normalizedKeyword) {
      setPage(0);
      setResult(null);
      setState("idle");
      return;
    }

    setPage(nextPage);
    setState("loading");

    try {
      const response = await fetch(`/api/arxiv/search?q=${encodeURIComponent(normalizedKeyword)}&start=${nextPage * PAGE_SIZE}`);
      const data = (await response.json()) as ArxivSearchResponse & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "arXivの検索に失敗しました");
      setResult(data);
      setState(data.entries.length === 0 ? "empty" : "success");
    } catch {
      setResult(null);
      setState("error");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runSearch();
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

      {mobileOpen && (
        <button
          aria-label="メニューを閉じる"
          className={styles.mobileScrim}
          onClick={() => setMobileOpen(false)}
          type="button"
        />
      )}

      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`} aria-label="メインナビゲーション">
        <div>
          <Link className={styles.brand} href="/" onClick={() => setMobileOpen(false)}>
            <span className={styles.brandMark}><BeaconMark /></span>
            <span>
              <span className={styles.brandName}>論文の灯台</span>
              <span className={styles.brandCaption}>LIGHTHOUSE OF ARTICLE</span>
            </span>
          </Link>

          <div className={styles.sidebarRule} />

          <nav className={styles.nav}>
            <Link className={`${styles.navLink} ${styles.navLinkActive}`} href="/" onClick={() => setMobileOpen(false)}>
              <SearchIcon />
              <span>論文を検索</span>
              <span className={styles.navDot} />
            </Link>
            <Link className={styles.navLink} href="/saved" onClick={() => setMobileOpen(false)}>
              <BookmarkIcon />
              <span>保存した論文</span>
            </Link>
          </nav>
        </div>

        <div className={styles.sidebarFooter}>
          <span className={styles.footerSignal}><span /> KEEP THE LIGHT ON</span>
          <p>気になった論文を見つけて、あとから読み返せる場所。</p>
          <span className={styles.footerVersion}>MVP / PERSONAL RESEARCH DESK</span>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.topline}>
          <span>PERSONAL RESEARCH DESK</span>
          <span className={styles.toplineStatus}><span /> arXiv SEARCH</span>
        </div>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}><span /> SEARCH THE HORIZON</p>
            <h1 className={styles.heroTitle}>論文の海から、<br /><em>次の一篇</em>へ。</h1>
            <p className={styles.lead}>arXivの論文をキーワードで検索して、気になった論文を保存。読むべき一篇への航路を、ここから。</p>

            <form className={styles.searchForm} onSubmit={handleSubmit}>
              <label className={styles.searchLabel} htmlFor="draft-paper-search">論文を検索</label>
              <div className={styles.searchField}>
                <SearchIcon />
                <input id="draft-paper-search" name="q" onChange={(event) => setKeyword(event.target.value)} placeholder="例）large language model" type="search" value={keyword} />
                <button disabled={state === "loading"} type="submit">{state === "loading" ? "検索中…" : "検索する"} <span aria-hidden="true">↗</span></button>
              </div>
            </form>
          </div>

          <div className={styles.beaconPanel} aria-label="Lighthouse of Article の概要">
            <Image
              alt="灯台の光が論文カードと研究ノードを照らす研究航海図"
              className={styles.beaconImage}
              fill
              priority
              sizes="(max-width: 700px) calc(100vw - 40px), 36vw"
              src="/research-navigation-chart.png"
            />
            <div className={styles.beaconPanelTop}>
              <span>LIGHTHOUSE / 01</span>
              <span className={styles.live}><span /> LIVE</span>
            </div>
            <div className={styles.beaconNote}>
              <span className={styles.noteLine} />
              <p>FIND YOUR<br /><strong>NEXT PAPER</strong></p>
            </div>
            <div className={styles.beaconMeta}>
              <span>INDEX / arXiv</span>
              <span>EST. 2026</span>
            </div>
          </div>
        </section>

        <section className={styles.resultsSection} aria-live="polite">
          <div className={styles.emptyStateHeader}>
            <span className={styles.emptyIcon}>⌕</span>
            <span>{state === "success" || state === "empty" ? `SEARCH RESULT / ${result?.totalResults ?? 0}` : "SEARCH RESULT"}</span>
          </div>
          {state === "idle" && <div className={styles.emptyStateBody}><p className={styles.emptyTitle}>検索結果はここに表示されます</p><p className={styles.emptyDescription}>キーワードを入力して、論文を探しはじめましょう。</p></div>}
          {state === "loading" && <div className={styles.emptyStateBody}><p className={styles.emptyTitle}>論文を探しています…</p><p className={styles.emptyDescription}>arXivから最新の検索結果を読み込んでいます。</p></div>}
          {state === "error" && <div className={styles.emptyStateBody}><p className={styles.emptyTitle}>検索に失敗しました</p><p className={styles.emptyDescription}>通信状態を確認して、もう一度お試しください。</p><button className={styles.retryButton} onClick={() => void runSearch(page)} type="button">再試行 ↻</button></div>}
          {state === "empty" && <div className={styles.emptyStateBody}><p className={styles.emptyTitle}>該当する論文が見つかりませんでした</p><p className={styles.emptyDescription}>「{keyword.trim()}」を別のキーワードで検索してみてください。</p></div>}
          {state === "success" && result && <div className={styles.resultsBody}><div className={styles.paperGrid}>{result.entries.map((paper) => <PaperCard key={paper.arxivId} paper={paper} />)}</div><div className={styles.pagination}><button disabled={page === 0} onClick={() => void runSearch(page - 1)} type="button">← 前へ</button><span>{page + 1} / {totalPages}</span><button disabled={page + 1 >= totalPages} onClick={() => void runSearch(page + 1)} type="button">次へ →</button></div></div>}
          {state !== "success" && <div className={styles.emptyStateFooter}><span>01 / QUERY</span><span className={styles.emptyStateArrow}>↓</span><span>YOUR RESEARCH STARTS HERE</span></div>}
        </section>

        <footer className={styles.mainFooter}>
          <span>ARXIV PAPER EXPLORER</span>
          <span>SEARCH · SAVE · RETURN</span>
        </footer>
      </main>
    </div>
  );
}
