import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Scissors,
} from "lucide-react";
import type { LoanAnalysis, StrategyKey, StrategyResult } from "../lib/loan";
import { formatMoney, formatWan } from "../lib/format";
import { formatShortDate, getPaymentDate } from "../lib/date";

interface ScheduleTableProps {
  analysis: LoanAnalysis;
  nextPaymentDate: string;
}

const PAGE_SIZE = 10;

const tabs: { key: StrategyKey; label: string }[] = [
  { key: "baseline", label: "原计划" },
  { key: "reducePayment", label: "缩短月供" },
  { key: "reduceTerm", label: "缩短年限" },
];

function getStrategy(analysis: LoanAnalysis, key: StrategyKey): StrategyResult {
  if (key === "reducePayment") return analysis.reducePayment;
  if (key === "reduceTerm") return analysis.reduceTerm;
  return analysis.baseline;
}

export function ScheduleTable({
  analysis,
  nextPaymentDate,
}: ScheduleTableProps) {
  const [selected, setSelected] = useState<StrategyKey>("reduceTerm");
  const [page, setPage] = useState(0);
  const strategy = getStrategy(analysis, selected);

  const prepayIndex = useMemo(
    () => strategy.schedule.findIndex((row) => row.kind === "prepayment"),
    [strategy],
  );
  const totalPages = Math.max(1, Math.ceil(strategy.schedule.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * PAGE_SIZE;
  const rows = strategy.schedule.slice(start, start + PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [selected]);

  useEffect(() => {
    if (page > totalPages - 1) setPage(totalPages - 1);
  }, [page, totalPages]);

  const jumpToPrepayment = () => {
    if (prepayIndex < 0) return;
    setPage(Math.floor(prepayIndex / PAGE_SIZE));
  };

  return (
    <section className="card schedule-card">
      <div className="card-heading-row schedule-heading">
        <div>
          <span className="section-kicker">逐期明细</span>
          <h2>还款计划表</h2>
        </div>
        <div className="schedule-tools">
          {prepayIndex >= 0 ? (
            <button
              type="button"
              className="text-button"
              onClick={jumpToPrepayment}
            >
              <Scissors size={13} />
              定位提前还款
            </button>
          ) : null}
          <div className="strategy-tabs" role="tablist" aria-label="选择还款方案">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={selected === tab.key}
                className={selected === tab.key ? "is-active" : ""}
                onClick={() => setSelected(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="table-scroll-hint">
        <ArrowLeftRight size={13} />
        左右滑动查看本金与利息明细
      </div>

      <div className="table-scroll">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>期次</th>
              <th>还款日期</th>
              <th>月供 / 还款</th>
              <th>本金</th>
              <th>利息</th>
              <th>剩余本金</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const isPrepayment = row.kind === "prepayment";
              const isFinal =
                row.kind === "payment" && row.balance <= 0.01;
              const paymentDate = isPrepayment
                ? new Date()
                : getPaymentDate(nextPaymentDate, row.period);
              return (
                <tr
                  key={`${row.kind}-${row.period}-${start + index}`}
                  className={isPrepayment ? "is-prepayment" : ""}
                >
                  <td>
                    <span className="period-cell">
                      {isPrepayment
                        ? row.period === 0
                          ? "即时还款"
                          : `第 ${row.period} 期后`
                        : `第 ${row.period} 期`}
                    </span>
                  </td>
                  <td>
                    <span className="date-cell">
                      {formatShortDate(paymentDate)}
                    </span>
                  </td>
                  <td>
                    {isPrepayment ? (
                      <span className="prepay-cell">
                        +{formatMoney(row.payment, 2)}
                      </span>
                    ) : (
                      formatMoney(row.payment, 2)
                    )}
                  </td>
                  <td>{formatMoney(row.principal, 2)}</td>
                  <td>
                    {isPrepayment ? (
                      <span className="cell-muted">—</span>
                    ) : (
                      formatMoney(row.interest, 2)
                    )}
                  </td>
                  <td>{formatWan(row.balance)}</td>
                  <td>
                    {isPrepayment ? (
                      <span className="table-badge table-badge--copper">
                        提前还款
                      </span>
                    ) : isFinal ? (
                      <span className="table-badge">结清</span>
                    ) : (
                      <span className="cell-muted">正常还款</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span className="pagination__info">
          第 {start + 1}–{Math.min(start + PAGE_SIZE, strategy.schedule.length)}{" "}
          条 · 共 {strategy.schedule.length} 条
        </span>
        <div className="pagination__controls">
          <button
            type="button"
            onClick={() => setPage(0)}
            disabled={safePage === 0}
            aria-label="第一页"
          >
            <ChevronsLeft size={15} />
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            disabled={safePage === 0}
            aria-label="上一页"
          >
            <ChevronLeft size={15} />
          </button>
          <span>
            {safePage + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() =>
              setPage((current) => Math.min(totalPages - 1, current + 1))
            }
            disabled={safePage === totalPages - 1}
            aria-label="下一页"
          >
            <ChevronRight size={15} />
          </button>
          <button
            type="button"
            onClick={() => setPage(totalPages - 1)}
            disabled={safePage === totalPages - 1}
            aria-label="最后一页"
          >
            <ChevronsRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}
