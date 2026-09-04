import { NextRequest } from "next/server";

import {
  ArxivSearchUnavailableError,
  searchArxiv,
} from "../../../../lib/arxiv/client";

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get("q") ?? "";
  const start = Number(request.nextUrl.searchParams.get("start") ?? "0");

  if (!keyword.trim()) {
    return Response.json({ error: "検索キーワードを入力してください" }, { status: 400 });
  }

  try {
    const result = await searchArxiv(keyword, Number.isFinite(start) ? start : 0, 20);
    return Response.json(result);
  } catch (error) {
    console.error("arXiv search failed", error);
    const status = error instanceof ArxivSearchUnavailableError ? 503 : 502;
    return Response.json({ error: "arXivの検索に失敗しました" }, { status });
  }
}
