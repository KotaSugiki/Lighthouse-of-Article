import { afterEach, describe, expect, it, vi } from "vitest";
import { generatePaperSummary } from "../../src/lib/summaries/openai";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const generated = {
  overview: "研究の概要です。",
  keyPoints: ["第一のポイント", "第二のポイント"],
  significance: "研究上の意義です。",
  limitations: "限界と注意点です。",
};

describe("generatePaperSummary", () => {
  it("sends the abstract to the Responses API and parses structured output", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubEnv("OPENAI_MODEL", "test-model");
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ output_text: JSON.stringify(generated) }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(generatePaperSummary({ title: "Paper title", abstract: "Paper abstract" })).resolves.toEqual({
      summary: generated,
      model: "test-model",
    });
    expect(fetchMock).toHaveBeenCalledWith("https://api.openai.com/v1/responses", expect.objectContaining({
      method: "POST",
      headers: { Authorization: "Bearer test-key", "Content-Type": "application/json" },
    }));
    const request = JSON.parse(fetchMock.mock.calls[0][1].body as string) as { store: boolean; text: { format: { type: string } } };
    expect(request.store).toBe(false);
    expect(request.text.format.type).toBe("json_schema");
  });

  it("limits abstract input before sending it to control cost", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubEnv("SUMMARY_MAX_ABSTRACT_CHARACTERS", "5");
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ output_text: JSON.stringify(generated) }));
    vi.stubGlobal("fetch", fetchMock);

    await generatePaperSummary({ title: "Title", abstract: "123456789" });

    const request = JSON.parse(fetchMock.mock.calls[0][1].body as string) as { input: string };
    expect(request.input).toContain("Abstract:\n12345");
    expect(request.input).not.toContain("123456");
  });

  it("rejects provider responses that are not structured summaries", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ output_text: "not-json" })));

    await expect(generatePaperSummary({ title: "Title", abstract: "Abstract" })).rejects.toMatchObject({ kind: "format" });
  });
});
