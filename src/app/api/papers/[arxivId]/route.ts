import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { getSavedPaper } from "../../../../lib/papers/repository";
import { isArxivId } from "../../../../lib/arxiv/id";

export async function GET(_request: Request, { params }: { params: Promise<{ arxivId: string }> }) {
  const { arxivId } = await params;
  if (!isArxivId(arxivId)) return Response.json({ error: "arXiv論文IDが不正です" }, { status: 400 });

  try {
    const paper = await getSavedPaper(arxivId);
    if (!paper) return Response.json({ error: "保存論文が見つかりません" }, { status: 404 });
    return Response.json({ paper }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "論文の取得に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ arxivId: string }> }) {
  const { arxivId } = await params;
  const normalizedArxivId = arxivId.trim();
  if (!normalizedArxivId) return Response.json({ error: "arXiv論文IDが不正です" }, { status: 400 });

  try {
    const { data, error } = await createSupabaseServerClient()
      .from("papers")
      .delete()
      .eq("arxiv_id", normalizedArxivId)
      .select("arxiv_id");

    if (error) throw error;
    if (!data?.length) return Response.json({ error: "保存論文が見つかりません" }, { status: 404 });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("saved paper delete failed", error);
    return Response.json({ error: "論文の保存解除に失敗しました" }, { status: 500 });
  }
}
