// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import PaperDetail from "../../src/components/paper-detail/paper-detail";
import { paper } from "./fixture";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("loads the saved paper with full metadata, abstract and the M6 summary action", async () => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json({ paper }));
  vi.stubGlobal("fetch", fetchMock);
  render(<PaperDetail arxivId={paper.arxivId} />);
  expect(screen.getByRole("status").textContent).toContain("読み込んでいます");
  expect(await screen.findByRole("heading", { name: paper.title })).toBeTruthy();
  expect(fetchMock).toHaveBeenCalledWith("/api/papers/hep-th%2F9901001", expect.objectContaining({ cache: "no-store" }));
  expect(screen.getByText(paper.authors.join(", "))).toBeTruthy();
  for (const category of paper.categories) expect(screen.getByText(category)).toBeTruthy();
  expect(screen.getByTestId("full-abstract").textContent).toBe(paper.abstract);
  expect(screen.getByText("公開日").nextElementSibling?.querySelector("time")?.dateTime).toBe(paper.publishedAt);
  expect(screen.getByText("保存日時").nextElementSibling?.querySelector("time")?.dateTime).toBe(paper.savedAt);
  expect(screen.getByText("保存済み")).toBeTruthy();
  const link = screen.getByRole("link", { name: /arXivで読む/ });
  expect(link.getAttribute("href")).toBe("https://arxiv.org/abs/hep-th/9901001");
  expect(link.getAttribute("target")).toBe("_blank");
  expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  expect(screen.getByText("Abstractを日本語で要約し、保存できます。")).toBeTruthy();
  expect(screen.getByRole("button", { name: "要約を生成" })).toBeTruthy();
});


it("shows a missing-paper state on 404 without claiming it is saved", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: "missing" }, { status: 404 })));
  render(<PaperDetail arxivId={paper.arxivId} />);
  expect(await screen.findByRole("heading", { name: "保存論文が見つかりません" })).toBeTruthy();
  expect(screen.queryByText("保存済み")).toBeNull();
  expect(screen.getByRole("link", { name: "保存した論文へ" }).getAttribute("href")).toBe("/saved");
});

it("allows retry after a failed read", async () => {
  const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({}, { status: 500 })).mockResolvedValueOnce(Response.json({ paper }));
  vi.stubGlobal("fetch", fetchMock);
  render(<PaperDetail arxivId={paper.arxivId} />);
  expect(await screen.findByRole("alert")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "再試行" }));
  expect(await screen.findByRole("heading", { name: paper.title })).toBeTruthy();
});

it("handles a rejected network read without an unhandled rejection", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  render(<PaperDetail arxivId={paper.arxivId} />);
  expect(await screen.findByRole("alert")).toBeTruthy();
});

it.each([204, 404])("removes saved metadata after DELETE returns %s", async (status) => {
  const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ paper })).mockResolvedValueOnce(Response.json({ summary: null })).mockResolvedValueOnce(new Response(null, { status }));
  vi.stubGlobal("fetch", fetchMock);
  render(<PaperDetail arxivId={paper.arxivId} />);
  fireEvent.click(await screen.findByRole("button", { name: "保存を解除" }));
  expect(await screen.findByRole("heading", { name: "保存を解除しました" })).toBeTruthy();
  expect(screen.queryByText("保存済み")).toBeNull();
  expect(screen.queryByTestId("full-abstract")).toBeNull();
  expect(fetchMock).toHaveBeenLastCalledWith("/api/papers/hep-th%2F9901001", { method: "DELETE" });
});

it("keeps the saved state after failed DELETE and retries safely", async () => {
  const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ paper })).mockResolvedValueOnce(Response.json({ summary: null })).mockResolvedValueOnce(new Response(null, { status: 500 })).mockResolvedValueOnce(new Response(null, { status: 204 }));
  vi.stubGlobal("fetch", fetchMock);
  render(<PaperDetail arxivId={paper.arxivId} />);
  fireEvent.click(await screen.findByRole("button", { name: "保存を解除" }));
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(screen.getByText("保存済み")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "保存解除を再試行" }));
  await waitFor(() => expect(screen.queryByText("保存済み")).toBeNull());
});
