"use client";

import type { ArxivPaper } from "../../lib/arxiv/types";
import Link from "next/link";
import { canonicalArxivUrl } from "../../lib/arxiv/id";
import styles from "../article-search/article-search.module.css";

type PaperCardProps = {
  paper: ArxivPaper;
  saved: boolean;
  saving?: boolean;
  onToggleSave: (paper: ArxivPaper) => void;
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "公開日不明" : new Intl.DateTimeFormat("ja-JP").format(date);
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg aria-hidden="true" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 4.5A2.25 2.25 0 0 1 9 2.25h6a2.25 2.25 0 0 1 2.25 2.25v17.25L12 18.375l-5.25 3.375V4.5Z" />
    </svg>
  );
}

export function PaperCard({ paper, saved, saving = false, onToggleSave }: PaperCardProps) {
  const saveLabel = saved ? "保存を解除" : "論文を保存";

  return (
    <article className={styles.paperCard}>
      <div className={styles.paperCardMeta}>
        <span>{paper.categories[0] ?? "arXiv"}</span>
        <span>{formatDate(paper.publishedAt)}</span>
      </div>
      <h2 className={styles.paperTitle}>{saved ? <Link href={`/papers/${encodeURIComponent(paper.arxivId)}`}>{paper.title}</Link> : paper.title}</h2>
      <p className={styles.paperAuthors}>{paper.authors.slice(0, 3).join(", ") || "著者情報なし"}</p>
      <p className={styles.paperAbstract}>{paper.abstract}</p>
      {saved ? <Link className={styles.detailLink} href={`/papers/${encodeURIComponent(paper.arxivId)}`}>詳細を見る</Link> : <p className={styles.detailHint}>詳細は保存後に閲覧できます</p>}
      <div className={styles.paperCardFooter}>
        <span>arXiv:{paper.arxivId}</span>
        <div className={styles.paperCardActions}>
          <button
            aria-label={saveLabel}
            aria-pressed={saved}
            className={`${styles.bookmarkButton} ${saved ? styles.bookmarkButtonSaved : ""}`}
            disabled={saving}
            onClick={() => onToggleSave(paper)}
            title={saveLabel}
            type="button"
          >
            <BookmarkIcon filled={saved} />
          </button>
          <a href={canonicalArxivUrl(paper.arxivId)} rel="noopener noreferrer" target="_blank">arXivで読む ↗</a>
        </div>
      </div>
    </article>
  );
}
