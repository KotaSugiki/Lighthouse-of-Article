"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import styles from "./article-search.module.css";

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

            <form action="/" className={styles.searchForm} method="get">
              <label className={styles.searchLabel} htmlFor="draft-paper-search">論文を検索</label>
              <div className={styles.searchField}>
                <SearchIcon />
                <input id="draft-paper-search" name="q" placeholder="例）large language model" type="search" />
                <button type="submit">検索する <span aria-hidden="true">↗</span></button>
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

        <section className={styles.emptyState} aria-live="polite">
          <div className={styles.emptyStateHeader}>
            <span className={styles.emptyIcon}>⌕</span>
            <span>SEARCH RESULT</span>
          </div>
          <div className={styles.emptyStateBody}>
            <p className={styles.emptyTitle}>検索結果はここに表示されます</p>
            <p className={styles.emptyDescription}>キーワードを入力して、論文を探しはじめましょう。</p>
          </div>
          <div className={styles.emptyStateFooter}>
            <span>01 / QUERY</span>
            <span className={styles.emptyStateArrow}>↓</span>
            <span>YOUR RESEARCH STARTS HERE</span>
          </div>
        </section>

        <footer className={styles.mainFooter}>
          <span>ARXIV PAPER EXPLORER</span>
          <span>SEARCH · SAVE · RETURN</span>
        </footer>
      </main>
    </div>
  );
}
