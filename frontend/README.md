# frontend
## 環境構築

node.jsバージョン: v20.18.1
```
# パッケージインストール
npm i
# 開発サーバ起動
npm run dev
# ビルド
npm run build
# ビルドサーバ起動
npm start
```

```
├ src
│ ├ app // Next.jsのルーティング
│ ├ components // コンポーネント
│ │ ├ features // 特定の機能を実現するコンポーネント
│ │ │ ├ sample // サンプルコンポーネント
│ │ │ │ ├ hooks // サンプルコンポーネントのみで使用するhook(不要な場合もある)
│ │ │ │ ├ logics // サンプルコンポーネントのみで使用するロジック(不要な場合もある)
│ │ │ │ ├ tests // テスト専用
│ │ │ │ ├ index.tsx // エントリーポイント
│ │ ├ functions // UIとして表示されないコンポーネント
│ │ ├ ui // UIコンポーネント, shadcn/uiは全てここに入る
│ ├ constants // 全体に共通の定数ファイルを配置する
│ ├ libs // ライブラリのラッパーや使いまわしやすいようにする
│ ├ types // 全体に共通の型定義ファイルを配置する
│ ├ usecases // 共通で使い回すhooks
│ ├ utils // 使い回すロジックなど
```