import {
  CalendarDays,
  Check,
  Gauge,
  Landmark,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import type { LoanAnalysis, StrategyResult } from "../lib/loan";
import {
  formatMonths,
  formatMoney,
  formatNumber,
  formatWan,
} from "../lib/format";
import { formatYearMonth, getPaymentDate } from "../lib/date";

interface ScenarioCardsProps {
  analysis: LoanAnalysis;
  recommended: StrategyResult;
  nextPaymentDate: string;
}

const cardIcons = {
  baseline: Landmark,
  reducePayment: Gauge,
  reduceTerm: CalendarDays,
};

const cardIndex = {
  baseline: "方案 A",
  reducePayment: "方案 B",
  reduceTerm: "方案 C",
};

export function ScenarioCards({ analysis, recommended, nextPaymentDate }: ScenarioCardsProps) {
  const strategies = [
    analysis.baseline,
    analysis.reducePayment,
    analysis.reduceTerm,
  ];
  const hasPrepayment = analysis.input.effectivePrepay > 0.01;
  const isEqualPrincipal = analysis.repaymentMethod === "equalPrincipal";

  return (
    <div className="scenario-grid">
      {strategies.map((strategy) => {
        const isBaseline = strategy.key === "baseline";
        const isRecommended =
          recommended.key === strategy.key && !isBaseline && hasPrepayment;
        const Icon = cardIcons[strategy.key];
        const breakdown = strategy.firstPayment;
        const payoffDate = strategy.isPaidOffAtPrepayment
          ? null
          : getPaymentDate(nextPaymentDate, strategy.totalMonths);

        let delta = `原计划 ${formatYearMonth(payoffDate)}结清`;
        if (!isBaseline && hasPrepayment) {
          if (strategy.isPaidOffAtPrepayment) {
            delta = "提前还款后直接结清";
          } else if (strategy.key === "reducePayment") {
            delta = `${
              isEqualPrincipal ? "首月月供" : "较当前月供"
            } ↓ ${formatMoney(strategy.monthlySavings, 2)} / 月`;
          } else {
            delta = `${
              isEqualPrincipal ? "每月本金不变" : "月供不变"
            } · 提前 ${formatMonths(strategy.monthsSaved)}结清`;
          }
        }

        return (
          <article
            key={strategy.key}
            className={`scenario-card ${
              isRecommended ? "scenario-card--recommended" : ""
            } ${isBaseline ? "scenario-card--baseline" : ""}`}
          >
            <div className="scenario-head">
              <span className="scenario-icon">
                <Icon size={19} strokeWidth={1.8} />
              </span>
              <div className="scenario-title">
                <span>{cardIndex[strategy.key]}</span>
                <h3>{strategy.label}</h3>
              </div>
              {isRecommended ? (
                <span className="recommended-chip">
                  <Sparkles size={12} />
                  推荐
                </span>
              ) : isBaseline ? (
                <span className="baseline-chip">基准</span>
              ) : null}
            </div>
            <p className="scenario-description">{strategy.description}</p>

            <div className="scenario-main">
              <span className="scenario-main__label">
                {isBaseline
                  ? isEqualPrincipal
                    ? "当前首月月供"
                    : "当前月供"
                  : strategy.isPaidOffAtPrepayment
                    ? "贷款状态"
                    : isEqualPrincipal
                      ? "新首月月供"
                      : "新月供"}
              </span>
              <div className="scenario-amount">
                {strategy.isPaidOffAtPrepayment ? (
                  <span className="paid-off-text">
                    <Check size={20} /> 已结清
                  </span>
                ) : (
                  <>
                    {formatMoney(strategy.monthlyPayment, 2)}
                    <small>/月</small>
                  </>
                )}
              </div>
              <p className="scenario-delta">
                {strategy.key === "reduceTerm" &&
                !isBaseline &&
                !strategy.isPaidOffAtPrepayment ? (
                  <TrendingDown size={13} />
                ) : null}
                {delta}
              </p>
              {isEqualPrincipal && !strategy.isPaidOffAtPrepayment ? (
                <p className="scenario-decreasing">
                  首月最高 · 每月递减 {formatMoney(strategy.monthlyDecrease, 2)}
                </p>
              ) : null}
            </div>

            <div className="scenario-metrics">
              <div>
                <span>剩余总利息</span>
                <strong>{formatWan(strategy.totalInterest)}</strong>
              </div>
              <div>
                <span>节省利息</span>
                <strong className={!isBaseline ? "is-savings" : ""}>
                  {isBaseline ? "—" : formatWan(strategy.interestSaved)}
                </strong>
              </div>
              <div>
                <span>剩余还款期数</span>
                <strong>{strategy.totalMonths} 期</strong>
                <small className="metric-sub">
                  {strategy.isPaidOffAtPrepayment
                    ? "即时结清"
                    : formatYearMonth(payoffDate)}
                </small>
              </div>
              <div>
                <span>提前还清</span>
                <strong>
                  {strategy.monthsSaved > 0
                    ? `${formatMonths(strategy.monthsSaved)}`
                    : "—"}
                </strong>
              </div>
            </div>

            <div className="scenario-breakdown">
              <div className="breakdown-head">
                <span>
                  {isBaseline ? "下期月供构成" : "提前还款后首期"}
                </span>
                {breakdown ? (
                  <span>
                    利息占比{" "}
                    {formatNumber((1 - breakdown.principalRatio) * 100, 1)}%
                  </span>
                ) : null}
              </div>
              {breakdown ? (
                <>
                  <div className="breakdown-bar">
                    <span
                      className="breakdown-bar__principal"
                      style={{ width: `${breakdown.principalRatio * 100}%` }}
                    />
                    <span className="breakdown-bar__interest" />
                  </div>
                  <div className="breakdown-legend">
                    <span>
                      <i className="dot dot--principal" />
                      本金 {formatMoney(breakdown.principal)}
                    </span>
                    <span>
                      <i className="dot dot--interest" />
                      利息 {formatMoney(breakdown.interest)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="breakdown-empty">无需继续还款</div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
