"use client";

import { useState } from "react";
import Link from "next/link";
import type { SavedPaper } from "../../lib/papers/types";
import type { PaperSummary } from "../../lib/summaries/types";
import { canonicalArxivUrl } from "../../lib/arxiv/id";
import { LighthouseMark } from "../../components/brand/lighthouse-mark";
import styles from "./paper-detail.module.css";

function PaperDate({ value, withTime = false }: { value: string; withTime?: boolean }) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return <>日時不明</>;
  return <time dateTime={value}>{new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "long", ...(withTime ? { timeStyle: "short" as const } : {}), timeZone: "Asia/Tokyo",
  }).format(date)}{withTime ? "（日本時間）" : ""}</time>;
}

function ShipMark() {
  return <svg aria-hidden="true" className={styles.shipMark} fill="none" viewBox="0 0 64 48">
    <path d="M10 31h43l-5 7H17l-7-7Z" fill="currentColor" />
    <path d="M24 29V11l13 18M25 14h17" stroke="currentColor" strokeWidth="2.5" />
    <path d="M17 42c5 3 10 3 15 0 5 3 10 3 15 0" stroke="#E0F4FF" strokeLinecap="round" strokeWidth="2" />
  </svg>;
}

export function PaperDetailView({ paper, initialSummary }: { paper: SavedPaper; initialSummary: PaperSummary | null }) {
  const [removed, setRemoved] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState(false);
  const [summary, setSummary] = useState<PaperSummary | null>(initialSummary);
  const [summaryError, setSummaryError] = useState(false);

  async function generateSummary() {
    if (summary?.status === "processing") return;
    setSummaryError(false);
    setSummary((current) => current ? { ...current, status: "processing" } : {
      id: "pending",
      paperId: paper.id,
      status: "processing",
      content: null,
      model: null,
      generatedAt: null,
      updatedAt: new Date().toISOString(),
    });

    try {
      const response = await fetch(`/api/papers/${encodeURIComponent(paper.arxivId)}/summary`, { method: "POST" });
      const data = (await response.json()) as { summary?: PaperSummary; error?: string };
      if (!response.ok || !data.summary) {
        if (response.status === 409 && data.summary) {
          setSummary(data.summary);
          return;
        }
        throw new Error(data.error ?? "summary generation failed");
      }
      setSummary(data.summary);
    } catch {
      setSummaryError(true);
      setSummary((current) => current ? { ...current, status: "failed" } : null);
    }
  }

  async function removePaper() {
    setRemoving(true);
    setError(false);
    try {
      const response = await fetch(`/api/papers/${encodeURIComponent(paper.arxivId)}`, { method: "DELETE" });
      if (!response.ok && response.status !== 404) throw new Error("delete failed");
      setRemoved(true);
    } catch { setError(true); }
    finally { setRemoving(false); }
  }

  if (removed) return <section className={styles.state}>
    <div className={styles.stateIllustration} aria-hidden="true"><LighthouseMark className={styles.stateMark} /><ShipMark /><span className={styles.stateWave} /></div>
    <p className={styles.stateEyebrow}>RESEARCH ARCHIVE / UPDATED</p>
    <h1>保存を解除しました</h1>
    <p className={styles.stateDescription}>論文を保存一覧から外しました。また必要になったら検索できます。</p>
    <Link className={styles.stateBack} href="/saved">← 保存論文一覧へ戻る</Link>
  </section>;

  return (
    <article className={styles.article}>
      <Link className={styles.back} href="/saved">← 保存論文一覧へ戻る</Link>
      <header className={styles.header}>
        <p className={styles.eyebrow}>PAPER DETAIL / arXiv:{paper.arxivId}</p>
        <h1>{paper.title}</h1>
        <p className={styles.authors}>{paper.authors.join(", ") || "著者情報なし"}</p>
        <ul className={styles.categories} aria-label="カテゴリ">{paper.categories.map((category, index) => <li key={`${category}-${index}`}>{category}</li>)}</ul>
        <dl className={styles.dates}>
          <div><dt>公開日</dt><dd><PaperDate value={paper.publishedAt} /></dd></div>
          <div><dt>保存日時</dt><dd><PaperDate value={paper.savedAt} withTime /></dd></div>
        </dl>
        <div className={styles.actions}>
          <span className={styles.badge}>保存済み</span>
          <button className={styles.button} disabled={removing} onClick={() => void removePaper()} type="button">{removing ? "保存解除中…" : "保存を解除"}</button>
          <a href={canonicalArxivUrl(paper.arxivId)} target="_blank" rel="noopener noreferrer">arXivで読む ↗<span className={styles.srOnly}>（新しいタブ）</span></a>
        </div>
        {error && <p role="alert" className={styles.error}>保存解除に失敗しました。もう一度お試しください。 <button className={styles.button} onClick={() => void removePaper()} type="button">保存解除を再試行</button></p>}
      </header>
      <section className={styles.section} aria-labelledby="abstract-heading">
        <h2 id="abstract-heading">Abstract</h2>
        <p className={styles.abstract} data-testid="full-abstract">{paper.abstract}</p>
      </section>
      <section className={styles.section} aria-labelledby="summary-heading">
        <h2 id="summary-heading">日本語要約</h2>
        {summary?.status === "completed" && summary.content ? <div className={styles.summaryContent}>
          <p className={styles.summaryOverview}>{summary.content.overview}</p>
          <h3>主なポイント</h3>
          <ul>{summary.content.keyPoints.map((point, index) => <li key={`${point}-${index}`}>{point}</li>)}</ul>
          <h3>意義</h3>
          <p>{summary.content.significance}</p>
          <h3>限界・注意点</h3>
          <p>{summary.content.limitations}</p>
          {summary.model && <p className={styles.summaryMeta}>モデル: {summary.model}</p>}
        </div> : summary?.status === "processing" ? <p role="status" className={styles.notice}>要約を生成しています…</p> : <>
          {summaryError || summary?.status === "failed" ? <p role="alert" className={styles.error}>要約の生成に失敗しました。もう一度お試しください。</p> : <p>Abstractを日本語で要約し、保存できます。</p>}
          <button className={styles.button} onClick={() => void generateSummary()} type="button">{summary?.status === "failed" ? "要約を再生成" : "要約を生成"}</button>
        </>}
      </section>
    </article>
  );
}
