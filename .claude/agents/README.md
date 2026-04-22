# Nekomews AIエージェント — フル31体 実装完了

**Status**: Phase 0 + 全層フル実装（31体）
**Last Updated**: 2026-04-22

## 📂 全エージェント一覧

### L0 Orchestrator
| ID | ファイル | 役割 |
|---|---|---|
| 00 | `00-master-orchestrator.md` | 全体統括・DAG管理・ゲート判定 |

### L1 Discover（5体）
| ID | ファイル | 役割 |
|---|---|---|
| 01 | `01-market-research.md` | 日本ペット市場・猫統計調査 |
| 02 | `02-competitor-analysis.md` | 競合UX/料金/機能分析・SWOT |
| 03 | `03-n1-deepdive.md` | N1深掘りインタビュー・JTBD抽出 |
| 04 | `04-legal-research.md` | 法務・規制・商標チェック |
| 05 | `05-trend-listening.md` | SNSトレンド・炎上事例収集 |

### L2 Design（8体）
| ID | ファイル | 役割 |
|---|---|---|
| 06 | `06-product-manager.md` | PRD作成・MVPスコープ・ロードマップ |
| 07 | `07-requirements.md` | 要件定義書・FR/NFR付番・トレース |
| 08 | `08-ux-architect.md` | IA・フロー・ワイヤーフレーム |
| 09 | `09-ui-designer.md` | デザインシステム・トークン |
| 10 | `10-system-architect.md` | システム構成図・スケール戦略 |
| 11 | `11-db-designer.md` | ERD・DDL・RLS |
| 12 | `12-api-designer.md` | OpenAPI・認可・エラー体系 |
| 13 | `13-security-designer.md` | STRIDE脅威モデル |

### L3 Build（5体）
| ID | ファイル | 役割 |
|---|---|---|
| 14 | `14-frontend-implementer.md` | React Native / Expo 実装 |
| 15 | `15-backend-implementer.md` | Edge Function 実装 |
| 16 | `16-devops.md` | CI/CD・IaC |
| 17 | `17-qa-automation.md` | ユニット/E2Eテスト |
| 18 | `18-data-instrumentation.md` | 計測・PostHog |

### L4 Marketing（9体）
| ID | ファイル | 役割 |
|---|---|---|
| 19 | `19-marketing-strategy.md` | STP・4P・CAC/LTV |
| 20 | `20-copywriter.md` | PASONA・LP・広告コピー |
| 21 | `21-content-creator.md` | SNS・note・ブログ |
| 22 | `22-aso-seo.md` | App Store・検索最適化 |
| 23 | `23-aeo-specialist.md` | AI検索エンジン最適化 |
| 24 | `24-ad-planner.md` | 広告運用計画 |
| 25 | `25-growth-analyst.md` | ファネル・A/Bテスト |
| 26 | `26-influencer-pr.md` | インフルエンサーPR |
| 27 | `27-launch-campaign.md` | ローンチ拡散キャンペーン |

### L5 Review（4体）
| ID | ファイル | 役割 |
|---|---|---|
| 25r | `25r-pasona-reviewer.md` | コピー論理構造評価 |
| 26r | `26r-compliance-checker.md` | 法令準拠チェック |
| 27r | `27r-ux-heuristic.md` | Nielsen 10原則採点 |
| 28 | `28-integrated-review.md` | 統合採点・ゲート判定 |

---

## 🚀 起動方法

### 方法A：Master Orchestrator 経由（推奨）
```bash
cd /Users/yukitaka.tokugawa/Documents/徳川綱吉/nekomews
claude
```

Claude 内で：
```
Nekomewsの要件定義フェーズを走らせて、Design層の入力まで用意してください
```

### 方法B：個別起動（Task ツール経由）
```
Task(subagent_type: "market-research", prompt: "日本の猫飼育統計とシッティング市場を調査して")
```

## 📁 成果物の保存場所

```
artifacts/
  market-research/v{N}.md
  competitor-analysis/v{N}.md
  n1-deepdive/v{N}.md
  legal-research/v{N}.md
  trend-listening/v{N}.md
  prd/v{N}.md
  requirements/v{N}.md
  ux/v{N}.md
  ui/v{N}.md + tokens.json
  architecture/v{N}.md
  db/v{N}.md + migrations/*.sql
  api/openapi.yaml + v{N}.md
  security/v{N}.md
  marketing-strategy/v{N}.md
  copy/v{N}.md
  content/week-{N}.md
  aso/v{N}.md
  seo/v{N}.md
  aeo/v{N}.md + llms.txt + faq-schema.json
  ads/v{N}.md
  growth/weekly-{N}.md + experiments.md
  influencer/list.csv + email-template.md + kpi.md
  launch/campaign-proposals.md + press-release.md + timeline.md + kol-seed.md
  reviews/
    pasona/{task}_v{N}.json
    compliance/{task}_v{N}.json
    ux/{task}_v{N}.json
    integrated/{task}_v{N}.md
```

## 🔁 リフレクションループ

```
作成エージェント → v1 保存
    ↓
L5 Review 並列採点
    ↓
28 統合レビュー集約
    ↓
┌────────────────┬────────────────┐
≥85             70-84            <70
PASS         CONDITIONAL        REWORK
              PASS                 ↓
               ↓                v2作成
          軽微修正OK           最大3周
               ↓
           次レイヤーへ
```

## 🎯 ゲート

| ゲート | 通過条件 | 承認者 |
|---|---|---|
| G1: Discover→Design | L1成果物揃い + スコア≥70 | 人間 |
| G2: Design→Build | L2成果物揃い + スコア≥80 + セキュリティレビュー合格 | 人間 |
| G3: Build→Market | MVP完成 + E2E合格 + 計測実装 | 人間 |

## 📦 フェーズ別起動推奨

### Phase 0（すぐ起動 / 7体）
`01, 02, 04, 06, 07, 28`＋オーケストレーター

### Phase 1（MVP開発時 / +7体）
`09, 10, 11, 12, 13, 14, 15`

### Phase 2（本格開発 / +7体）
`16, 17, 18, 03, 25r, 26r, 27r`

### Phase 3（ローンチ前後 / +7体）
`19, 20, 21, 22, 23, 24, 25, 26, 27`

## ⚠️ 運用時の注意

1. 各エージェントは独立したコンテキストで動く（親コンテキストと共有しない）
2. 成果物は必ず artifacts/ に保存
3. 法務・セキュリティに関わる成果物は必ず 26r → 28 を通す
4. 予算（月額トークン消費）を Orchestrator で監視
5. リリース前は必ず G3 ゲートで人間承認

---

**31体の全構成が揃いました。**
次は Master Orchestrator を使って Phase 0 のタスクを実行できます。
