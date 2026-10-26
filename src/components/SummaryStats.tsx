import {
  CalendarRange,
  Landmark,
  PiggyBank,
  TrendingDown,
  Wallet,
} from "lucide-react";
import type { LoanAnalysis, StrategyResult } from "../lib/loan";
import { formatMoney, formatWan } from "../lib/format";
import {
  formatChineseDate,
  formatShortDate,
  formatYearMonth,
  getPaymentDate,
} from "../lib/date";

interface SummaryStatsProps {
  analysis: LoanAnalysis;
  recommended: StrategyResult;
  nextPaymentDate: string;
}

export function SummaryStats({
  analysis,
  recommended,
  nextPaymentDate,
}: SummaryStatsProps) {
  const hasPrepayment = analysis.input.effectivePrepay > 0.01;
  const bestSaving =
    analysis.reduceTerm.interestSaved >= analysis.reducePayment.interestSaved
      ? analysis.reduceTerm
      : analysis.reducePayment;

  const remainingYears = (analysis.input.remainingMonths / 12).toFixed(1);
  const nextDate = getPaymentDate(nextPaymentDate, 1);
  const originalPayoffDate = getPaymentDate(
    nextPaymentDate,
    analysis.baseline.totalMonths,
  );
  const isEqualPrincipal = analysis.repaymentMethod === "equalPrincipal";

  return (
    <section className="stat-grid" aria-label="贷款概览">
      <article className="stat-card">
        <div className="stat-card__top">
          <span>{isEqualPrincipal ? "当前首月月供" : "当前月供"}</span>
          <span className="stat-icon stat-icon--green">
            <Wallet size={16} />
          </span>
        </div>
        <div className="stat-value">
          <span className="stat-currency">¥</span>
          {formatMoney(analysis.currentMonthlyPayment, 2, false)}
        </div>
        <p className="stat-foot">
          {isEqualPrincipal
            ? `下期 ${formatShortDate(nextDate)} · 每月递减 ${formatMoney(
                analysis.currentMonthlyDecrease,
                2,
              )}`
            : `下一期 ${formatChineseDate(nextDate)}`}
        </p>
      </article>

      <article className="stat-card">
        <div className="stat-card__top">
          <span>当前剩余本金</span>
          <span className="stat-icon stat-icon--sand">
            <Landmark size={16} />
          </span>
        </div>
        <div className="stat-value">
          {formatWan(analysis.balanceBeforePrepay).replace("万", "")}
          <span className="stat-unit">万</span>
        </div>
        <p className="stat-foot">
          约 {remainingYears} 年 · 原计划 {formatYearMonth(originalPayoffDate)}结清
        </p>
      </article>

      <article className="stat-card">
        <div className="stat-card__top">
          <span>原计划剩余总利息</span>
          <span className="stat-icon stat-icon--blue">
            <CalendarRange size={16} />
          </span>
        </div>
        <div className="stat-value">
          {formatWan(analysis.baseline.totalInterest).replace("万", "")}
          <span className="stat-unit">万</span>
        </div>
        <p className="stat-foot">
          不提前还，至 {formatYearMonth(originalPayoffDate)} 的总利息
        </p>
      </article>

      <article className="stat-card stat-card--highlight">
        <div className="stat-card__top">
          <span>最多可省利息</span>
          <span className="stat-icon stat-icon--copper">
            <TrendingDown size={16} />
          </span>
        </div>
        {hasPrepayment ? (
          <>
            <div className="stat-value">
              {formatWan(bestSaving.interestSaved).replace("万", "")}
              <span className="stat-unit">万</span>
            </div>
            <p className="stat-foot">
              <span className="mini-badge">
                <PiggyBank size={12} />
                {bestSaving.label}
              </span>
              {recommended.key === bestSaving.key
                ? " · 当前推荐"
                : " · 省息最多"}
            </p>
          </>
        ) : (
          <>
            <div className="stat-value stat-value--empty">—</div>
            <p className="stat-foot">填入提前还款金额后测算</p>
          </>
        )}
      </article>
    </section>
  );
}
