import { getDefaultNextPaymentDate } from "./lib/date";

export interface FormValues {
  remainingPrincipalWan: string; // 剩余贷款金额（万元）
  remainingMonths: string; // 剩余还款期数（期）
  nextPaymentDate: string; // 下一期还款日期（YYYY-MM-DD）
  lpr: string; // 5年期以上 LPR (%)
  spread: string; // 加点 (BP)
  prepayWan: string; // 提前还款金额（万元）
}

export const DEFAULT_FORM: FormValues = {
  remainingPrincipalWan: "100",
  remainingMonths: "240",
  nextPaymentDate: getDefaultNextPaymentDate(),
  lpr: "3.5",
  spread: "-20",
  prepayWan: "20",
};
