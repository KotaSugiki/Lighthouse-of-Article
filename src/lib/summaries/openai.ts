import { isStructuredSummary, type StructuredSummary } from "./types";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_MAX_ABSTRACT_CHARACTERS = 12000;

export class SummaryGenerationError extends Error {
  constructor(message: string, readonly kind: "configuration" | "provider" | "format") {
    super(message);
    this.name = "SummaryGenerationError";
  }
}

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function extractOutputText(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const response = value as { output_text?: unknown; output?: unknown };
  if (typeof response.output_text === "string") return response.output_text;
  if (!Array.isArray(response.output)) return null;

  for (const item of response.output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const text = (part as { text?: unknown }).text;
      if (typeof text === "string") return text;
    }
  }

  return null;
}

function parseStructuredSummary(text: string): StructuredSummary {
  try {
    const parsed: unknown = JSON.parse(text);
    if (isStructuredSummary(parsed)) return parsed;
  } catch {
    // The provider response is handled below without exposing its raw content.
  }

  throw new SummaryGenerationError("要約の形式が不正です", "format");
}

export async function generatePaperSummary(input: { title: string; abstract: string }): Promise<{ summary: StructuredSummary; model: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new SummaryGenerationError("要約APIが設定されていません", "configuration");

  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
  const maxCharacters = positiveInteger(process.env.SUMMARY_MAX_ABSTRACT_CHARACTERS, DEFAULT_MAX_ABSTRACT_CHARACTERS);
  const abstract = input.abstract.slice(0, maxCharacters);
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      store: false,
      instructions: "あなたは論文を正確に要約するアシスタントです。入力された論文情報だけを根拠に、日本語で簡潔かつ構造化された要約を作成してください。推測や根拠のない補足は避けてください。",
      input: `タイトル: ${input.title}\n\nAbstract:\n${abstract}`,
      max_output_tokens: 800,
      text: {
        format: {
          type: "json_schema",
          name: "paper_summary",
          strict: true,
          schema: {
            type: "object",
            properties: {
              overview: { type: "string" },
              keyPoints: { type: "array", items: { type: "string" } },
              significance: { type: "string" },
              limitations: { type: "string" },
            },
            required: ["overview", "keyPoints", "significance", "limitations"],
            additionalProperties: false,
          },
        },
      },
    }),
  });

  if (!response.ok) throw new SummaryGenerationError("要約APIの呼び出しに失敗しました", "provider");

  const body: unknown = await response.json();
  const text = extractOutputText(body);
  if (!text) throw new SummaryGenerationError("要約APIから結果を取得できませんでした", "format");
  return { summary: parseStructuredSummary(text), model };
}
