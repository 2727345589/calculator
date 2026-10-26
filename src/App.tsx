import { useMemo, useState } from "react";
import {
  ArrowDown,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Sparkles,
} from "lucide-react";
import { InputPanel } from "./components/InputPanel";
import { SummaryStats } from "./components/SummaryStats";
import { RecommendationBanner } from "./components/RecommendationBanner";
import { ScenarioCards } from "./components/ScenarioCards";
import { RepaymentChart } from "./components/RepaymentChart";
import { PrepaymentSnapshot } from "./components/PrepaymentSnapshot";
import { ComparisonTable } from "./components/ComparisonTable";
import { ScheduleTable } from "./components/ScheduleTable";
import { Methodology } from "./components/Methodology";
import { DEFAULT_FORM, type FormValues } from "./types";
import {
  buildChartData,
  calculateLoan,
  clamp,
  pickRecommendedStrategy,
  type DecisionGoal,
  type RepaymentMethod,
} from "./lib/loan";
import {
  formatChineseDate,
  getDefaultNextPaymentDate,
  getPaymentDate,
  parseDateInput,
} from "./lib/date";
import { formatWan } from "./lib/format";

function toNumber(value: string, fallback: number): number {
  if (value.trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 36 36" fill="none">
        <path
          d="M7.5 17.2 18 8.4l10.5 8.8"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.8 16.5v10.8h14.4V16.5"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.5 27.3v-5.5h3.2v5.5M21.2 23.1h2.4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export default function App() {
  const [form, setForm] = useState<FormValues>(DEFAULT_FORM);
  const [goal, setGoal] = useState<DecisionGoal>("interest");
  const [repaymentMethod, setRepaymentMethod] =
    useState<RepaymentMethod>("equalInterest");

  const remainingPrincipalWan = Math.max(
    0.01,
    toNumber(form.remainingPrincipalWan, 100),
  );
  const remainingMonths = clamp(
    Math.round(toNumber(form.remainingMonths, 240)),
    1,
    480,
  );
  const lpr = clamp(toNumber(form.lpr, 3.5), 0, 20);
  const spread = clamp(toNumber(form.spread, -20), -500, 500);
  const effectiveRate = Math.max(0, lpr + spread / 100);
  const prepayWan = Math.max(0, toNumber(form.prepayWan, 0));
  const nextPaymentDate = parseDateInput(form.nextPaymentDate)
    ? form.nextPaymentDate
    : getDefaultNextPaymentDate();
  const nextPaymentDateValue = getPaymentDate(nextPaymentDate, 1);

  const analysis = useMemo(
    () =>
      calculateLoan({
        repaymentMethod,
        remainingPrincipal: remainingPrincipalWan * 10000,
        annualRate: effectiveRate,
        remainingMonths,
        prepayAmount: prepayWan * 10000,
      }),
    [
      repaymentMethod,
      remainingPrincipalWan,
      effectiveRate,
      remainingMonths,
      prepayWan,
    ],
  );

  const recommended = useMemo(
    () => pickRecommendedStrategy(analysis, goal),
    [analysis, goal],
  );
  const chartData = useMemo(() => buildChartData(analysis), [analysis]);

  const handleChange = (key: keyof FormValues, value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const scrollToCalculator = () => {
    document.getElementById("workspace")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="app">
      <div className="page-glow page-glow--one" />
      <div className="page-glow page-glow--two" />

      <header className="topbar">
        <a className="brand" href="#top" aria-label="房算首页">
          <BrandMark />
          <span className="brand-copy">
            <strong>房算</strong>
            <small>FANGSUAN</small>
          </span>
        </a>

        <nav className="topnav" aria-label="页面导航">
          <a href="#workspace">测算器</a>
          <a href="#comparison">方案对比</a>
          <a href="#methodology">测算口径</a>
        </nav>

        <div className="top-actions">
          <span className="live-badge">
            <i />
            本地实时测算
          </span>
          <button type="button" className="top-cta" onClick={scrollToCalculator}>
            调整参数
            <ChevronRight size={14} />
          </button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow">
            <span />
            MORTGAGE PREPAYMENT STUDIO
          </div>
          <h1>
            提前还一笔，
            <br />
            <em>怎么还更划算？</em>
          </h1>
          <p>
            支持等额本息与等额本金两种还款方式。输入当前剩余本金、剩余期数、下一期还款日、LPR
            与加点，再填入一笔提前还款金额，实时比较「缩短月供」与「缩短年限」的月供、期数与总利息。
          </p>
          <div className="hero-pills">
            <span>
              <Check size={13} />{" "}
              {repaymentMethod === "equalPrincipal" ? "等额本金" : "等额本息"}
            </span>
            <span>
              <Check size={13} /> LPR 自由加减点
            </span>
            <span>
              <Check size={13} /> 双策略逐期对比
            </span>
            <span>
              <Check size={13} /> 按真实还款日展示
            </span>
          </div>
        </div>

        <div className="hero-rate-card">
          <div className="hero-rate-top">
            <span>当前执行年利率</span>
            <span className="rate-live">
              <i />
              实时联动
            </span>
          </div>
          <div className="hero-rate-value">
            {effectiveRate.toFixed(2)}
            <small>%</small>
          </div>
          <div className="hero-rate-equation">
            <span>LPR {lpr.toFixed(2)}%</span>
            <b>{spread >= 0 ? "+" : "−"}</b>
            <span>{Math.abs(spread)}BP</span>
            <b>=</b>
            <strong>{effectiveRate.toFixed(2)}%</strong>
          </div>
          <div className="hero-rate-footer">
            <span>
              <CircleDollarSign size={13} />
              剩余本金 {formatWan(remainingPrincipalWan * 10000)}
            </span>
            <span>
              <Clock3 size={13} />
              剩余 {remainingMonths} 期 · 约 {(remainingMonths / 12).toFixed(1)} 年
            </span>
            <span>
              <Clock3 size={13} />
              下期 {formatChineseDate(nextPaymentDateValue)}
            </span>
          </div>
          <span className="hero-rate-spark">
            <Sparkles size={15} />
          </span>
        </div>
      </section>

      <main className="workspace" id="workspace">
        <InputPanel
          form={form}
          goal={goal}
          repaymentMethod={repaymentMethod}
          effectiveRate={effectiveRate}
          balanceBeforePrepay={analysis.balanceBeforePrepay}
          onChange={handleChange}
          onGoalChange={setGoal}
          onRepaymentMethodChange={setRepaymentMethod}
          onReset={() => {
            setForm(DEFAULT_FORM);
            setGoal("interest");
            setRepaymentMethod("equalInterest");
          }}
        />

        <div className="results">
          <SummaryStats
            analysis={analysis}
            recommended={recommended}
            nextPaymentDate={nextPaymentDate}
          />
          <RecommendationBanner
            analysis={analysis}
            recommended={recommended}
            goal={goal}
            nextPaymentDate={nextPaymentDate}
          />

          <section className="results-section" id="comparison">
            <div className="results-heading">
              <div>
                <span className="section-kicker">方案对比</span>
                <h2>提前还款后，各自会变成什么样</h2>
              </div>
              <span className="results-heading__note">
                参数变化后自动重算
                <ArrowDown size={14} />
              </span>
            </div>
            <ScenarioCards
              analysis={analysis}
              recommended={recommended}
              nextPaymentDate={nextPaymentDate}
            />
          </section>

          <div className="analysis-grid">
            <RepaymentChart
              analysis={analysis}
              data={chartData}
              nextPaymentDate={nextPaymentDate}
            />
            <PrepaymentSnapshot
              analysis={analysis}
              nextPaymentDate={nextPaymentDate}
            />
          </div>

          <ComparisonTable
            analysis={analysis}
            recommended={recommended}
            nextPaymentDate={nextPaymentDate}
          />
          <ScheduleTable
            analysis={analysis}
            nextPaymentDate={nextPaymentDate}
          />
        </div>
      </main>

      <Methodology />

      <footer className="footer">
        <div className="footer-brand">
          <BrandMark />
          <div>
            <strong>房算</strong>
            <span>把复杂的房贷，算得明白一点。</span>
          </div>
        </div>
        <p>测算结果仅供参考，实际以贷款银行合同与还款规则为准。</p>
        <span>© {new Date().getFullYear()} FANGSUAN</span>
      </footer>
    </div>
  );
}
