import {
  CircleHelp,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  WalletCards,
} from "lucide-react";
import type { DecisionGoal } from "../lib/loan";
import type { FormValues } from "../types";
import {
  daysUntil,
  formatChineseDate,
  parseDateInput,
  toDateInputValue,
} from "../lib/date";
import { formatWan } from "../lib/format";

interface InputPanelProps {
  form: FormValues;
  goal: DecisionGoal;
  effectiveRate: number;
  balanceBeforePrepay: number;
  onChange: (key: keyof FormValues, value: string) => void;
  onGoalChange: (goal: DecisionGoal) => void;
  onReset: () => void;
}

interface NumericFieldProps {
  label: string;
  value: string;
  suffix: string;
  onChange: (value: string) => void;
  step?: number;
  min?: number;
  max?: number;
  hint?: string;
  labelExtra?: React.ReactNode;
}

function NumericField({
  label,
  value,
  suffix,
  onChange,
  step = 1,
  min,
  max,
  hint,
  labelExtra,
}: NumericFieldProps) {
  return (
    <label className="field">
      <span className="field-label">
        {label}
        {labelExtra}
      </span>
      <span className="input-shell">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className="input-suffix">{suffix}</span>
      </span>
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

const goalOptions: { value: DecisionGoal; label: string; hint: string }[] = [
  {
    value: "interest",
    label: "省钱优先",
    hint: "优先压低未来利息支出，总成本最低，适合现金流充裕的家庭。",
  },
  {
    value: "cashflow",
    label: "月供优先",
    hint: "优先降低每月还款支出，保留更多日常流动资金。",
  },
  {
    value: "balanced",
    label: "平衡",
    hint: "综合权衡利息节省与每月减负幅度，给出均衡建议。",
  },
];

const remainingTermChips = [
  { label: "5年 (60期)", months: 60 },
  { label: "10年 (120期)", months: 120 },
  { label: "15年 (180期)", months: 180 },
  { label: "20年 (240期)", months: 240 },
  { label: "25年 (300期)", months: 300 },
  { label: "30年 (360期)", months: 360 },
];

export function InputPanel({
  form,
  goal,
  effectiveRate,
  balanceBeforePrepay,
  onChange,
  onGoalChange,
  onReset,
}: InputPanelProps) {
  const lpr = Number(form.lpr) || 0;
  const spread = Number(form.spread) || 0;
  const prepayWan = Number(form.prepayWan) || 0;
  const isOverBalance = prepayWan * 10000 > balanceBeforePrepay + 1;
  const months = Math.max(1, Math.round(Number(form.remainingMonths) || 1));
  const remainingYears = Math.floor(months / 12);
  const remainingRestMonths = months % 12;
  const nextPaymentDate = parseDateInput(form.nextPaymentDate);
  const daysToNextPayment = daysUntil(nextPaymentDate);
  const today = toDateInputValue(new Date());

  const setFullPrepay = () => {
    onChange("prepayWan", (balanceBeforePrepay / 10000).toFixed(2));
  };

  return (
    <aside className="input-panel" aria-label="贷款参数">
      <div className="panel-heading">
        <div className="heading-mark">
          <SlidersHorizontal size={18} strokeWidth={1.8} />
        </div>
        <div className="heading-copy">
          <span className="section-kicker">01 / 剩余贷款条件</span>
          <h2>当前还剩多少？</h2>
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={onReset}
          title="恢复默认参数"
          aria-label="恢复默认参数"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="form-section form-section--loan">
        <div className="field-block">
          <div className="field-label-row">
            <span className="field-label">剩余贷款金额</span>
            <span className="field-unit-note">万元</span>
          </div>
          <div className="input-shell input-shell--large">
            <input
              type="number"
              inputMode="decimal"
              min="1"
              step="5"
              value={form.remainingPrincipalWan}
              onChange={(event) =>
                onChange("remainingPrincipalWan", event.target.value)
              }
            />
            <span className="input-suffix">万元</span>
          </div>
          <div className="quick-row" aria-label="剩余贷款快捷选项">
            {[50, 80, 100, 150, 200].map((amount) => (
              <button
                key={amount}
                type="button"
                className={`quick-chip ${
                  Number(form.remainingPrincipalWan) === amount
                    ? "is-active"
                    : ""
                }`}
                onClick={() =>
                  onChange("remainingPrincipalWan", String(amount))
                }
              >
                {amount}万
              </button>
            ))}
          </div>
        </div>

        <div className="field-block">
          <div className="field-label-row">
            <span className="field-label">剩余还款期数</span>
            <span className="term-note">
              约 {(months / 12).toFixed(1)} 年 (
              {remainingYears > 0 ? `${remainingYears}年` : ""}
              {remainingRestMonths > 0 ? `${remainingRestMonths}个月` : ""}
              {remainingYears === 0 && remainingRestMonths === 0
                ? "1个月"
                : ""}
              )
            </span>
          </div>
          <div className="input-shell">
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="480"
              step="1"
              value={form.remainingMonths}
              onChange={(event) =>
                onChange("remainingMonths", event.target.value)
              }
            />
            <span className="input-suffix">期</span>
          </div>
          <div className="quick-row" aria-label="剩余期数快捷选项">
            {remainingTermChips.map((chip) => (
              <button
                key={chip.months}
                type="button"
                className={`quick-chip ${
                  Number(form.remainingMonths) === chip.months
                    ? "is-active"
                    : ""
                }`}
                onClick={() => onChange("remainingMonths", String(chip.months))}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        <label className="field date-field">
          <span className="field-label-row">
            <span className="field-label">下一期还款日期</span>
            <span className="term-note">按月同日顺延</span>
          </span>
          <span className="input-shell date-shell">
            <input
              type="date"
              lang="zh-CN"
              value={form.nextPaymentDate}
              min={today}
              onChange={(event) =>
                onChange("nextPaymentDate", event.target.value)
              }
            />
          </span>
          <span
            className={`field-hint date-hint ${
              daysToNextPayment !== null && daysToNextPayment < 0
                ? "is-warning"
                : ""
            }`}
          >
            {nextPaymentDate ? (
              daysToNextPayment !== null && daysToNextPayment < 0 ? (
                <>该日期已过去，请选择下一期实际还款日。</>
              ) : daysToNextPayment === 0 ? (
                <>今天就是下一期还款日 · {formatChineseDate(nextPaymentDate)}</>
              ) : (
                <>
                  还有 {daysToNextPayment} 天 ·{" "}
                  {formatChineseDate(nextPaymentDate)}。遇月末自动取当月最后一天。
                </>
              )
            ) : (
              "请选择下一期实际还款日，后续按每月同日推算。"
            )}
          </span>
        </label>

        <div className="field-grid">
          <NumericField
            label="五年期 LPR"
            value={form.lpr}
            suffix="%"
            min={0}
            max={20}
            step={0.05}
            onChange={(value) => onChange("lpr", value)}
          />
          <NumericField
            label="LPR 加点"
            value={form.spread}
            suffix="BP"
            min={-500}
            max={500}
            step={5}
            onChange={(value) => onChange("spread", value)}
            labelExtra={
              <span className="label-tip" title="1BP = 0.01%，负值代表减点">
                <CircleHelp size={13} />
                1BP=0.01%
              </span>
            }
          />
        </div>

        <div className="rate-preview">
          <span className="rate-preview__icon">
            <WalletCards size={18} />
          </span>
          <div>
            <span className="rate-preview__label">当前执行年利率</span>
            <div className="rate-preview__formula">
              {lpr.toFixed(2)}% {spread >= 0 ? "+" : "−"} {Math.abs(spread)}BP
            </div>
          </div>
          <strong className="rate-preview__value">
            {effectiveRate.toFixed(2)}
            <small>%</small>
          </strong>
        </div>
      </div>

      <div className="panel-divider" />

      <div className="panel-heading panel-heading--compact">
        <div className="heading-mark heading-mark--warm">
          <Sparkles size={18} strokeWidth={1.8} />
        </div>
        <div className="heading-copy">
          <span className="section-kicker">02 / 提前还款方案</span>
          <h2>你准备提前还多少？</h2>
        </div>
      </div>

      <div className="form-section form-section--prepay">
        <div className="field-block">
          <div className="field-label-row">
            <span className="field-label">提前还款金额</span>
            <span className="field-unit-note">万元</span>
          </div>
          <div className="input-shell input-shell--large">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={form.prepayWan}
              onChange={(event) => onChange("prepayWan", event.target.value)}
            />
            <span className="input-suffix">万元</span>
          </div>
          <div className="quick-row">
            {[10, 20, 30, 50].map((amount) => (
              <button
                key={amount}
                type="button"
                className={`quick-chip ${
                  Number(form.prepayWan) === amount ? "is-active" : ""
                }`}
                onClick={() => onChange("prepayWan", String(amount))}
              >
                {amount}万
              </button>
            ))}
            <button
              type="button"
              className="quick-chip quick-chip--accent"
              onClick={setFullPrepay}
            >
              全部结清
            </button>
          </div>
          <p className={`balance-hint ${isOverBalance ? "is-warning" : ""}`}>
            当前剩余本金约
            <strong>{formatWan(balanceBeforePrepay)}</strong>
            {isOverBalance
              ? "，还款额已超出剩余本金，将按一次性全部结清测算。"
              : "，提前还款将直接冲抵本金。"}
          </p>
        </div>

        <div className="goal-box">
          <div className="field-label-row">
            <span className="field-label">决策偏好</span>
            <span className="goal-note">影响推荐方案</span>
          </div>
          <div className="goal-tabs" role="tablist" aria-label="决策偏好">
            {goalOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={goal === option.value}
                className={`goal-tab ${goal === option.value ? "is-active" : ""}`}
                onClick={() => onGoalChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="goal-hint">
            {goalOptions.find((option) => option.value === goal)?.hint}
          </p>
        </div>
      </div>

      <div className="panel-footnote">
        <ShieldCheck size={15} />
        <span>等额本息 · 基于剩余贷款实时计算 · 无任何数据上传</span>
      </div>
    </aside>
  );
}
