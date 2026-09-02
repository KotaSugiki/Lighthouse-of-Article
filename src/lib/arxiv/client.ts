import { parseArxivResponse } from "./parser";
import type { ArxivSearchResponse } from "./types";

const ARXIV_API_URL = "https://export.arxiv.org/api/query";
const DEFAULT_MAX_RESULTS = 20;
const REQUEST_TIMEOUT_MS = 10_000;

export async function searchArxiv(
  keyword: string,
  start = 0,
  maxResults = DEFAULT_MAX_RESULTS,
): Promise<ArxivSearchResponse> {
  const normalizedKeyword = keyword.trim();

  if (!normalizedKeyword) {
    throw new Error("検索キーワードを入力してください");
  }

  const url = new URL(ARXIV_API_URL);
  url.searchParams.set("search_query", `all:${normalizedKeyword}`);
  url.searchParams.set("start", String(Math.max(0, start)));
  url.searchParams.set("max_results", String(Math.max(1, maxResults)));
  url.searchParams.set("sortBy", "submittedDate");
  url.searchParams.set("sortOrder", "descending");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`arXiv request failed with status ${response.status}`);
    }

    return parseArxivResponse(await response.text());
  } catch (error) {
    if (error instanceof Error && error.message === "検索キーワードを入力してください") {
      throw error;
    }

    throw new Error("arXivの検索に失敗しました");
  } finally {
    clearTimeout(timeout);
  }
}
