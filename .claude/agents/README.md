# Nekomews AIエージェント — Phase 0 実装

**Status**: Phase 0 実装（7体のうち7体完了）
**Last Updated**: 2026-04-21

## 📂 エージェント一覧（Phase 0）

| ID | ファイル | 役割 | 依存 |
|---|---|---|---|
| 00 | `00-master-orchestrator.md` | 全体統括・DAG管理・ゲート判定 | なし |
| 01 | `01-market-research.md` | 日本ペット市場・猫統計・保険市場調査 | なし |
| 02 | `02-competitor-analysis.md` | 競合UX/料金/機能分析・SWOT | なし |
| 04 | `04-legal-research.md` | 法務・規制・商標チェック | なし |
| 06 | `06-product-manager.md` | PRD作成・MVPスコープ・ロードマップ | 01, 02, 04 |
| 07 | `07-requirements.md` | 要件定義書・FR/NFR付番・トレース | 06 |
| 28 | `28-integrated-review.md` | L5レビュー集約・ゲート判定 | 対象成果物 |

## 🚀 起動方法

### 方法A：Master Orchestrator 経由（推奨）
Claude Code でこのディレクトリを開き：
```
Nekomews プロジェクトの Discover 層を走らせて、要件定義 v0.2 までドラフトして
```

→ 00-master-orchestrator が自動で 01 → 02 → 04 → 06 → 07 → 28 の順に起動。

### 方法B：個別エージェント起動
Claude Code の Task ツールで直接指定：
```
01-market-research を起動して、日本の猫関連市場レポートを作成
```

## 📁 成果物の保存場所

```
artifacts/
  market-research/
    v1.md
    v2.md  ← 改訂版
  competitor-analysis/
    v1.md
  legal-research/
    v1.md
  prd/
    v1.md
  requirements/
    v1.md
  reviews/
    integrated/
      prd_v1.md
```

## 🔁 リフレクションループ

```
作成エージェント → 成果物 v1 保存
    ↓
28-integrated-review が採点
    ↓
    ┌──────────────┬──────────────┬──────────────┐
    ▼              ▼              ▼              ▼
  ≥85           70-84          50-69           <50
  PASS      CONDITIONAL      REWORK          ESCALATE
                PASS             ↓              ↓
                             v2作成         人間確認
                                ↓
                             再採点
                                ↓
                            PASS or 最大3周で打ち切り
```

## 🎯 Phase 0 の成功基準

- [ ] 01/02/04 の成果物が揃う（並列実行可）
- [ ] 06 PRD v1 が生成され、スコア 70 以上
- [ ] 07 要件定義 v0.2 が生成され、スコア 70 以上
- [ ] G1 ゲート通過（人間承認）
- [ ] ここまでを2〜4時間で完了

## ⚠️ 既知の制約

1. **L5 の サブレビュアー未実装**（25 PASONA / 26 規制 / 27 UX）
   - Phase 1 で追加予定
   - それまでは 28 が単独で総合採点

2. **一部のエージェントは Web検索に依存**
   - 01 市場調査は WebSearch/WebFetch 必須
   - 04 法務も J-PlatPat 等の検索必須
   - ネット環境要

3. **artifacts/ の容量管理**
   - 各バージョン保存でディスク消費
   - Phase 1 で v3 以降は自動圧縮予定

## 📝 次の実装フェーズ

### Phase 1（残り21体）
- L2 Design層：08 UX / 09 UI / 10 Sys / 11 DB / 12 API / 13 Sec
- L3 Build層：14 FE / 15 BE / 16 DevOps / 17 QA / 18 Data
- L5 Review層：25 PASONA / 26 規制 / 27 UX
- L1 補完：03 N1 / 05 Trend

### Phase 2 + Marketing（6体）
- L4 Marketing：19 戦略 / 20 コピー / 21 コンテンツ / 22 ASO・SEO / 23 AEO / 24 広告 / 25 グロース / 26 インフルエンサー / 27 ローンチキャンペーン

## 🧪 最初のテスト実行

### コマンド例
```bash
cd /Users/yukitaka.tokugawa/Documents/徳川綱吉/nekomews
claude
```

Claude Code内で：
```
Nekomews プロジェクトの市場調査と競合分析を並列で走らせてください
```

→ 01 と 02 が自動起動、成果物が `artifacts/` に生成される想定。

## 📚 関連ドキュメント

- `../../docs/05_agent_instructions.md` — 31体全体の指示書（上位設計）
- `../../docs/01_requirements.md` — 要件定義 v0.1（エージェントの参照ベース）
- `../../docs/06_brand_guideline.md` — ブランドガイドライン

---

**注意**: 本実装は Phase 0 の最小構成です。本番運用前に以下を検討：
- エラーハンドリングの強化
- コスト上限（月額）の設定
- 人間承認ポイントの自動通知（Slack等）
- 監査ログの保存
