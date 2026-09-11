import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSavedPaperMock, getPaperSummaryMock, claimSummaryGenerationMock, completeSummaryMock, failSummaryMock, generatePaperSummaryMock } = vi.hoisted(() => ({
  getSavedPaperMock: vi.fn(),
  getPaperSummaryMock: vi.fn(),
  claimSummaryGenerationMock: vi.fn(),
  completeSummaryMock: vi.fn(),
  failSummaryMock: vi.fn(),
  generatePaperSummaryMock: vi.fn(),
}));

vi.mock("../../src/lib/papers/repository", () => ({ getSavedPaper: getSavedPaperMock }));
vi.mock("../../src/lib/summaries/repository", () => ({
  getPaperSummary: getPaperSummaryMock,
  claimSummaryGeneration: claimSummaryGenerationMock,
  completeSummary: completeSummaryMock,
  failSummary: failSummaryMock,
}));
vi.mock("../../src/lib/summaries/openai", () => ({
  SummaryGenerationError: class SummaryGenerationError extends Error {
    constructor(message: string, readonly kind: "configuration" | "provider" | "format") {
      super(message);
    }
  },
  generatePaperSummary: generatePaperSummaryMock,
}));

import { GET, POST } from "../../src/app/api/papers/[arxivId]/summary/route";

const paper = { id: "paper-1", arxivId: "2601.00001", title: "Paper title", abstract: "Paper abstract" };
const completed = { id: "summary-1", paperId: "paper-1", status: "completed", content: { overview: "Overview", keyPoints: ["Point"], significance: "Significance", limitations: "Limitations" }, model: "test-model", generatedAt: "2026-09-11T00:00:00.000Z", updatedAt: "2026-09-11T00:00:00.000Z" };

beforeEach(() => {
  vi.clearAllMocks();
  getSavedPaperMock.mockResolvedValue(paper);
  getPaperSummaryMock.mockResolvedValue(null);
  completeSummaryMock.mockResolvedValue(completed);
  failSummaryMock.mockResolvedValue({ ...completed, status: "failed", content: null });
});

describe("summary route", () => {
  it("returns the saved summary state", async () => {
    getPaperSummaryMock.mockResolvedValue(completed);

    const result = await GET(new Request("http://localhost/api/papers/2601.00001/summary"), { params: Promise.resolve({ arxivId: "2601.00001" }) });

    expect(result.status).toBe(200);
    await expect(result.json()).resolves.toEqual({ summary: completed });
  });

  it("does not call the provider when a summary is already completed", async () => {
    claimSummaryGenerationMock.mockResolvedValue({ summary: completed, claimed: false });

    const result = await POST(new Request("http://localhost/api/papers/2601.00001/summary"), { params: Promise.resolve({ arxivId: "2601.00001" }) });

    expect(result.status).toBe(200);
    expect(generatePaperSummaryMock).not.toHaveBeenCalled();
    await expect(result.json()).resolves.toEqual({ summary: completed });
  });

  it("generates and persists a new summary", async () => {
    claimSummaryGenerationMock.mockResolvedValue({ summary: { ...completed, status: "processing", content: null }, claimed: true });
    generatePaperSummaryMock.mockResolvedValue({ summary: completed.content, model: "test-model" });

    const result = await POST(new Request("http://localhost/api/papers/2601.00001/summary"), { params: Promise.resolve({ arxivId: "2601.00001" }) });

    expect(generatePaperSummaryMock).toHaveBeenCalledWith({ title: paper.title, abstract: paper.abstract });
    expect(completeSummaryMock).toHaveBeenCalledWith(paper.id, completed.content, "test-model");
    expect(result.status).toBe(200);
  });

  it("returns conflict while another generation is running", async () => {
    const processing = { ...completed, status: "processing", content: null };
    claimSummaryGenerationMock.mockResolvedValue({ summary: processing, claimed: false });

    const result = await POST(new Request("http://localhost/api/papers/2601.00001/summary"), { params: Promise.resolve({ arxivId: "2601.00001" }) });

    expect(result.status).toBe(409);
    expect(generatePaperSummaryMock).not.toHaveBeenCalled();
  });

  it("marks a claimed generation as failed when the provider fails", async () => {
    claimSummaryGenerationMock.mockResolvedValue({ summary: { ...completed, status: "processing", content: null }, claimed: true });
    generatePaperSummaryMock.mockRejectedValue(new Error("provider failed"));

    const result = await POST(new Request("http://localhost/api/papers/2601.00001/summary"), { params: Promise.resolve({ arxivId: "2601.00001" }) });

    expect(result.status).toBe(502);
    expect(failSummaryMock).toHaveBeenCalledWith(paper.id);
  });
});
