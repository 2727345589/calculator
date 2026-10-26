import {
  ArrowDownRight,
  Check,
  CircleCheck,
  Sparkles,
  Trophy,
  Wallet,
} from "lucide-react";
import type {
  DecisionGoal,
  LoanAnalysis,
  StrategyResult,
} from "../lib/loan";
import { formatMoney, formatMonths, formatWan } from "../lib/format";
import {
  formatChineseDate,
  formatYearMonth,
  getPaymentDate,
} from "../lib/date";

interface RecommendationBannerProps {
  analysis: LoanAnalysis;
  recommended: StrategyResult;
  goal: DecisionGoal;
  nextPaymentDate: string;
}

const goalLabels: Record<DecisionGoal, string> = {
  interest: "省钱优先",
  cashflow: "月供优先",
  balanced: "平衡偏好",
};

export function RecommendationBanner({
  analysis,
  recommended,
  goal,
  nextPaymentDate,
}: RecommendationBannerProps) {
  const isPaidOff =
    analysis.input.effectivePrepay > 0 &&
    analysis.balanceAfterPrepay <= 1;
  const hasPrepayment = analysis.input.effectivePrepay > 0.01;
  const isEqualPrincipal = analysis.repaymentMethod === "equalPrincipal";
  const baselinePayoffDate = getPaymentDate(
    nextPaymentDate,
    analysis.input.remainingMonths,
  );
  const recommendedPayoffDate = recommended.isPaidOffAtPrepayment
    ? null
    : getPaymentDate(nextPaymentDate, recommended.endPeriod);

  if (!hasPrepayment) {
    return (
      <section className="recommend-banner recommend-banner--quiet">
        <div className="recommend-quiet-icon">
          <Sparkles size={22} />
        </div>
        <div className="recommend-copy">
          <span className="recommend-kicker">决策建议</span>
          <h2>填入提前还款金额，立即对比两种还款策略</h2>
          <p>
            系统会根据当前剩余贷款与执行利率，精准对比「缩短月供」与「缩短年限」的月供、期数与总利息。
          </p>
        </div>
      </section>
    );
  }

  const alternative =
    recommended.key === "reduceTerm"
      ? analysis.reducePayment
      : analysis.reduceTerm;
  const extraSaving = Math.max(
    0,
    recommended.interestSaved - alternative.interestSaved,
  );

  if (isPaidOff) {
    return (
      <section className="recommend-banner">
        <div className="recommend-deco recommend-deco--one" />
        <div className="recommend-deco recommend-deco--two" />
        <div className="recommend-icon">
          <CircleCheck size={24} />
        </div>
        <div className="recommend-copy">
          <div className="recommend-kicker">
            <Trophy size={13} />
            测算结果
          </div>
          <h2>
            这笔钱可以一次性结清
            <span className="recommend-highlight">省下未来全部利息</span>
          </h2>
          <p>
            提前还款额已覆盖全部剩余本金，贷款可于{" "}
            {formatChineseDate(new Date())} 直接全额结清。
            「缩短月供」与「缩短年限」的结果一致。
          </p>
          <div className="recommend-tags">
            <span>
              <Check size={13} /> 立即全额结清
            </span>
            <span>
              <Check size={13} /> 后续无需再还月供
            </span>
          </div>
        </div>
        <div className="recommend-metric">
          <span>节省未来利息</span>
          <strong>
            {formatWan(analysis.reduceTerm.interestSaved).replace("万", "")}
            <small>万</small>
          </strong>
          <em>省去全部剩余利息</em>
        </div>
      </section>
    );
  }

  const title =
    recommended.key === "reduceTerm" ? (
      <>
        推荐「缩短年限」
        <span className="recommend-highlight">
          未来总利息少付 {formatMoney(recommended.interestSaved)}
        </span>
      </>
    ) : (
      <>
        推荐「缩短月供」
        <span className="recommend-highlight">
          {isEqualPrincipal ? "首月" : "每月"}少还{" "}
          {formatMoney(recommended.monthlySavings)}
        </span>
      </>
    );

  const body =
    recommended.key === "reduceTerm" ? (
      isEqualPrincipal ? (
        <>
          每月应还本金保持不变，预计 {formatYearMonth(recommendedPayoffDate)}{" "}
          还清，比原计划的 {formatYearMonth(baselinePayoffDate)} 提前{" "}
          {formatMonths(recommended.monthsSaved)}。首月月供约{" "}
          {formatMoney(recommended.monthlyPayment, 2)}，之后逐月递减；相比「缩短月供」可再多省{" "}
          {formatMoney(extraSaving)} 利息。
        </>
      ) : (
        <>
          月供继续保持当前 {formatMoney(recommended.monthlyPayment, 2)}，预计{" "}
          {formatYearMonth(recommendedPayoffDate)} 还清，比原计划的{" "}
          {formatYearMonth(baselinePayoffDate)} 提前{" "}
          {formatMonths(recommended.monthsSaved)}。相比「缩短月供」可再多省{" "}
          {formatMoney(extraSaving)} 利息。
        </>
      )
    ) : isEqualPrincipal ? (
      <>
        首月月供从当前 {formatMoney(analysis.currentMonthlyPayment, 2)}{" "}
        降至 {formatMoney(recommended.monthlyPayment, 2)}
        ，之后逐月递减；贷款仍按原计划延续至{" "}
        {formatYearMonth(baselinePayoffDate)}。未来总利息也能省下{" "}
        {formatMoney(recommended.interestSaved)}。
      </>
    ) : (
      <>
        月供从当前 {formatMoney(analysis.currentMonthlyPayment, 2)} 降至{" "}
        {formatMoney(recommended.monthlyPayment, 2)}，贷款仍按原计划延续至{" "}
        {formatYearMonth(baselinePayoffDate)}。未来总利息也能省下{" "}
        {formatMoney(recommended.interestSaved)}，适合更看重当下现金流的家庭。
      </>
    );

  return (
    <section
      className={`recommend-banner ${
        recommended.key === "reducePayment"
          ? "recommend-banner--cashflow"
          : ""
      }`}
    >
      <div className="recommend-deco recommend-deco--one" />
      <div className="recommend-deco recommend-deco--two" />
      <div className="recommend-icon">
        <Trophy size={23} />
      </div>
      <div className="recommend-copy">
        <div className="recommend-kicker">
          <Sparkles size={13} />
          {goalLabels[goal]} · 智能比较
        </div>
        <h2>{title}</h2>
        <p>{body}</p>
        <div className="recommend-tags">
          {recommended.key === "reduceTerm" ? (
            <>
              <span>
                <Check size={13} />{" "}
                {isEqualPrincipal ? "每月本金不变" : "月供保持不变"}
              </span>
              <span>
                <ArrowDownRight size={13} /> 提前{" "}
                {formatMonths(recommended.monthsSaved)} ·{" "}
                {formatYearMonth(recommendedPayoffDate)}结清
              </span>
              <span>
                <Check size={13} /> 省息最多
              </span>
            </>
          ) : (
            <>
              <span>
                <Wallet size={13} />{" "}
                {isEqualPrincipal ? "首月月供降低" : "月供降低"}{" "}
                {formatMoney(recommended.monthlySavings)}
              </span>
              <span>
                <Check size={13} /> 至 {formatYearMonth(baselinePayoffDate)} 结清
              </span>
              <span>
                <Check size={13} />{" "}
                {isEqualPrincipal ? "逐月递减" : "现金流更从容"}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="recommend-metric">
        <span>相比不提前还</span>
        <strong>
          {formatWan(recommended.interestSaved).replace("万", "")}
          <small>万</small>
        </strong>
        <em>预计少付利息</em>
        <div className="recommend-metric__compare">
          <span>另一方案省 {formatWan(alternative.interestSaved)}</span>
          {extraSaving > 0 ? (
            <span>多省 {formatWan(extraSaving)}</span>
          ) : (
            <span>金额接近</span>
          )}
        </div>
      </div>
    </section>
  );
}
