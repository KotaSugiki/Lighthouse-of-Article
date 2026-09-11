import { getSavedPaper } from "../../../../../lib/papers/repository";
import { isArxivId } from "../../../../../lib/arxiv/id";
import { SummaryGenerationError, generatePaperSummary } from "../../../../../lib/summaries/openai";
import { claimSummaryGeneration, completeSummary, failSummary, getPaperSummary } from "../../../../../lib/summaries/repository";

type Context = { params: Promise<{ arxivId: string }> };
const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

async function findSavedPaper(arxivId: string) {
  const paper = await getSavedPaper(arxivId);
  return paper;
}

export async function GET(_request: Request, { params }: Context) {
  const { arxivId } = await params;
  if (!isArxivId(arxivId)) return Response.json({ error: "arXiv論文IDが不正です" }, { status: 400 });

  try {
    const paper = await findSavedPaper(arxivId);
    if (!paper) return Response.json({ error: "保存論文が見つかりません" }, { status: 404 });
    return Response.json({ summary: await getPaperSummary(paper.id) }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("summary read failed", error);
    return Response.json({ error: "要約状態の取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(_request: Request, { params }: Context) {
  const { arxivId } = await params;
  if (!isArxivId(arxivId)) return Response.json({ error: "arXiv論文IDが不正です" }, { status: 400 });

  let claimed = false;
  let paperId = "";
  try {
    const paper = await findSavedPaper(arxivId);
    if (!paper) return Response.json({ error: "保存論文が見つかりません" }, { status: 404 });
    paperId = paper.id;

    const claim = await claimSummaryGeneration(paper.id);
    if (!claim.claimed) {
      const status = claim.summary.status === "processing" ? 409 : 200;
      return Response.json({ summary: claim.summary }, { status, headers: NO_STORE_HEADERS });
    }
    claimed = true;

    const generated = await generatePaperSummary({ title: paper.title, abstract: paper.abstract });
    const summary = await completeSummary(paper.id, generated.summary, generated.model);
    return Response.json({ summary }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    if (claimed && paperId) {
      try { await failSummary(paperId); } catch (failureError) { console.error("summary failure state update failed", failureError); }
    }

    if (error instanceof SummaryGenerationError && error.kind === "configuration") {
      return Response.json({ error: "要約機能が設定されていません" }, { status: 503 });
    }
    console.error("summary generation failed", error);
    return Response.json({ error: "要約の生成に失敗しました" }, { status: 502 });
  }
}
