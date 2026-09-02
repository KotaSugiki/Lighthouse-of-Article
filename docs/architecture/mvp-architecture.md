# Lighthouse of Article MVP アーキテクチャ

- ステータス: Accepted
- 作成日: 2026-08-31
- 対象: MVP
- 関連ADR: [ADR-0001](../adr/0001-mvp-scope-and-supabase.md)

## 1. アーキテクチャ概要

Next.jsを中心に、画面表示とサーバー側APIを同一アプリケーションで管理する。

```text
Browser
  │
  ▼
Next.js UI（React / TypeScript / Tailwind CSS）
  │
  ├── Next.js Route Handlers
  │      ├── arXiv API
  │      ├── Supabase PostgreSQL
  │      └── 要約AI API
  │
  └── Supabase PostgreSQL
```

## 2. 採用技術

| 項目 | 採用技術 |
|---|---|
| フロントエンド | Next.js / React |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| バックエンド | Next.js Route Handlers |
| データベース | Supabase PostgreSQL |
| Supabase接続 | `@supabase/supabase-js` |
| 開発環境 | ローカルNext.jsサーバー |
| 将来のデプロイ候補 | Vercel |

## 3. 責務分離

### ブラウザ側

- 画面の表示
- キーワード入力
- 検索結果と保存論文の表示
- ページネーション
- 保存アイコン操作
- ローディング・トースト通知

### Next.jsサーバー側

- arXiv APIへのリクエスト
- Supabaseへのデータ保存・取得・削除
- 要約AI APIの呼び出し
- 外部APIのエラー処理
- 秘密情報の保護
- 入力値の検証

arXiv APIと要約AI APIは、APIキーやレート制御、エラー処理をアプリ側で管理するため、ブラウザから直接呼び出さない。

## 4. 環境変数

ローカル開発では `.env.local` を使用する。`.env.local` はGitにコミットしない。

`.env.example` に以下の変数名を記載する。

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
```

方針：

- `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` はSupabase接続に使用する
- `OPENAI_API_KEY` はサーバー側でのみ使用する
- Supabase Service Role Keyはブラウザへ公開しない
- 本番環境ではデプロイ先のシークレット管理機能を使用する

## 5. データモデル

### papers

論文メタデータと保存状態を管理する。

- `id`: アプリ内部のUUID
- `arxiv_id`: arXiv論文ID、一意
- `title`: 論文タイトル
- `authors`: 著者一覧、JSONB
- `abstract`: abstract全文
- `published_at`: arXiv公開日時
- `categories`: arXivカテゴリ一覧、配列
- `arxiv_url`: arXiv URL
- `saved_at`: アプリに保存した日時
- `updated_at`: 更新日時

### summaries

論文ごとの要約結果を管理する。

- `id`: 要約ID
- `paper_id`: papersへの外部キー
- `summary_text`: 構造化された要約本文
- `model`: 使用したAIモデル
- `status`: 要約状態
- `generated_at`: 要約生成日時
- `created_at`: 作成日時
- `updated_at`: 更新日時

MVPでは、1論文につき要約を1件だけ保持する。将来、要約履歴や複数ユーザーの要約が必要になった場合は別途拡張する。

## 6. API構成

```text
GET    /api/papers/search?q={keyword}&page={page}
GET    /api/papers
GET    /api/papers/{arxivId}
POST   /api/papers
DELETE /api/papers/{arxivId}
GET    /api/papers/{arxivId}/summary
POST   /api/papers/{arxivId}/summary
```

検索結果と保存済み論文のページサイズは20件とする。

## 7. セキュリティ方針

- APIキーをクライアントへ渡さない
- `.env.local` をGit管理しない
- SQLを文字列連結で組み立てない
- arXiv論文IDやページ番号をサーバー側で検証する
- 要約対象の文字数と実行回数を制御する
- 技術的なエラー詳細をユーザー画面に表示しない
- 公開サービス化する前にSupabase AuthとRow Level Securityを導入する

## 8. 将来のチーム利用

MVPでは認証なしの個人利用とする。チーム利用へ拡張する際は、論文自体と「誰が保存したか」を分離する。

```text
users
  │
  ├── saved_papers ── papers
  └── workspaces ── workspace_members
                         │
                         └── shared_papers
```

MVPの単純なデータモデルを維持しつつ、将来の拡張時に段階的に移行する。

## 9. 非機能上の前提

- 個人利用を前提とした小規模なアクセス量
- PDFを保存しない
- Supabase無料プランの範囲で開発・検証する
- 大規模アクセス、常時稼働、厳密な可用性はMVPの対象外

## 10. M2時点の決定事項

- Next.js + TypeScript + Reactを採用する
- Tailwind CSSを採用する
- Next.js Route Handlersをバックエンドにする
- Supabase PostgreSQLを採用する
- `papers` と `summaries` の2テーブルから開始する
- `papers.arxiv_id` に一意制約を付ける
- arXiv APIと要約AI APIはサーバー側から呼び出す
- PDFは保存しない
- SQLマイグレーションでスキーマを管理する
- 開発はローカルから開始する
- デプロイはMVP実装後に検討する
