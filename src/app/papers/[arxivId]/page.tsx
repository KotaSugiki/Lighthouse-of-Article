import type { Metadata } from "next";
import PaperDetail from "@/components/paper-detail/paper-detail";
import { DetailShell } from "@/components/paper-detail/detail-shell";

type Props = { params: Promise<{ arxivId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { arxivId } = await params;
  return { title: `論文詳細 | ${arxivId} | 論文の灯台` };
}

export default async function Page({ params }: Props) {
  const { arxivId } = await params;
  return <DetailShell><PaperDetail arxivId={arxivId} /></DetailShell>;
}