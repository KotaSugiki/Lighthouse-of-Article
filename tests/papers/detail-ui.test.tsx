// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { PaperCard } from "../../src/components/papers/paper-card";

import { paper } from "./fixture";
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("links a saved card title and detail action to the encoded saved-only route", () => {
  render(<PaperCard paper={paper} saved onToggleSave={vi.fn()} />);
  expect(screen.getByRole("link", { name: paper.title }).getAttribute("href")).toBe("/papers/hep-th%2F9901001");
  expect(screen.getByRole("link", { name: "詳細を見る" }).getAttribute("href")).toBe("/papers/hep-th%2F9901001");
});

it("explains the saved-only policy without linking unsaved cards to a missing detail", () => {
  render(<PaperCard paper={paper} saved={false} onToggleSave={vi.fn()} />);
  expect(screen.queryByRole("link", { name: paper.title })).toBeNull();
  expect(screen.queryByRole("link", { name: "詳細を見る" })).toBeNull();
  expect(screen.getByText("詳細は保存後に閲覧できます")).toBeTruthy();
});

it("builds the external link from the arXiv ID rather than trusting stored URLs", () => {
  render(<PaperCard paper={paper} saved onToggleSave={vi.fn()} />);
  const link = screen.getByRole("link", { name: /arXivで読む/ });
  expect(link.getAttribute("href")).toBe("https://arxiv.org/abs/hep-th/9901001");
  expect(link.getAttribute("target")).toBe("_blank");
  expect(link.getAttribute("rel")).toContain("noopener");
});
