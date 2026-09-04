import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { eqMock, existingSingleMock, fromMock, inMock, insertMock, orderMock, rangeMock, selectMock, singleMock } = vi.hoisted(() => ({
  eqMock: vi.fn(),
  existingSingleMock: vi.fn(),
  fromMock: vi.fn(),
  inMock: vi.fn(),
  insertMock: vi.fn(),
  orderMock: vi.fn(),
  rangeMock: vi.fn(),
  selectMock: vi.fn(),
  singleMock: vi.fn(),
}));

vi.mock("../../src/lib/supabase/server", () => ({
  createSupabaseServerClient: () => ({ from: fromMock }),
}));

import { GET, POST } from "../../src/app/api/papers/route";

const paper = {
  arxivId: "2601.00001",
  title: "A saved paper",
  abstract: "An abstract for a saved paper.",
  authors: ["Ada Lovelace"],
  categories: ["cs.AI"],
  publishedAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
  arxivUrl: "https://arxiv.org/abs/2601.00001",
  pdfUrl: "https://arxiv.org/pdf/2601.00001",
};

describe("POST /api/papers", () => {
  beforeEach(() => {
    fromMock.mockReset();
    insertMock.mockReset();
    selectMock.mockReset();
    singleMock.mockReset();
    eqMock.mockReset();
    existingSingleMock.mockReset();
    inMock.mockReset();
    orderMock.mockReset();
    rangeMock.mockReset();
    fromMock.mockReturnValue({ insert: insertMock, select: selectMock });
    insertMock.mockReturnValue({ select: selectMock });
    selectMock.mockReturnValue({ single: singleMock });
    eqMock.mockReturnValue({ single: existingSingleMock });
    singleMock.mockResolvedValue({
      data: {
        id: "paper-1",
        arxiv_id: paper.arxivId,
        title: paper.title,
        authors: paper.authors,
        abstract: paper.abstract,
        published_at: paper.publishedAt,
        categories: paper.categories,
        arxiv_url: paper.arxivUrl,
        saved_at: "2026-09-04T00:00:00.000Z",
        updated_at: "2026-09-04T00:00:00.000Z",
      },
      error: null,
    });
  });

  it("saves a paper and returns the saved paper", async () => {
    const result = await POST(
      new NextRequest("http://localhost/api/papers", {
        body: JSON.stringify(paper),
        headers: { "content-type": "application/json" },
        method: "POST",
      }),
    );

    expect(fromMock).toHaveBeenCalledWith("papers");
    expect(insertMock).toHaveBeenCalledWith({
      arxiv_id: paper.arxivId,
      title: paper.title,
      authors: paper.authors,
      abstract: paper.abstract,
      published_at: paper.publishedAt,
      categories: paper.categories,
      arxiv_url: paper.arxivUrl,
    });
    expect(result.status).toBe(201);
    await expect(result.json()).resolves.toEqual({
      paper: {
        id: "paper-1",
        arxivId: paper.arxivId,
        title: paper.title,
        abstract: paper.abstract,
        authors: paper.authors,
        categories: paper.categories,
        publishedAt: paper.publishedAt,
        updatedAt: "2026-09-04T00:00:00.000Z",
        arxivUrl: paper.arxivUrl,
        pdfUrl: "https://arxiv.org/pdf/2601.00001",
        savedAt: "2026-09-04T00:00:00.000Z",
      },
    });
  });

  it("rejects an incomplete paper payload", async () => {
    const result = await POST(
      new NextRequest("http://localhost/api/papers", {
        body: JSON.stringify({ arxivId: paper.arxivId }),
        headers: { "content-type": "application/json" },
        method: "POST",
      }),
    );

    expect(fromMock).not.toHaveBeenCalled();
    expect(result.status).toBe(400);
    await expect(result.json()).resolves.toEqual({ error: "論文データが不正です" });
  });

  it("returns the existing paper when the arXiv ID is already saved", async () => {
    singleMock.mockResolvedValue({ data: null, error: { code: "23505" } });
    selectMock
      .mockImplementationOnce(() => ({ single: singleMock }))
      .mockImplementationOnce(() => ({ eq: eqMock }));
    existingSingleMock.mockResolvedValue({
      data: {
        id: "paper-1",
        arxiv_id: paper.arxivId,
        title: paper.title,
        authors: paper.authors,
        abstract: paper.abstract,
        published_at: paper.publishedAt,
        categories: paper.categories,
        arxiv_url: paper.arxivUrl,
        saved_at: "2026-09-04T00:00:00.000Z",
        updated_at: "2026-09-04T00:00:00.000Z",
      },
      error: null,
    });

    const result = await POST(
      new NextRequest("http://localhost/api/papers", {
        body: JSON.stringify(paper),
        headers: { "content-type": "application/json" },
        method: "POST",
      }),
    );

    expect(eqMock).toHaveBeenCalledWith("arxiv_id", paper.arxivId);
    expect(result.status).toBe(201);
    await expect(result.json()).resolves.toMatchObject({ paper: { id: "paper-1", arxivId: paper.arxivId } });
  });
});

describe("GET /api/papers", () => {
  beforeEach(() => {
    fromMock.mockReset();
    selectMock.mockReset();
    orderMock.mockReset();
    rangeMock.mockReset();
    fromMock.mockReturnValue({ select: selectMock });
    selectMock.mockReturnValue({ order: orderMock });
    orderMock.mockReturnValue({ range: rangeMock });
    rangeMock.mockResolvedValue({
      count: 21,
      data: [
        {
          id: "paper-1",
          arxiv_id: paper.arxivId,
          title: paper.title,
          authors: paper.authors,
          abstract: paper.abstract,
          published_at: paper.publishedAt,
          categories: paper.categories,
          arxiv_url: paper.arxivUrl,
          saved_at: "2026-09-04T00:00:00.000Z",
          updated_at: "2026-09-04T00:00:00.000Z",
        },
      ],
      error: null,
    });
  });

  it("returns saved papers in newest-first pages", async () => {
    const result = await GET(new NextRequest("http://localhost/api/papers?page=2"));

    expect(selectMock).toHaveBeenCalledWith(expect.stringContaining("saved_at"), { count: "exact" });
    expect(orderMock).toHaveBeenCalledWith("saved_at", { ascending: false });
    expect(rangeMock).toHaveBeenCalledWith(20, 39);
    expect(result.status).toBe(200);
    await expect(result.json()).resolves.toMatchObject({ totalResults: 21, entries: [{ id: "paper-1", arxivId: paper.arxivId }] });
  });

  it("returns saved arXiv IDs for search result cards", async () => {
    selectMock.mockReturnValue({ in: inMock });
    inMock.mockResolvedValue({ data: [{ arxiv_id: paper.arxivId }], error: null });

    const result = await GET(new NextRequest("http://localhost/api/papers?arxivIds=2601.00001,2601.00002"));

    expect(inMock).toHaveBeenCalledWith("arxiv_id", ["2601.00001", "2601.00002"]);
    expect(result.status).toBe(200);
    await expect(result.json()).resolves.toEqual({ savedArxivIds: [paper.arxivId] });
  });
});
