import { createSupabaseServerClient } from "../supabase/server";
import type { ArxivPaper } from "../arxiv/types";
import type { SavedPaper } from "./types";

type PaperRow = {
  id: string;
  arxiv_id: string;
  title: string;
  authors: string[];
  abstract: string;
  published_at: string;
  categories: string[];
  arxiv_url: string;
  saved_at: string;
  updated_at: string;
};

const PAPER_COLUMNS = "id, arxiv_id, title, authors, abstract, published_at, categories, arxiv_url, saved_at, updated_at";

function toPaperRow(paper: ArxivPaper) {
  return {
    arxiv_id: paper.arxivId.trim(),
    title: paper.title,
    authors: paper.authors,
    abstract: paper.abstract,
    published_at: paper.publishedAt,
    categories: paper.categories,
    arxiv_url: paper.arxivUrl,
  };
}

function toSavedPaper(row: PaperRow): SavedPaper {
  return {
    id: row.id,
    arxivId: row.arxiv_id,
    title: row.title,
    abstract: row.abstract,
    authors: row.authors,
    categories: row.categories,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    arxivUrl: row.arxiv_url,
    pdfUrl: `https://arxiv.org/pdf/${row.arxiv_id}`,
    savedAt: row.saved_at,
  };
}

export async function savePaper(paper: ArxivPaper): Promise<SavedPaper> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("papers")
    .insert(toPaperRow(paper))
    .select(PAPER_COLUMNS)
    .single();

  if (!error) return toSavedPaper(data as PaperRow);

  if (error.code === "23505") {
    const existing = await supabase
      .from("papers")
      .select(PAPER_COLUMNS)
      .eq("arxiv_id", paper.arxivId.trim())
      .single();

    if (!existing.error) return toSavedPaper(existing.data as PaperRow);
  }

  throw error;
}

export async function listSavedPapers(page: number, pageSize: number): Promise<{ totalResults: number; entries: SavedPaper[] }> {
  const supabase = createSupabaseServerClient();
  const offset = (page - 1) * pageSize;
  const { data, count, error } = await supabase
    .from("papers")
    .select(PAPER_COLUMNS, { count: "exact" })
    .order("saved_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) throw error;

  return {
    totalResults: count ?? 0,
    entries: ((data ?? []) as PaperRow[]).map(toSavedPaper),
  };
}

export async function getSavedPaper(arxivId: string): Promise<SavedPaper | null> {
  const { data, error } = await createSupabaseServerClient()
    .from("papers")
    .select(PAPER_COLUMNS)
    .eq("arxiv_id", arxivId)
    .maybeSingle();

  if (error) throw error;
  return data ? toSavedPaper(data as PaperRow) : null;
}

export async function getSavedArxivIds(arxivIds: string[]): Promise<string[]> {
  if (arxivIds.length === 0) return [];

  const { data, error } = await createSupabaseServerClient()
    .from("papers")
    .select("arxiv_id")
    .in("arxiv_id", arxivIds);

  if (error) throw error;
  return ((data ?? []) as Array<{ arxiv_id: string }>).map((paper) => paper.arxiv_id);
}
