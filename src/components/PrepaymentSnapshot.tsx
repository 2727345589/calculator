import { ArrowDown, Landmark, Scissors } from "lucide-react";
import type { LoanAnalysis } from "../lib/loan";
import { formatMoney, formatNumber, formatWan } from "../lib/format";
import { formatShortDate, getPaymentDate } from "../lib/date";

interface PrepaymentSnapshotProps {
  analysis: LoanAnalysis;
  nextPaymentDate: string;
}

export function PrepaymentSnapshot({
  analysis,
  nextPaymentDate,
}: PrepaymentSnapshotProps) {
  const currentPrincipal = analysis.balanceBeforePrepay;
  const remainingPrincipal = analysis.balanceAfterPrepay;
  const prepayment = analysis.input.effectivePrepay;
  const retainedRatio =
    currentPrincipal > 0 ? remainingPrincipal / currentPrincipal : 0;
  const prepayRatio = Math.max(0, 1 - retainedRatio);
  const hasPrepayment = prepayment > 0.01;
  const nextDate = getPaymentDate(nextPaymentDate, 1);

  return (
    <section className="card snapshot-card">
      <div className="card-heading-row">
        <div>
          <span className="section-kicker">还款切片</span>
          <h2>提前还款这一刻</h2>
        </div>
        <span className="period-pill">下期 {formatShortDate(nextDate)}</span>
      </div>

      <div className="paid-donut-wrap">
        <div
          className="paid-donut"
          style={{
            background: hasPrepayment
              ? `conic-gradient(#2f7258 0 ${retainedRatio * 100}%, #c1683b ${
                  retainedRatio * 100
                }% 100%)`
              : "#2f7258",
          }}
        >
          <div className="paid-donut__inner">
            <span>还款后本金</span>
            <strong>{formatWan(remainingPrincipal)}</strong>
          </div>
        </div>
        <div className="paid-legend">
          <div>
            <span>
              <i className="dot dot--principal" />
              保留本金
            </span>
            <strong>{formatWan(remainingPrincipal)}</strong>
            <em>{formatNumber(retainedRatio * 100, 1)}%</em>
          </div>
          <div>
            <span>
              <i className="dot dot--interest" />
              提前还款
            </span>
            <strong>{formatWan(prepayment)}</strong>
            <em>{formatNumber(prepayRatio * 100, 1)}%</em>
          </div>
          <p>
            {hasPrepayment
              ? `本次提前还款占当前剩余本金的 ${formatNumber(
                  prepayRatio * 100,
                  1,
                )}%，全部直接冲抵本金。`
              : "暂未输入提前还款金额，当前仍按原计划还款。"}
          </p>
        </div>
      </div>

      <div className="balance-flow">
        <div className="balance-flow__row">
          <span>
            <Landmark size={14} />
            当前剩余本金
          </span>
          <strong>{formatWan(currentPrincipal)}</strong>
        </div>
        <div className="balance-flow__row balance-flow__row--copper">
          <span>
            <Scissors size={14} />
            本次提前还款
          </span>
          <strong>−{formatWan(prepayment)}</strong>
        </div>
        <div className="balance-flow__divider">
          <ArrowDown size={14} />
        </div>
        <div className="balance-flow__row balance-flow__row--after">
          <span>提前还款后本金</span>
          <strong>{formatWan(remainingPrincipal)}</strong>
        </div>
        <div className="retained-bar">
          <span style={{ width: `${retainedRatio * 100}%` }} />
        </div>
        <p className="retained-note">
          剩余 {formatNumber(retainedRatio * 100, 1)}% 本金 · 自{" "}
          {formatShortDate(nextDate)} 起按新方案执行
          {hasPrepayment
            ? ` · 提前还款 ${formatMoney(prepayment)} 全额冲抵本金`
            : " · 输入金额后即可查看两种方案差异"}
        </p>
      </div>
    </section>
  );
}
