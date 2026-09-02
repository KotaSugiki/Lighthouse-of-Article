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
      { signal: expect.any(AbortSignal) },
    );
  });

  it("rejects an empty keyword before making a request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchArxiv("   ")).rejects.toThrow("検索キーワードを入力してください");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("converts a failed response into a searchable error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 503 })));

    await expect(searchArxiv("agents")).rejects.toThrow("arXivの検索に失敗しました");
  });
});
