// Route params are already decoded by Next.js. Never decode or trim again.
export function isArxivId(value: string): boolean {
  return /^(?:\d{4}\.\d{4,5}|[a-zA-Z][a-zA-Z.-]*\/\d{7})(?:v[1-9]\d*)?$/.test(value);
}

export function canonicalArxivUrl(arxivId: string): string | undefined {
  return isArxivId(arxivId) ? `https://arxiv.org/abs/${arxivId}` : undefined;
}
