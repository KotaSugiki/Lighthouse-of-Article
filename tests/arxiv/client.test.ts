import { beforeEach, describe, expect, it, vi } from "vitest";

import { searchArxiv } from "../../src/lib/arxiv/client";

const responseXml = "<feed><totalResults>0</totalResults></feed>";

describe("searchArxiv", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("requests arXiv with a keyword and pagination parameters", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(responseXml, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await searchArxiv("large language model", 20, 20);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://export.arxiv.org/api/query?search_query=all%3Alarge+language+model&start=20&max_results=20&sortBy=submittedDate&sortOrder=descending",
      {
        headers: {
          Accept: "application/atom+xml",
          "User-Agent": "Lighthouse-of-Article/0.1",
        },
        next: { revalidate: 60 },
        signal: expect.any(AbortSignal),
      },
    );
  });

  it("rejects an empty keyword before making a request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchArxiv("   ")).rejects.toThrow("検索キーワードを入力してください");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("converts a failed response into a searchable error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", {
      status: 503,
      headers: { "Retry-After": "0" },
    })));

    await expect(searchArxiv("agents")).rejects.toThrow("arXivの検索に失敗しました");
  });

  it("falls back to arxiv.org when the export endpoint is unavailable", async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error("connect failed"))
      .mockResolvedValueOnce(new Response(responseXml, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchArxiv("agents")).resolves.toEqual({ totalResults: 0, entries: [] });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("https://arxiv.org/api/query"),
      expect.objectContaining({ headers: expect.any(Object), signal: expect.any(AbortSignal) }),
    );
  });

  it("retries a temporary failure on the same host before falling back", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response("", {
        status: 503,
        headers: { "Retry-After": "0" },
      }))
      .mockResolvedValueOnce(new Response(responseXml, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchArxiv("retryable")).resolves.toEqual({ totalResults: 0, entries: [] });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("https://export.arxiv.org/api/query"),
      expect.objectContaining({ headers: expect.any(Object), signal: expect.any(AbortSignal) }),
    );
  });

  it("deduplicates concurrent requests for the same search", async () => {
    let resolveResponse: (response: Response) => void = () => undefined;
    const pendingResponse = new Promise<Response>((resolve) => {
      resolveResponse = resolve;
    });
    const fetchMock = vi.fn().mockReturnValue(pendingResponse);
    vi.stubGlobal("fetch", fetchMock);

    const firstRequest = searchArxiv("deduplicate");
    const secondRequest = searchArxiv("deduplicate");
    resolveResponse(new Response(responseXml, { status: 200 }));

    await expect(Promise.all([firstRequest, secondRequest])).resolves.toEqual([
      { totalResults: 0, entries: [] },
      { totalResults: 0, entries: [] },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
