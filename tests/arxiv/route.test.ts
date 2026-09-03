import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ArxivSearchResponse } from "../../src/lib/arxiv/types";

const { searchArxivMock } = vi.hoisted(() => ({ searchArxivMock: vi.fn() }));

vi.mock("../../src/lib/arxiv/client", () => ({
  searchArxiv: searchArxivMock,
}));

import { GET } from "../../src/app/api/arxiv/search/route";

const response: ArxivSearchResponse = {
  totalResults: 21,
  entries: [],
};

describe("GET /api/arxiv/search", () => {
  beforeEach(() => {
    searchArxivMock.mockReset();
  });

  it("passes the keyword and page offset to the arXiv client", async () => {
    searchArxivMock.mockResolvedValue(response);

    const result = await GET(new NextRequest("http://localhost/api/arxiv/search?q=agents&start=20"));

    expect(searchArxivMock).toHaveBeenCalledWith("agents", 20, 20);
    expect(result.status).toBe(200);
    await expect(result.json()).resolves.toEqual(response);
  });

  it("rejects a missing keyword", async () => {
    const result = await GET(new NextRequest("http://localhost/api/arxiv/search?q=%20"));

    expect(searchArxivMock).not.toHaveBeenCalled();
    expect(result.status).toBe(400);
    await expect(result.json()).resolves.toEqual({ error: "検索キーワードを入力してください" });
  });

  it("returns a retryable error when arXiv fails", async () => {
    searchArxivMock.mockRejectedValue(new Error("network error"));

    const result = await GET(new NextRequest("http://localhost/api/arxiv/search?q=agents"));

    expect(result.status).toBe(502);
    await expect(result.json()).resolves.toEqual({ error: "arXivの検索に失敗しました" });
  });
});
