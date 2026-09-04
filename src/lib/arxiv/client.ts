import { parseArxivResponse } from "./parser";
import type { ArxivSearchResponse } from "./types";

const ARXIV_API_URLS = [
  "https://export.arxiv.org/api/query",
  "https://arxiv.org/api/query",
] as const;
const DEFAULT_MAX_RESULTS = 20;
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS_PER_HOST = 2;
const DEFAULT_RETRY_DELAY_MS = 3_000;
const MAX_RETRY_DELAY_MS = 10_000;
const SEARCH_CACHE_REVALIDATE_SECONDS = 60;
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

const inFlightSearches = new Map<string, Promise<ArxivSearchResponse>>();

export class ArxivSearchUnavailableError extends Error {
  constructor() {
    super("arXivの検索に失敗しました");
    this.name = "ArxivSearchUnavailableError";
  }
}

function buildSearchUrl(apiUrl: string, keyword: string, start: number, maxResults: number) {
  const url = new URL(apiUrl);
  url.searchParams.set("search_query", `all:${keyword}`);
  url.searchParams.set("start", String(start));
  url.searchParams.set("max_results", String(maxResults));
  url.searchParams.set("sortBy", "submittedDate");
  url.searchParams.set("sortOrder", "descending");
  return url;
}

function getRetryDelay(response: Response) {
  const retryAfter = response.headers.get("Retry-After");

  if (retryAfter) {
    const seconds = Number(retryAfter);

    if (Number.isFinite(seconds)) {
      return Math.min(Math.max(0, seconds * 1_000), MAX_RETRY_DELAY_MS);
    }

    const retryAt = Date.parse(retryAfter);

    if (Number.isFinite(retryAt)) {
      return Math.min(Math.max(0, retryAt - Date.now()), MAX_RETRY_DELAY_MS);
    }
  }

  return DEFAULT_RETRY_DELAY_MS;
}

function wait(milliseconds: number) {
  if (milliseconds <= 0) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

async function requestFromHost(
  apiUrl: string,
  keyword: string,
  start: number,
  maxResults: number,
): Promise<ArxivSearchResponse | null> {
  const url = buildSearchUrl(apiUrl, keyword, start, maxResults);

  for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_HOST; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url.toString(), {
        headers: {
          Accept: "application/atom+xml",
          "User-Agent": "Lighthouse-of-Article/0.1",
        },
        next: { revalidate: SEARCH_CACHE_REVALIDATE_SECONDS },
        signal: controller.signal,
      });

      if (response.ok) {
        return parseArxivResponse(await response.text());
      }

      if (!RETRYABLE_STATUS_CODES.has(response.status) || attempt === MAX_ATTEMPTS_PER_HOST - 1) {
        return null;
      }

      await wait(getRetryDelay(response));
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  return null;
}

async function searchArxivInternal(
  normalizedKeyword: string,
  normalizedStart: number,
  normalizedMaxResults: number,
): Promise<ArxivSearchResponse> {
  for (const apiUrl of ARXIV_API_URLS) {
    const result = await requestFromHost(
      apiUrl,
      normalizedKeyword,
      normalizedStart,
      normalizedMaxResults,
    );

    if (result) {
      return result;
    }
  }

  throw new ArxivSearchUnavailableError();
}

export async function searchArxiv(
  keyword: string,
  start = 0,
  maxResults = DEFAULT_MAX_RESULTS,
): Promise<ArxivSearchResponse> {
  const normalizedKeyword = keyword.trim();

  if (!normalizedKeyword) {
    throw new Error("検索キーワードを入力してください");
  }

  const normalizedStart = Math.max(0, start);
  const normalizedMaxResults = Math.max(1, maxResults);
  const requestKey = `${normalizedKeyword}\u0000${normalizedStart}\u0000${normalizedMaxResults}`;
  const existingRequest = inFlightSearches.get(requestKey);

  if (existingRequest) {
    return existingRequest;
  }

  const request = searchArxivInternal(normalizedKeyword, normalizedStart, normalizedMaxResults);
  const trackedRequest = request.finally(() => {
    if (inFlightSearches.get(requestKey) === trackedRequest) {
      inFlightSearches.delete(requestKey);
    }
  });

  inFlightSearches.set(requestKey, trackedRequest);

  return trackedRequest;
}
