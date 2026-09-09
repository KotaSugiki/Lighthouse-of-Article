"use client";

import { useEffect, useState } from "react";
import type { SavedPaper } from "../../lib/papers/types";
import { PaperDetailView } from "./paper-detail-view";

export default function PaperDetail({ arxivId }: { arxivId: string }) {
  const [paper, setPaper] = useState<SavedPaper | null>(null);
  const [state, setState] = useState<"loading" | "success" | "missing" | "error">("loading");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/papers/${encodeURIComponent(arxivId)}`, { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as { paper?: SavedPaper };
        if (cancelled) return;
        if (response.status === 404) { setState("missing"); return; }
        if (!response.ok || !data.paper) { setState("error"); return; }
        setPaper(data.paper);
        setState("success");
      })
      .catch(() => { if (!cancelled) setState("error"); });
    return () => { cancelled = true; };
  }, [arxivId, retry]);

  if (state === "loading") return <p role="status">論文を読み込んでいます…</p>;
  if (state === "missing") return <section><h1>保存論文が見つかりません</h1><a href="/saved">保存した論文へ</a></section>;
  if (state === "error") return <section role="alert"><h1>論文を読み込めませんでした</h1><button onClick={() => setRetry((value) => value + 1)} type="button">再試行</button></section>;
  if (!paper) return null;
  return <PaperDetailView paper={paper} />;
}
