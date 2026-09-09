import { beforeEach, expect, it, vi } from "vitest";

const { from, select, eq, maybeSingle } = vi.hoisted(() => ({ from: vi.fn(), select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() }));
vi.mock("../../src/lib/supabase/server", () => ({ createSupabaseServerClient: () => ({ from }) }));
import * as route from "../../src/app/api/papers/[arxivId]/route";

beforeEach(() => {
  vi.clearAllMocks();
  maybeSingle.mockReset();
  from.mockReturnValue({ select });
  select.mockReturnValue({ eq });
  eq.mockReturnValue({ maybeSingle });
});

it.each(["2601.00001v2", "hep-th/9901001"])("gets full saved metadata for %s", async (arxivId) => {
  const row = { id: "paper-1", arxiv_id: arxivId, title: "Full paper", authors: ["A", "B", "C", "D"], categories: ["cs.AI", "cs.LG"], abstract: "Full abstract. ".repeat(100), published_at: "2026-01-01T00:00:00Z", saved_at: "2026-09-01T00:00:00Z", updated_at: "2026-09-01T00:00:00Z", arxiv_url: `https://arxiv.org/abs/${arxivId}` };
  maybeSingle.mockResolvedValue({ data: row, error: null });
  expect(route).toHaveProperty("GET");
  const result = await (route as typeof route & { GET: typeof route.DELETE }).GET(new Request(`http://localhost/api/papers/${encodeURIComponent(arxivId)}`), { params: Promise.resolve({ arxivId }) });
  expect(result.status).toBe(200);
  expect(eq).toHaveBeenCalledWith("arxiv_id", arxivId);
  expect(from).toHaveBeenCalledTimes(1);
  expect(from).toHaveBeenCalledWith("papers");
  await expect(result.json()).resolves.toMatchObject({ paper: { arxivId, authors: row.authors, categories: row.categories, abstract: row.abstract, publishedAt: row.published_at, savedAt: row.saved_at } });
});


it("returns 404 for an unsaved paper", async () => {
  maybeSingle.mockResolvedValue({ data: null, error: null });
  const result = await route.GET(new Request("http://localhost/api/papers/2601.00001"), { params: Promise.resolve({ arxivId: "2601.00001" }) });
  expect(result.status).toBe(404);
  await expect(result.json()).resolves.toEqual({ error: "保存論文が見つかりません" });
});

it("returns a safe error when storage fails", async () => {
  maybeSingle.mockResolvedValue({ data: null, error: { message: "private database detail" } });
  const result = await route.GET(new Request("http://localhost/api/papers/2601.00001"), { params: Promise.resolve({ arxivId: "2601.00001" }) });
  expect(result.status).toBe(500);
  await expect(result.json()).resolves.toEqual({ error: "論文の取得に失敗しました" });
});

it.each(["", "../2601.00001", "2601.00001?x=1", "2601.00001%2F", " 2601.00001", "https://evil.test"])("rejects malformed ID %s without querying storage", async (arxivId) => {
  const result = await route.GET(new Request("http://localhost/api/papers/id"), { params: Promise.resolve({ arxivId }) });
  expect(result.status).toBe(400);
  expect(from).not.toHaveBeenCalled();
});
