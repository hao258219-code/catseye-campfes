# キャッツアイ キャンプフェス 2026（お客様向けページ）

公開URL：https://hao258219-code.github.io/catseye-campfes/

## しくみ
- このリポジトリ（GitHub Pages）：LP `index.html` と申込画面 `apply.html`、画像・動画（`assets/`）
- 申込の保存・運営管理画面・DB：今までの Sites（`https://catseye-campfes-2026-ember.hao258219.chatgpt.site`）
  - 申込画面は `apply.js` の `API` にある、このサーバーの `/api/register` へ送信する。
  - 運営画面は運営メンバーだけがブックマークで開く（このページからはリンクしない）。
  - Sites側では `/api/register` だけ GitHub Pages からの送信を受け付ける。旧URLの `/` と `/apply` は、このページへ転送している。

## 料金を変えるとき
`pricing.json` は申込画面の表示用。サーバー側の計算は Sites の `pricing.json` を使うので、両方を同じ値にそろえる。LPの料金表示（`index.html`）も合わせて直す。
