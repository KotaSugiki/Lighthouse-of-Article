export type ArxivPaper = {
  arxivId: string;
  title: string;
  abstract: string;
  authors: string[];
  categories: string[];
  publishedAt: string;
  updatedAt: string;
  arxivUrl: string;
  pdfUrl: string;
};

export type ArxivSearchResponse = {
  totalResults: number;
  entries: ArxivPaper[];
};
