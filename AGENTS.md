<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 開発ルール

## Issue・サブIssue・Project

- 実装、調査、検証などの作業は、関連するGitHub Issueで管理する。
- 複数の独立した成果物がある場合は、親IssueとサブIssueに分ける。
- Issueには「次に行うこと」と「完了条件」を記載する。
- Issue作成時は、作業内容に合う標準トリアージラベルと`domain:life`を付け、担当者を設定する。
- IssueはProject LIFEで管理し、新規Issueの初期状態は`Inbox`とする。
- 完了時は成果物と検証結果をIssueへ記録し、Issueをクローズする。
- 認証情報、個人情報、機密情報はIssueやProjectへ記載しない。

## ブランチ・PR・コミット

- `main`は動作確認済みの状態に保つ。
- `main`への直接コミットは禁止し、作業単位でブランチを作成してPR経由で変更を取り込む。
- ブランチ名は作業種別と内容を表す形式にする。
  - `feat/<内容>`
  - `fix/<内容>`
  - `docs/<内容>`
  - `chore/<内容>`
- コミットメッセージはConventional Commits v1.0.0に従い、`<type>[optional scope]: <description>`の形式にする。
- 1コミット1目的を基本にする。
- PRには関連Issue、変更履歴、検証結果を記載する。
- ユーザーのレビュー完了後にマージする。
- マージ後は不要な作業ブランチを削除する。

## lint・test・build

- PR作成前に`npm run lint`、`npm run test`、`npm run build`を実行する。
- 3つのコマンドがすべて成功した状態でPRを作成する。
- 機能追加やバグ修正では、必要なテストを追加または更新する。
- 検証に失敗した場合は、原因と対応状況をPRへ記載する。
- 検証を実行できない場合は、実行できない理由をPRへ記載する。

## 環境変数・秘密情報

- 秘密情報は`.env.local`などのローカル環境変数で管理し、Gitへコミットしない。
- `.env.example`には変数名と安全な例だけを記載し、実際の認証情報は記載しない。
- `NEXT_PUBLIC_`を付ける環境変数には秘密情報を設定しない。
- サーバー専用の秘密情報はサーバー側の処理からのみ利用する。
- APIキー、Token、パスワードはIssue、PR、チャット、ログへ記載しない。
- 秘密情報の公開が判明した場合は、直ちに無効化して再発行する。

## Next.js実装

- コードを書く前に、現在のNext.jsバージョンに対応する`node_modules/next/dist/docs/`の関連ガイドを確認する。
- App Routerを使用し、ルートの責務は`page.tsx`や`layout.tsx`に限定する。
- Server Componentを基本とし、状態管理、イベント処理、ブラウザAPIが必要な場合だけ`"use client"`を使用する。
- 機能ごとのコンポーネントやロジックは`src/components`、`src/lib`などへ分離する。
- ページ固有のスタイルにはCSS Modulesを使用する。
- ページタイトルやメタデータはNext.jsのMetadata APIで管理する。
- TypeScriptの型を定義し、安易な`any`を使用しない。
- UIを変更したときは、PC・スマートフォン表示と主要な状態を確認する。
