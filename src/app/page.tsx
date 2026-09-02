import { AppShell } from "@/components/layout/app-shell";

export default function Home() {
  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-[#a47700]"><span className="h-px w-8 bg-[#f4c542]" />SEARCH THE HORIZON</p>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#171717] md:text-5xl">
            読みたい論文を見つける
          </h1>
          <p className="mt-5 text-base leading-7 text-[#6f6758]">
            arXivの論文をキーワードで検索して、気になる論文を保存できます。
          </p>
        </div>

        <form className="mt-10 flex max-w-3xl flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="paper-search">論文を検索</label>
          <input
            className="h-14 min-w-0 flex-1 rounded-xl border border-[#d8cda9] bg-white px-5 text-base text-[#171717] outline-none placeholder:text-[#a59b86] focus:border-[#c89d19] focus:ring-4 focus:ring-[#f4c542]/20"
            id="paper-search"
            placeholder="キーワードを入力（例：large language model）"
            type="search"
          />
          <button className="h-14 rounded-xl bg-[#171717] px-7 text-sm font-semibold text-[#f4c542] transition-colors hover:bg-[#302c24]" type="submit">
            検索する
          </button>
        </form>

        <div className="relative mt-20 overflow-hidden rounded-2xl border border-[#eadfbf] bg-[#fffdf8] px-6 py-14 text-center shadow-[0_18px_50px_rgba(82,64,18,0.06)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-[#f4c542]" />
          <p className="text-base font-semibold text-[#403a2e]">検索結果はここに表示されます</p>
          <p className="mt-2 text-sm text-[#8d836e]">キーワードを入力して検索を始めてください。</p>
        </div>
      </section>
    </AppShell>
  );
}
