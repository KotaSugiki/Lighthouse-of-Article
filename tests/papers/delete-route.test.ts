import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { deleteMock, eqMock, fromMock, selectMock } = vi.hoisted(() => ({
  deleteMock: vi.fn(),
  eqMock: vi.fn(),
  fromMock: vi.fn(),
  selectMock: vi.fn(),
}));

vi.mock("../../src/lib/supabase/server", () => ({
  createSupabaseServerClient: () => ({ from: fromMock }),
}));

import { DELETE } from "../../src/app/api/papers/[arxivId]/route";

describe("DELETE /api/papers/:arxivId", () => {
  beforeEach(() => {
    deleteMock.mockReset();
    eqMock.mockReset();
    fromMock.mockReset();
    selectMock.mockReset();
    fromMock.mockReturnValue({ delete: deleteMock });
    deleteMock.mockReturnValue({ eq: eqMock });
    eqMock.mockReturnValue({ select: selectMock });
    selectMock.mockResolvedValue({ data: [{ arxiv_id: "2601.00001" }], error: null });
  });

  it("deletes a saved paper by arXiv ID", async () => {
    const result = await DELETE(new NextRequest("http://localhost/api/papers/2601.00001"), {
      params: Promise.resolve({ arxivId: "2601.00001" }),
    });

    expect(fromMock).toHaveBeenCalledWith("papers");
    expect(eqMock).toHaveBeenCalledWith("arxiv_id", "2601.00001");
    expect(result.status).toBe(204);
  });

  it("returns not found when the arXiv ID is not saved", async () => {
    selectMock.mockResolvedValue({ data: [], error: null });

    const result = await DELETE(new NextRequest("http://localhost/api/papers/missing"), {
      params: Promise.resolve({ arxivId: "missing" }),
    });

    expect(result.status).toBe(404);
    await expect(result.json()).resolves.toEqual({ error: "保存論文が見つかりません" });
  });
});
