# Lighthouse of Article

arXivの論文をキーワードで検索し、興味のある論文を保存・要約するためのWebアプリケーションです。

個人利用を想定したMVPとして開発しています。

## 現在の実装状況

現在はM3「arXiv検索機能」の実装中です。

### 実装済み

- Next.jsによるアプリケーション基盤
- 共通レイアウト
- PC・スマートフォン向けサイドバー
- 黒・黄色・生成りを基調とした画面テーマ
- Supabase PostgreSQLとの接続確認
- arXiv APIクライアント
- arXiv Atom XMLレスポンスのパーサー
- arXivクライアントとパーサーのテスト

### 開発中・未実装

- arXiv検索画面の動作
- 検索結果の表示
- ページネーション
- 論文の保存
- 保存論文一覧
- 論文詳細画面
- abstractのAI要約

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
- OpenAI API（要約機能で使用予定）
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

1. arXiv検索機能
2. 論文保存機能
3. 保存論文一覧
4. 論文詳細画面
5. abstract要約機能
6. MVP検証
7. デプロイ方法の検討
