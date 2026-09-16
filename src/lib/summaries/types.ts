export const SUMMARY_STATUSES = ["pending", "processing", "completed", "failed"] as const;

export type SummaryStatus = (typeof SUMMARY_STATUSES)[number];

export type StructuredSummary = {
  overview: string;
  keyPoints: string[];
  significance: string;
  limitations: string;
};

export type PaperSummary = {
  id: string;
  paperId: string;
  status: SummaryStatus;
  content: StructuredSummary | null;
  model: string | null;
  generatedAt: string | null;
  updatedAt: string;
};

export function isStructuredSummary(value: unknown): value is StructuredSummary {
  if (!value || typeof value !== "object") return false;

  const summary = value as Record<string, unknown>;
  return typeof summary.overview === "string"
    && Array.isArray(summary.keyPoints)
    && summary.keyPoints.every((point) => typeof point === "string")
    && typeof summary.significance === "string"
    && typeof summary.limitations === "string";
}
