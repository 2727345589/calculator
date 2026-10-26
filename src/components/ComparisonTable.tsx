import { ArrowDownRight, ArrowLeftRight, Crown, Minus } from "lucide-react";
import type { LoanAnalysis, StrategyResult } from "../lib/loan";
import { formatMoney, formatWan } from "../lib/format";
import {
  formatChineseDate,
  getPaymentDate,
} from "../lib/date";

interface ComparisonTableProps {
  analysis: LoanAnalysis;
  recommended: StrategyResult;
  nextPaymentDate: string;
}

function getFirstBreakdown(strategy: StrategyResult) {
  return strategy.firstPayment;
}

function getLastMonthlyPayment(strategy: StrategyResult): number {
  const payments = strategy.schedule.filter((row) => row.kind === "payment");
  return payments[payments.length - 1]?.payment ?? 0;
}

export function ComparisonTable({
  analysis,
  recommended,
  nextPaymentDate,
}: ComparisonTableProps) {
  const hasPrepayment = analysis.input.effectivePrepay > 0.01;
  const recommendedKey = hasPrepayment ? recommended.key : "none";
  const strategies = [
    analysis.baseline,
    analysis.reducePayment,
    analysis.reduceTerm,
  ];

  return (
    <section className="card comparison-card">
      <div className="card-heading-row">
        <div>
          <span className="section-kicker">全维度对比</span>
          <h2>同一笔钱，三种结果</h2>
        </div>
        <div className="comparison-note">
          <Crown size={14} />
          {hasPrepayment
            ? `按「${recommended.label}」偏好推荐`
            : "填入金额后生成推荐"}
        </div>
      </div>

      <div className="table-scroll-hint">
        <ArrowLeftRight size={13} />
        左右滑动，对比三种方案
      </div>

      <div className="table-scroll">
        <table className="comparison-table" data-recommended={recommendedKey}>
          <thead>
            <tr>
              <th>对比项目</th>
              {strategies.map((strategy) => (
                <th
                  key={strategy.key}
                  className={
                    recommendedKey === strategy.key
                      ? "is-recommended"
                      : strategy.key === "baseline"
                        ? "is-baseline"
                        : ""
                  }
                >
                  <span>{strategy.label}</span>
                  {recommendedKey === strategy.key ? (
                    <em>
                      <Crown size={11} />
                      推荐
                    </em>
                  ) : null}
                  {strategy.key === "baseline" ? <em>基准</em> : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>新月供</th>
              {strategies.map((strategy) => (
                <td key={strategy.key}>
                  {strategy.isPaidOffAtPrepayment ? (
                    <span className="cell-muted">已结清</span>
                  ) : strategy.key === "baseline" ? (
                    formatMoney(strategy.monthlyPayment, 2)
                  ) : (
                    formatMoney(strategy.monthlyPayment, 2)
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <th>月供变化</th>
              {strategies.map((strategy) => (
                <td key={strategy.key}>
                  {strategy.key === "baseline" ? (
                    <span className="cell-muted">
                      <Minus size={13} /> 基准
                    </span>
                  ) : strategy.isPaidOffAtPrepayment ? (
                    <span className="cell-good">无需再还</span>
                  ) : strategy.monthlySavings > 0.01 ? (
                    <span className="cell-good">
                      <ArrowDownRight size={13} />
                      {formatMoney(strategy.monthlySavings, 2)}
                    </span>
                  ) : (
                    <span className="cell-muted">月供不变</span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <th>首期月供本金</th>
              {strategies.map((strategy) => {
                const breakdown = getFirstBreakdown(strategy);
                return (
                  <td key={strategy.key}>
                    {breakdown
                      ? formatMoney(breakdown.principal, 2)
                      : "—"}
                  </td>
                );
              })}
            </tr>
            <tr>
              <th>首期月供利息</th>
              {strategies.map((strategy) => {
                const breakdown = getFirstBreakdown(strategy);
                return (
                  <td key={strategy.key}>
                    {breakdown ? formatMoney(breakdown.interest, 2) : "—"}
                  </td>
                );
              })}
            </tr>
            <tr>
              <th>剩余期数</th>
              {strategies.map((strategy) => (
                <td key={strategy.key}>
                  {strategy.totalMonths} 期
                  {strategy.monthsSaved > 0 ? (
                    <span className="cell-sub">
                      提前 {strategy.monthsSaved} 期
                    </span>
                  ) : null}
                </td>
              ))}
            </tr>
            <tr>
              <th>预计结清日期</th>
              {strategies.map((strategy) => {
                const payoffDate = strategy.isPaidOffAtPrepayment
                  ? new Date()
                  : getPaymentDate(nextPaymentDate, strategy.totalMonths);
                return (
                  <td key={strategy.key}>
                    {strategy.isPaidOffAtPrepayment
                      ? "即时结清"
                      : formatChineseDate(payoffDate)}
                    <span className="cell-sub">
                      {strategy.key === "baseline"
                        ? "原计划"
                        : `${strategy.totalMonths}期`}
                    </span>
                  </td>
                );
              })}
            </tr>
            <tr>
              <th>总利息</th>
              {strategies.map((strategy) => (
                <td key={strategy.key} className="cell-strong">
                  {formatWan(strategy.totalInterest)}
                </td>
              ))}
            </tr>
            <tr>
              <th>节省利息</th>
              {strategies.map((strategy) => (
                <td key={strategy.key}>
                  {strategy.key === "baseline" ? (
                    <span className="cell-muted">—</span>
                  ) : (
                    <span className="cell-good">
                      {formatWan(strategy.interestSaved)}
                    </span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <th>总还款额</th>
              {strategies.map((strategy) => (
                <td key={strategy.key} className="cell-strong">
                  {formatWan(strategy.totalPaid)}
                </td>
              ))}
            </tr>
            <tr>
              <th>最后一期月供</th>
              {strategies.map((strategy) => (
                <td key={strategy.key}>
                  {strategy.isPaidOffAtPrepayment
                    ? "—"
                    : formatMoney(getLastMonthlyPayment(strategy), 2)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="table-footnote">
        总还款额已包含提前还款本金；日期按下一期还款日逐月顺延测算，遇月末取当月最后一天。缩短年限方案按月供不变、末期金额微调测算。
      </p>
    </section>
  );
}
