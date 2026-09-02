import { XMLParser } from "fast-xml-parser";

import type { ArxivPaper, ArxivSearchResponse } from "./types";

const parser = new XMLParser({
  attributeNamePrefix: "@_",
  ignoreAttributes: false,
  removeNSPrefix: true,
});

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function getArxivId(id: string): string {
  return id.replace(/^https?:\/\/arxiv\.org\/(abs|pdf)\//, "").replace(/\.pdf$/, "");
}

function parseEntry(entry: Record<string, unknown>): ArxivPaper {
  const arxivUrl = cleanText(entry.id);
  const links = asArray(entry.link as Record<string, unknown> | Record<string, unknown>[]);
  const pdfLink = links.find((link) => link["@_title"] === "pdf");
  const authors = asArray(entry.author as Record<string, unknown> | Record<string, unknown>[])
    .map((author) => cleanText(author.name))
    .filter(Boolean);
  const categories = asArray(entry.category as Record<string, unknown> | Record<string, unknown>[])
    .map((category) => cleanText(category["@_term"]))
    .filter(Boolean);

  return {
    arxivId: getArxivId(arxivUrl),
    title: cleanText(entry.title),
    abstract: cleanText(entry.summary),
    authors,
    categories,
    publishedAt: cleanText(entry.published),
    updatedAt: cleanText(entry.updated),
    arxivUrl,
    pdfUrl: cleanText(pdfLink?.["@_href"]),
  };
}

export function parseArxivResponse(xml: string): ArxivSearchResponse {
  const document = parser.parse(xml) as { feed?: Record<string, unknown> };
  const feed = document.feed;

  if (!feed) {
    throw new Error("Invalid arXiv response: feed is missing");
  }

  const totalResults = Number(feed.totalResults ?? 0);
  const entries = asArray(feed.entry as Record<string, unknown> | Record<string, unknown>[])
    .map(parseEntry);

  return {
    totalResults: Number.isFinite(totalResults) ? totalResults : 0,
    entries,
  };
}
