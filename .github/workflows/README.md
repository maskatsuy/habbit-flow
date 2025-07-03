# GitHub Actions CI/CD

このディレクトリには、プロジェクトの継続的インテグレーション（CI）と継続的デプロイメント（CD）のワークフローが含まれています。

## ワークフロー

### ci.yml
メインのCIワークフロー。以下のジョブを並列で実行します：

- **Setup**: 依存関係のインストールとキャッシュ
- **Type Check**: TypeScriptの型チェック
- **Lint**: ESLintによるコード品質チェック
- **Format Check**: Prettierによるコードフォーマットチェック
- **Test**: Vitestによる単体テストの実行
- **Coverage**: テストカバレッジの計測
- **Build**: プロダクションビルドの確認
- **Security**: npmの脆弱性監査

### dependency-review.yml
PRで依存関係の変更をレビューし、セキュリティリスクをチェックします。

## ローカルでのテスト

CIをローカルで実行するには：

```bash
# すべてのチェックを実行
npm run ci

# 個別のチェック
npm run type-check    # 型チェック
npm run lint         # Lintチェック
npm run format:check # フォーマットチェック
npm run test:ci      # テスト実行
npm run build        # ビルド
```

## ブランチ保護ルール

`main`ブランチには以下の保護ルールが適用されます：

- PR必須
- ステータスチェックの成功が必須
  - Type Check
  - Lint
  - Format Check
  - Test
  - Build
- レビュー承認が1つ以上必要

## トラブルシューティング

### フォーマットエラーの修正
```bash
npm run format
```

### Lintエラーの修正
```bash
npm run lint:fix
```

### 依存関係の脆弱性
```bash
npm audit fix
```

## 既知の問題と改善計画

### ESLintエラー
現在、レガシーコードに起因するLintエラーが存在します。以下の方針で改善を進めています：

1. **新規コード**: 必ずLintエラーがない状態でコミット
2. **既存コード**: 段階的に修正
3. **CI設定**: 現在は`continue-on-error: true`で警告扱い

改善タスク：
- [ ] 未使用変数の削除
- [ ] `any`型の適切な型定義への置換
- [ ] React Hooksルールの遵守
- [ ] テストファイルの除外設定の改善

### 修正方法
```bash
# 自動修正可能なエラーを修正
npm run lint:fix

# 手動修正が必要なエラーを確認
npm run lint
```