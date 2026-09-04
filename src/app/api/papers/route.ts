import { getSavedArxivIds, listSavedPapers, savePaper } from "../../../lib/papers/repository";
import { isSupabaseConfigured } from "../../../lib/supabase/server";
import { parsePaperInput } from "../../../lib/papers/types";

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const requestedArxivIds = searchParams.get("arxivIds");
  if (requestedArxivIds !== null) {
    const arxivIds = requestedArxivIds.split(",").map((arxivId) => arxivId.trim()).filter(Boolean).slice(0, PAGE_SIZE);

    if (!isSupabaseConfigured()) {
      return Response.json({ savedArxivIds: [] });
    }

    try {
      return Response.json({ savedArxivIds: await getSavedArxivIds(arxivIds) });
    } catch (error) {
      console.error("saved paper status failed", error);
      return Response.json({ error: "保存状態の取得に失敗しました" }, { status: 500 });
    }
  }

  const pageParam = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  try {
    return Response.json(await listSavedPapers(page, PAGE_SIZE));
  } catch (error) {
    console.error("saved paper list failed", error);
    return Response.json({ error: "保存論文の取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let value: unknown;

  try {
    value = await request.json();
  } catch {
    return Response.json({ error: "論文データが不正です" }, { status: 400 });
  }

  const paper = parsePaperInput(value);
  if (!paper) return Response.json({ error: "論文データが不正です" }, { status: 400 });

  try {
    return Response.json({ paper: await savePaper(paper) }, { status: 201 });
  } catch (error) {
    console.error("paper save failed", error);
    return Response.json({ error: "論文の保存に失敗しました" }, { status: 500 });
  }
}
