import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Info, TrendingDown } from "lucide-react";
import type { LoanAnalysis } from "../lib/loan";
import type { ChartPoint } from "../lib/loan";
import { formatMoney, formatWan } from "../lib/format";
import {
  formatShortDate,
  formatYearMonth,
  getPaymentDate,
} from "../lib/date";

interface RepaymentChartProps {
  analysis: LoanAnalysis;
  data: ChartPoint[];
  nextPaymentDate: string;
}

type ChartMetric = "balance" | "interest";

const SERIES = [
  { key: "baseline", label: "原计划", color: "#9a958a" },
  { key: "reducePayment", label: "缩短月供", color: "#4a7c9b" },
  { key: "reduceTerm", label: "缩短年限", color: "#c1683b" },
] as const;

interface TooltipPayloadItem {
  dataKey?: string | number;
  value?: number | string;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: number | string;
  nextPaymentDate: string;
}

function CustomTooltip({
  active,
  payload,
  label,
  nextPaymentDate,
}: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const month = Number(label);
  const paymentDate =
    month === 0 ? new Date() : getPaymentDate(nextPaymentDate, month);
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__title">
        {month === 0
          ? `当前时点 · ${formatShortDate(paymentDate)}`
          : `第 ${month} 期 · ${formatShortDate(paymentDate)}`}
      </div>
      {payload.map((item) => {
        const series = SERIES.find((entry) => entry.key === item.dataKey);
        if (!series) return null;
        return (
          <div className="chart-tooltip__row" key={String(item.dataKey)}>
            <span>
              <i style={{ background: series.color }} />
              {series.label}
            </span>
            <strong>{formatWan(Number(item.value) * 10000)}</strong>
          </div>
        );
      })}
    </div>
  );
}

export function RepaymentChart({
  analysis,
  data,
  nextPaymentDate,
}: RepaymentChartProps) {
  const [metric, setMetric] = useState<ChartMetric>("balance");
  const maxMonths = analysis.baseline.totalMonths;

  const chartData = useMemo(
    () =>
      data.map((point) => ({
        month: point.month,
        baseline:
          (metric === "balance"
            ? point.baselineBalance
            : point.baselineInterest) / 10000,
        reducePayment:
          (metric === "balance"
            ? point.reducePaymentBalance
            : point.reducePaymentInterest) / 10000,
        reduceTerm:
          (metric === "balance"
            ? point.reduceTermBalance
            : point.reduceTermInterest) / 10000,
      })),
    [data, metric],
  );

  const ticks = useMemo(() => {
    const values: number[] = [];
    const maxYears = Math.ceil(maxMonths / 12);
    for (let year = 0; year <= maxYears; year += 5) {
      values.push(Math.min(year * 12, maxMonths));
    }
    if (values[values.length - 1] !== maxMonths) values.push(maxMonths);
    return [...new Set(values)];
  }, [maxMonths]);

  const isBalance = metric === "balance";
  const termMonths = analysis.reduceTerm.totalMonths;
  const isPaidOff = analysis.reduceTerm.isPaidOffAtPrepayment;
  const termPayoffDate = getPaymentDate(nextPaymentDate, termMonths);
  const paymentPayoffDate = getPaymentDate(
    nextPaymentDate,
    analysis.reducePayment.totalMonths,
  );
  const footText = isPaidOff
    ? "本次提前还款已覆盖全部剩余本金，后续不再产生月供和利息。"
    : isBalance
      ? `从提前还款后的本金起算，缩短年限预计在 ${formatYearMonth(
          termPayoffDate,
        )} 结清；缩短月供则延续至 ${formatYearMonth(paymentPayoffDate)}。`
      : `缩短年限更早停止计息，累计利息在 ${formatYearMonth(
          termPayoffDate,
        )} 停止增长；缩短月供则延续至 ${formatYearMonth(paymentPayoffDate)}。`;

  return (
    <section className="card chart-card">
      <div className="card-heading-row">
        <div>
          <span className="section-kicker">还款路径</span>
          <h2>把两种还法画出来</h2>
        </div>
        <div className="metric-toggle" role="tablist" aria-label="图表指标">
          <button
            type="button"
            role="tab"
            aria-selected={isBalance}
            className={isBalance ? "is-active" : ""}
            onClick={() => setMetric("balance")}
          >
            剩余本金
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isBalance}
            className={!isBalance ? "is-active" : ""}
            onClick={() => setMetric("interest")}
          >
            累计利息
          </button>
        </div>
      </div>

      <div className="chart-legend">
        {SERIES.map((series) => (
          <span key={series.key}>
            <i
              className={series.key === "baseline" ? "is-dashed" : ""}
              style={{ background: series.color }}
            />
            {series.label}
          </span>
        ))}
        <span className="chart-unit">单位：万元</span>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 14, right: 18, left: -8, bottom: 4 }}
          >
            <CartesianGrid
              stroke="rgba(24, 35, 29, 0.07)"
              strokeDasharray="3 5"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              type="number"
              domain={[0, maxMonths]}
              ticks={ticks}
              tickFormatter={(value) => {
                const month = Number(value);
                if (month === 0) return "当前";
                const date = getPaymentDate(nextPaymentDate, month);
                return date ? `${date.getFullYear()}` : `${Math.round(month / 12)}年`;
              }}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8a8c84", fontSize: 11 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8a8c84", fontSize: 11 }}
              tickFormatter={(value) => `${Math.round(Number(value))}万`}
              width={50}
            />
            <Tooltip
              content={<CustomTooltip nextPaymentDate={nextPaymentDate} />}
              cursor={{ stroke: "#b8b2a5" }}
            />
            <Line
              type="monotone"
              dataKey="baseline"
              stroke="#9a958a"
              strokeWidth={1.8}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="reducePayment"
              stroke="#4a7c9b"
              strokeWidth={2.3}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="reduceTerm"
              stroke="#c1683b"
              strokeWidth={2.6}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-footnote">
        <Info size={14} />
        <span>{footText}</span>
        <span className="chart-footnote__tag">
          <TrendingDown size={13} />
          {isPaidOff
            ? "贷款即时结清"
            : isBalance
              ? `年限方案提前 ${Math.round(
                  analysis.baseline.totalMonths - termMonths,
                )} 期 · ${formatYearMonth(termPayoffDate)}结清`
              : `少付 ${formatMoney(analysis.reduceTerm.interestSaved)} 利息`}
        </span>
      </div>
    </section>
  );
}
