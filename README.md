<div align="center">
  <img src="./public/readme-banner.png" alt="灯台の光が論文カードを照らす研究航海図" width="100%" />
  <h1><em>論文の灯台</em></h1>
  <p><code>LIGHTHOUSE OF ARTICLE</code></p>
  <p>arXivの論文をキーワードで検索し、興味のある論文を保存・要約するためのWebアプリケーションです。</p>
  <p><strong>個人利用を想定したMVPとして開発しています。</strong></p>
</div>

## 現在の実装状況

M6「abstract要約機能」まで実装・PRマージ済みで、現在はM7「MVP検証と振り返り」を進めています。

タスクは[GitHub LIFE Project](https://github.com/users/KotaSugiki/projects/1)で管理しています。親Issueは[LIFE #86](https://github.com/KotaSugiki/LIFE/issues/86)、現在の作業は[LIFE #96](https://github.com/KotaSugiki/LIFE/issues/96)です。

### 実装済み

- Next.jsによるアプリケーション基盤
- 共通レイアウト
- PC・スマートフォン向けサイドバー
- 紺・水色・黄色を基調とした画面テーマ
- Supabase PostgreSQLとの接続確認
- arXiv APIクライアント
- arXiv Atom XMLレスポンスのパーサー
- arXivクライアントとパーサーのテスト
- キーワード検索、検索結果の20件表示、ページ移動
- 検索失敗時の再試行、代替接続先への切替、キャッシュ
- 論文の保存・保存解除、重複防止、保存済み状態の表示
- 保存論文一覧、保存日時の新しい順での表示、ページ移動
- 読み込み中・0件・通信エラー・操作結果の通知
- 保存済み論文の詳細表示、abstract全文表示、保存論文一覧への戻る導線
- 詳細画面からの保存解除、解除後の航海イラスト付き状態表示
- abstractの構造化された日本語要約の生成、保存、再表示、失敗時の再試行
- 要約のpending・processing・completed・failed状態の表示と二重実行防止

### 開発中・未実装

- MVP全体の動作確認と振り返り（M7進行中）

## 主な機能

MVPでは、以下の機能を提供する予定です。

- arXiv論文のキーワード検索
- 検索結果のページネーション
- 論文の保存・保存解除
- 保存論文一覧の表示
- 論文タイトル、著者、公開日、カテゴリ、abstractの確認
- arXivサイトへのリンク
- abstractを利用したAI要約
- 要約結果の保存・再表示

## 技術スタック

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- arXiv API
- OpenAI API（要約機能で使用）
- Vitest

## 必要な環境

- Node.js
- npm
- Supabaseプロジェクト
- OpenAI APIキー（要約機能を実装する場合）

環境変数は`.env.local`に設定します。

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
SUMMARY_MAX_ABSTRACT_CHARACTERS=12000
```

`.env.local`には秘密情報が含まれるため、Gitへコミットしないでください。

## セットアップ

依存パッケージをインストールします。

```bash
npm install
```

`.env.example`をコピーして、`.env.local`を作成します。Windowsでは、ファイルをコピーして作成してください。

```bash
cp .env.example .env.local
```

`.env.local`にSupabaseの接続情報を設定します。

Supabaseのマイグレーションを適用した後、開発サーバーを起動します。

```bash
npm run dev
```

ブラウザで以下を開きます。

http://localhost:3000

## 開発用コマンド

```bash
# 開発サーバーを起動
npm run dev

# テストを実行
npm run test

# ESLintを実行
npm run lint

# 本番ビルドを確認
npm run build

# 本番モードで起動
npm run start
```

## データベース

Supabase PostgreSQLを使用します。

MVPでは以下のテーブルを使用します。

- `papers`: 論文メタデータと保存状態
- `summaries`: 論文の要約結果

データベースのスキーマは、以下のSQLマイグレーションで管理します。

- `supabase/migrations/0001_initial_schema.sql`
- `supabase/migrations/0002_papers_rls.sql`
- `supabase/migrations/0003_summaries_m6.sql`

現在の行ごとのアクセス制御（RLS）は、認証なしの個人利用向けに論文の読み取り・追加・削除を許可します。利用者ごとのデータ分離は行いません。認証とアクセス制御を整備するまでは公開サービスとして運用しないでください。

## ヘルスチェック

Supabaseへの接続確認用エンドポイントを提供しています。

```text
GET /api/health/supabase
```

接続に成功すると、以下のレスポンスを返します。

```json
{
  "ok": true
}
```

## MVPの対象外

以下はMVPでは扱いません。

- ユーザー認証
- チーム機能・論文共有
- PDFのアプリ内表示
- PDFの保存
- 論文本文全体の取得
- コメント、メモ、タグ付け
- 論文情報の編集

## ドキュメント

- [ドキュメント一覧](docs/README.md)
- [MVPアーキテクチャ](docs/architecture/mvp-architecture.md)
- [MVP画面仕様書](docs/specs/mvp-screen-spec.md)
- [MVPワイヤーフレーム](docs/specs/mvp-wireframes.md)
- [開発マイルストーン・Todo](docs/project/milestones-and-todo.md)
- [ADR-0001: MVPの対象範囲とSupabaseの採用](docs/adr/0001-mvp-scope-and-supabase.md)

## 今後の開発予定

1. MVP検証（M7）
2. デプロイ方法の検討
