import { describe, expect, it } from "vitest";

import { parseArxivResponse } from "../../src/lib/arxiv/parser";

const atomXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:arxiv="http://arxiv.org/schemas/atom">
  <opensearch:totalResults xmlns:opensearch="http://a9.com/-/spec/opensearch/1.1/">1</opensearch:totalResults>
  <entry>
    <id>http://arxiv.org/abs/2501.12345</id>
    <updated>2025-01-20T10:00:00Z</updated>
    <published>2025-01-19T09:00:00Z</published>
    <title>  A useful paper\nabout agents  </title>
    <summary>  This is the abstract.\nIt has two lines. </summary>
    <author><name>Alice Smith</name></author>
    <author><name>Bob Jones</name></author>
    <category term="cs.AI" />
    <category term="cs.LG" />
    <link title="pdf" type="application/pdf" href="http://arxiv.org/pdf/2501.12345" />
  </entry>
</feed>`;

describe("parseArxivResponse", () => {
  it("converts an arXiv Atom entry into a normalized paper", () => {
    expect(parseArxivResponse(atomXml)).toEqual({
      totalResults: 1,
      entries: [
        {
          arxivId: "2501.12345",
          title: "A useful paper about agents",
          abstract: "This is the abstract. It has two lines.",
          authors: ["Alice Smith", "Bob Jones"],
          categories: ["cs.AI", "cs.LG"],
          publishedAt: "2025-01-19T09:00:00Z",
          updatedAt: "2025-01-20T10:00:00Z",
          arxivUrl: "http://arxiv.org/abs/2501.12345",
          pdfUrl: "http://arxiv.org/pdf/2501.12345",
        },
      ],
    });
  });

  it("returns an empty entry list when arXiv finds no papers", () => {
    expect(parseArxivResponse("<feed><opensearch:totalResults>0</opensearch:totalResults></feed>")).toEqual({
      totalResults: 0,
      entries: [],
    });
  });
});
