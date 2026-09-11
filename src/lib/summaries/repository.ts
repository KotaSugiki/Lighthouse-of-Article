import { createSupabaseServerClient } from "../supabase/server";
import { isStructuredSummary, type PaperSummary, type StructuredSummary } from "./types";

type SummaryRow = {
  id: string;
  paper_id: string;
  summary_json: unknown;
  summary_text: string | null;
  model: string | null;
  status: PaperSummary["status"];
  generated_at: string | null;
  updated_at: string;
};

const SUMMARY_COLUMNS = "id, paper_id, summary_json, summary_text, model, status, generated_at, updated_at";

function toPaperSummary(row: SummaryRow): PaperSummary {
  const content = isStructuredSummary(row.summary_json)
    ? row.summary_json
    : row.summary_text
      ? { overview: row.summary_text, keyPoints: [], significance: "", limitations: "" }
      : null;

  return {
    id: row.id,
    paperId: row.paper_id,
    status: row.status,
    content,
    model: row.model,
    generatedAt: row.generated_at,
    updatedAt: row.updated_at,
  };
}

export async function getPaperSummary(paperId: string): Promise<PaperSummary | null> {
  const { data, error } = await createSupabaseServerClient()
    .from("summaries")
    .select(SUMMARY_COLUMNS)
    .eq("paper_id", paperId)
    .maybeSingle();

  if (error) throw error;
  return data ? toPaperSummary(data as SummaryRow) : null;
}

export async function ensurePendingSummary(paperId: string): Promise<PaperSummary> {
  const { data, error } = await createSupabaseServerClient()
    .from("summaries")
    .insert({ paper_id: paperId, status: "pending" })
    .select(SUMMARY_COLUMNS)
    .single();

  if (!error) return toPaperSummary(data as SummaryRow);
  if (error.code === "23505") {
    const existing = await getPaperSummary(paperId);
    if (existing) return existing;
  }

  throw error;
}

export async function claimSummaryGeneration(paperId: string): Promise<{ summary: PaperSummary; claimed: boolean }> {
  const current = await ensurePendingSummary(paperId);
  if (current.status === "completed" || current.status === "processing") {
    return { summary: current, claimed: false };
  }

  const { data, error } = await createSupabaseServerClient()
    .from("summaries")
    .update({
      status: "processing",
      summary_json: null,
      summary_text: null,
      generated_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("paper_id", paperId)
    .eq("status", current.status)
    .select(SUMMARY_COLUMNS)
    .maybeSingle();

  if (error) throw error;
  if (data) return { summary: toPaperSummary(data as SummaryRow), claimed: true };

  const latest = await getPaperSummary(paperId);
  if (!latest) throw new Error("Summary claim returned no row");
  return { summary: latest, claimed: false };
}

export async function completeSummary(paperId: string, content: StructuredSummary, model: string): Promise<PaperSummary> {
  const { data, error } = await createSupabaseServerClient()
    .from("summaries")
    .update({
      summary_json: content,
      summary_text: content.overview,
      model,
      status: "completed",
      generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("paper_id", paperId)
    .select(SUMMARY_COLUMNS)
    .single();

  if (error) throw error;
  return toPaperSummary(data as SummaryRow);
}

export async function failSummary(paperId: string): Promise<PaperSummary> {
  const { data, error } = await createSupabaseServerClient()
    .from("summaries")
    .update({ status: "failed", updated_at: new Date().toISOString() })
    .eq("paper_id", paperId)
    .select(SUMMARY_COLUMNS)
    .single();

  if (error) throw error;
  return toPaperSummary(data as SummaryRow);
}
