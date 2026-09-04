import type { ArxivPaper } from "../arxiv/types";

export type SavedPaper = ArxivPaper & {
  id: string;
  savedAt: string;
};

export function parsePaperInput(value: unknown): ArxivPaper | null {
  if (!value || typeof value !== "object") return null;

  const paper = value as Record<string, unknown>;
  const stringFields = ["arxivId", "title", "abstract", "publishedAt", "updatedAt", "arxivUrl", "pdfUrl"];
  if (stringFields.some((field) => typeof paper[field] !== "string" || !paper[field])) return null;
  if (!Array.isArray(paper.authors) || !paper.authors.every((author) => typeof author === "string")) return null;
  if (!Array.isArray(paper.categories) || !paper.categories.every((category) => typeof category === "string")) return null;

  return {
    arxivId: paper.arxivId as string,
    title: paper.title as string,
    abstract: paper.abstract as string,
    authors: paper.authors as string[],
    categories: paper.categories as string[],
    publishedAt: paper.publishedAt as string,
    updatedAt: paper.updatedAt as string,
    arxivUrl: paper.arxivUrl as string,
    pdfUrl: paper.pdfUrl as string,
  };
}
