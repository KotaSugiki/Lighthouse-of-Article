"use client";

import Link from "next/link";
import { useState } from "react";

import styles from "../article-search/article-search.module.css";

type DetailShellProps = { children: React.ReactNode };

function SearchIcon() {
  return <svg aria-hidden="true" className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m1.35-5.4a6.75 6.75 0 1 1 13.5 0Z" /></svg>;
}

function BookmarkIcon() {
  return <svg aria-hidden="true" className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 4.5A2.25 2.25 0 0 1 9 2.25h6a2.25 2.25 0 0 1 2.25 2.25v17.25L12 18.375l-5.25 3.375V4.5Z" /></svg>;
}

function BeaconMark() {
  return <svg aria-hidden="true" className={styles.beaconMark} fill="none" viewBox="0 0 48 48"><path d="m6 19 12-4v5L6 24v-5Zm36 0-12-4v5l12 4v-5Z" fill="currentColor" opacity=".48" /><path d="M20 14h8l-1.25 6h-5.5L20 14Z" fill="currentColor" /><path d="M21 20h6l2.5 20h-11L21 20Z" fill="currentColor" /><path d="M17 40h14M19 13h10M22 9h4v4h-4V9Z" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" /><path d="M24 5v4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /><circle cx="24" cy="17" r="1.5" fill="#E0F4FF" /></svg>;
}

function MenuIcon({ open }: { open: boolean }) {
  return <span aria-hidden="true" className={`${styles.menuIcon} ${open ? styles.menuIconOpen : ""}`}><span /><span /></span>;
}

export function DetailShell({ children }: DetailShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return <div className={styles.page}>
    <button aria-label={mobileOpen ? "メニューを閉じる" : "メニューを開く"} className={styles.mobileMenuButton} onClick={() => setMobileOpen((current) => !current)} type="button"><MenuIcon open={mobileOpen} /></button>
    {mobileOpen && <button aria-label="メニューを閉じる" className={styles.mobileScrim} onClick={() => setMobileOpen(false)} type="button" />}
    <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`} aria-label="メインナビゲーション">
      <div>
        <Link className={styles.brand} href="/" onClick={() => setMobileOpen(false)}><span className={styles.brandMark}><BeaconMark /></span><span><span className={styles.brandName}>論文の灯台</span><span className={styles.brandCaption}>LIGHTHOUSE OF ARTICLE</span></span></Link>
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
      <div className={styles.detailContent}>{children}</div>
    </main>
  </div>;
}
