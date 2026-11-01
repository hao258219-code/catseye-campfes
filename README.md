# キャッツアイ キャンプフェス 2026（お客様向けページ）

公開URL：https://hao258219-code.github.io/catseye-campfes/

## しくみ
- このリポジトリ（GitHub Pages）：LP `index.html` と申込画面 `apply.html`、画像・動画（`assets/`）
- 申込の保存・運営管理画面・DB：`hao258219-code/catseye-campfes-server`（Cloudflare Workers + D1）
  - 申込画面は `apply.js` の `API` にあるサーバーの `/api/register` へ送信する。
  - 運営画面は運営メンバーだけがブックマークで開く（このページからはリンクしない）。
  - オートキャンプ参加者向けオープンチャットは `apply.js` の `OPENCHAT_URL` に招待URLを入れると表示される。

## 料金を変えるとき
`pricing.json` は申込画面の表示用。サーバー側の計算は Sites の `pricing.json` を使うので、両方（このリポジトリとサーバー側の `public-site/pricing.json`）を同じ値にそろえる。LPの料金表示（`index.html`）も合わせて直す。
