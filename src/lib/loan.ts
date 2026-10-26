export type StrategyKey = "baseline" | "reducePayment" | "reduceTerm";
export type DecisionGoal = "interest" | "cashflow" | "balanced";
export type RepaymentMethod = "equalInterest" | "equalPrincipal";

export interface LoanInput {
  repaymentMethod: RepaymentMethod;
  remainingPrincipal: number; // 剩余贷款金额（元）
  annualRate: number; // 执行年利率（%）
  remainingMonths: number; // 剩余还款期数（期）
  prepayAmount: number; // 提前还款金额（元）
}

export interface ScheduleEntry {
  kind: "payment" | "prepayment";
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  note?: string;
}

export interface PaymentBreakdown {
  payment: number;
  principal: number;
  interest: number;
  principalRatio: number;
}

export interface StrategyResult {
  key: StrategyKey;
  label: string;
  description: string;
  monthlyPayment: number;
  monthlyDecrease: number;
  currentMonthlyPayment: number;
  monthlySavings: number;
  monthsSaved: number;
  totalMonths: number;
  remainingMonths: number;
  totalInterest: number;
  interestSaved: number;
  totalPaid: number;
  endPeriod: number;
  schedule: ScheduleEntry[];
  firstPayment: PaymentBreakdown | null;
  isPaidOffAtPrepayment: boolean;
}

export interface LoanAnalysis {
  input: {
    remainingPrincipal: number;
    annualRate: number;
    remainingMonths: number;
    prepayAmount: number;
    effectivePrepay: number;
  };
  repaymentMethod: RepaymentMethod;
  currentMonthlyPayment: number;
  currentMonthlyDecrease: number;
  balanceBeforePrepay: number;
  balanceAfterPrepay: number;
  baseline: StrategyResult;
  reducePayment: StrategyResult;
  reduceTerm: StrategyResult;
  maxInterestSaved: number;
}

const EPSILON = 0.01;

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

export function calculateMonthlyPayment(
  principal: number,
  annualRatePercent: number,
  months: number,
): number {
  if (principal <= 0 || months <= 0) return 0;
  const monthlyRate = annualRatePercent / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

function buildFixedSchedule(
  principal: number,
  monthlyRate: number,
  payment: number,
  months: number,
): ScheduleEntry[] {
  const schedule: ScheduleEntry[] = [];
  let balance = principal;

  for (let period = 1; period <= months; period += 1) {
    const interest = balance * monthlyRate;
    const isFinalPayment = period === months;
    const principalPaid = isFinalPayment
      ? balance
      : Math.min(balance, Math.max(0, payment - interest));
    const actualPayment = principalPaid + interest;
    balance = Math.max(0, balance - principalPaid);

    schedule.push({
      kind: "payment",
      period,
      payment: actualPayment,
      principal: principalPaid,
      interest,
      balance,
    });

    if (balance <= EPSILON && !isFinalPayment) break;
  }

  return schedule;
}

function buildFlexibleSchedule(
  principal: number,
  monthlyRate: number,
  payment: number,
  startPeriod: number,
  maxMonths: number,
): ScheduleEntry[] {
  const schedule: ScheduleEntry[] = [];
  let balance = principal;

  for (let index = 0; index < maxMonths; index += 1) {
    if (balance <= EPSILON) break;
    const period = startPeriod + index;
    const interest = balance * monthlyRate;
    const principalPaid = Math.min(balance, Math.max(0, payment - interest));
    const actualPayment = principalPaid + interest;
    balance = Math.max(0, balance - principalPaid);

    schedule.push({
      kind: "payment",
      period,
      payment: actualPayment,
      principal: principalPaid,
      interest,
      balance,
    });
  }

  return schedule;
}

function buildEqualPrincipalSchedule(
  principal: number,
  monthlyRate: number,
  principalPerMonth: number,
  months: number,
  startPeriod = 1,
): ScheduleEntry[] {
  const schedule: ScheduleEntry[] = [];
  let balance = principal;

  for (let index = 0; index < months; index += 1) {
    if (balance <= EPSILON) break;
    const interest = balance * monthlyRate;
    const principalPaid = Math.min(balance, Math.max(0, principalPerMonth));
    const actualPayment = principalPaid + interest;
    balance = Math.max(0, balance - principalPaid);

    schedule.push({
      kind: "payment",
      period: startPeriod + index,
      payment: actualPayment,
      principal: principalPaid,
      interest,
      balance,
    });
  }

  return schedule;
}

function sumInterest(schedule: ScheduleEntry[]): number {
  return schedule.reduce((sum, row) => sum + row.interest, 0);
}

function sumPayments(schedule: ScheduleEntry[]): number {
  return schedule.reduce((sum, row) => sum + row.payment, 0);
}

function lastPeriod(schedule: ScheduleEntry[]): number {
  return schedule.reduce(
    (latest, row) => (row.kind === "payment" ? Math.max(latest, row.period) : latest),
    0,
  );
}

function getFirstPayment(schedule: ScheduleEntry[]): PaymentBreakdown | null {
  const row = schedule.find(
    (entry) => entry.kind === "payment" && entry.payment > EPSILON,
  );
  if (!row) return null;

  return {
    payment: row.payment,
    principal: row.principal,
    interest: row.interest,
    principalRatio: row.principal / row.payment,
  };
}

function getMonthlyDecrease(schedule: ScheduleEntry[]): number {
  const payments = schedule.filter(
    (entry) => entry.kind === "payment" && entry.payment > EPSILON,
  );
  if (payments.length < 2) return 0;
  return Math.max(0, payments[0].payment - payments[1].payment);
}

function createStrategy(
  key: StrategyKey,
  label: string,
  description: string,
  schedule: ScheduleEntry[],
  currentMonthlyPayment: number,
  monthlyPayment: number,
  baselineTotalInterest: number,
  baselineRemainingMonths: number,
): StrategyResult {
  const totalInterest = sumInterest(schedule);
  const totalPaid = sumPayments(schedule);
  const endPeriod = lastPeriod(schedule);
  const hasPrepay = schedule.some((row) => row.kind === "prepayment");
  const isPaidOffAtPrepayment = hasPrepay && endPeriod === 0;

  return {
    key,
    label,
    description,
    monthlyPayment: isPaidOffAtPrepayment ? 0 : monthlyPayment,
    monthlyDecrease: isPaidOffAtPrepayment ? 0 : getMonthlyDecrease(schedule),
    currentMonthlyPayment,
    monthlySavings: isPaidOffAtPrepayment
      ? currentMonthlyPayment
      : Math.max(0, currentMonthlyPayment - monthlyPayment),
    monthsSaved: Math.max(0, baselineRemainingMonths - endPeriod),
    totalMonths: endPeriod,
    remainingMonths: endPeriod,
    totalInterest,
    interestSaved: Math.max(0, baselineTotalInterest - totalInterest),
    totalPaid,
    endPeriod,
    schedule,
    firstPayment: isPaidOffAtPrepayment ? null : getFirstPayment(schedule),
    isPaidOffAtPrepayment,
  };
}

export function calculateLoan(input: LoanInput): LoanAnalysis {
  const principal = Math.max(0, input.remainingPrincipal);
  const annualRate = Math.max(0, input.annualRate);
  const totalMonths = Math.max(1, Math.round(input.remainingMonths));
  const monthlyRate = annualRate / 100 / 12;
  const repaymentMethod = input.repaymentMethod ?? "equalInterest";
  const isEqualPrincipal = repaymentMethod === "equalPrincipal";
  const principalPerMonth = principal / totalMonths;
  const currentMonthlyPayment = isEqualPrincipal
    ? principalPerMonth + principal * monthlyRate
    : calculateMonthlyPayment(principal, annualRate, totalMonths);

  const baselineSchedule = isEqualPrincipal
    ? buildEqualPrincipalSchedule(
        principal,
        monthlyRate,
        principalPerMonth,
        totalMonths,
      )
    : buildFixedSchedule(
        principal,
        monthlyRate,
        currentMonthlyPayment,
        totalMonths,
      );
  const baselineTotalInterest = sumInterest(baselineSchedule);
  const baselineTotalPaid = sumPayments(baselineSchedule);

  const requestedPrepay = Number.isFinite(input.prepayAmount)
    ? Math.max(0, input.prepayAmount)
    : 0;
  const effectivePrepay = Math.min(requestedPrepay, principal);
  const balanceAfterPrepay = Math.max(0, principal - effectivePrepay);

  const baselineDescription = isEqualPrincipal
    ? "按当前剩余期数逐月递减还款"
    : "按当前剩余期数还满全部月供";
  const baseline = createStrategy(
    "baseline",
    "不提前还款",
    baselineDescription,
    baselineSchedule,
    currentMonthlyPayment,
    currentMonthlyPayment,
    baselineTotalInterest,
    totalMonths,
  );
  baseline.totalPaid = baselineTotalPaid;

  const withPrepayment = (): ScheduleEntry[] => {
    if (effectivePrepay <= EPSILON) return [];
    return [
      {
        kind: "prepayment",
        period: 0,
        payment: effectivePrepay,
        principal: effectivePrepay,
        interest: 0,
        balance: balanceAfterPrepay,
        note: "提前还款冲抵本金",
      },
    ];
  };

  const reducePaymentMonthly =
    balanceAfterPrepay <= EPSILON
      ? 0
      : isEqualPrincipal
        ? balanceAfterPrepay / totalMonths + balanceAfterPrepay * monthlyRate
        : calculateMonthlyPayment(balanceAfterPrepay, annualRate, totalMonths);
  const reducePaymentSchedule = [
    ...withPrepayment(),
    ...(balanceAfterPrepay <= EPSILON
      ? []
      : isEqualPrincipal
        ? buildEqualPrincipalSchedule(
            balanceAfterPrepay,
            monthlyRate,
            balanceAfterPrepay / totalMonths,
            totalMonths,
          )
        : buildFixedSchedule(
            balanceAfterPrepay,
            monthlyRate,
            reducePaymentMonthly,
            totalMonths,
          )),
  ];

  const reduceTermMonthly =
    balanceAfterPrepay <= EPSILON
      ? 0
      : isEqualPrincipal
        ? principalPerMonth + balanceAfterPrepay * monthlyRate
        : currentMonthlyPayment;
  const reduceTermSchedule = [
    ...withPrepayment(),
    ...(balanceAfterPrepay <= EPSILON
      ? []
      : isEqualPrincipal
        ? buildEqualPrincipalSchedule(
            balanceAfterPrepay,
            monthlyRate,
            principalPerMonth,
            totalMonths,
          )
        : buildFlexibleSchedule(
            balanceAfterPrepay,
            monthlyRate,
            currentMonthlyPayment,
            1,
            totalMonths,
          )),
  ];

  const reducePayment = createStrategy(
    "reducePayment",
    "缩短月供",
    isEqualPrincipal
      ? "剩余期限不变，降低每月应还本金"
      : "剩余期限不变，直接降低每月月供",
    reducePaymentSchedule,
    currentMonthlyPayment,
    reducePaymentMonthly,
    baselineTotalInterest,
    totalMonths,
  );

  const reduceTerm = createStrategy(
    "reduceTerm",
    "缩短年限",
    isEqualPrincipal
      ? "每月本金不变，缩短还款年限"
      : "保持当前月供，大幅缩短还款年限",
    reduceTermSchedule,
    currentMonthlyPayment,
    reduceTermMonthly,
    baselineTotalInterest,
    totalMonths,
  );

  return {
    input: {
      remainingPrincipal: principal,
      annualRate,
      remainingMonths: totalMonths,
      prepayAmount: requestedPrepay,
      effectivePrepay,
    },
    repaymentMethod,
    currentMonthlyPayment,
    currentMonthlyDecrease: baseline.monthlyDecrease,
    balanceBeforePrepay: principal,
    balanceAfterPrepay,
    baseline,
    reducePayment,
    reduceTerm,
    maxInterestSaved: Math.max(
      reducePayment.interestSaved,
      reduceTerm.interestSaved,
    ),
  };
}

export interface ChartPoint {
  month: number;
  year: number;
  baselineBalance: number;
  reducePaymentBalance: number;
  reduceTermBalance: number;
  baselineInterest: number;
  reducePaymentInterest: number;
  reduceTermInterest: number;
}

function cumulativeInterestAt(schedule: ScheduleEntry[], month: number): number {
  return schedule.reduce(
    (sum, row) => (row.period <= month ? sum + row.interest : sum),
    0,
  );
}

function balanceAt(
  schedule: ScheduleEntry[],
  month: number,
  fallbackBalance: number,
): number {
  let balance = fallbackBalance;
  for (const row of schedule) {
    if (row.period > month) break;
    balance = row.balance;
  }
  return balance;
}

export function buildChartData(analysis: LoanAnalysis): ChartPoint[] {
  const maxMonths = analysis.baseline.totalMonths;
  const points = new Set<number>([0]);

  for (let month = 12; month < maxMonths; month += 12) points.add(month);
  points.add(maxMonths);
  points.add(analysis.reduceTerm.totalMonths);
  points.add(analysis.reducePayment.totalMonths);

  return [...points]
    .filter((month) => month >= 0 && month <= maxMonths)
    .sort((a, b) => a - b)
    .map((month) => ({
      month,
      year: Number((month / 12).toFixed(2)),
      baselineBalance: balanceAt(
        analysis.baseline.schedule,
        month,
        analysis.input.remainingPrincipal,
      ),
      reducePaymentBalance: balanceAt(
        analysis.reducePayment.schedule,
        month,
        analysis.balanceAfterPrepay,
      ),
      reduceTermBalance: balanceAt(
        analysis.reduceTerm.schedule,
        month,
        analysis.balanceAfterPrepay,
      ),
      baselineInterest: cumulativeInterestAt(
        analysis.baseline.schedule,
        month,
      ),
      reducePaymentInterest: cumulativeInterestAt(
        analysis.reducePayment.schedule,
        month,
      ),
      reduceTermInterest: cumulativeInterestAt(
        analysis.reduceTerm.schedule,
        month,
      ),
    }));
}

export function pickRecommendedStrategy(
  analysis: LoanAnalysis,
  goal: DecisionGoal,
): StrategyResult {
  const { reducePayment, reduceTerm } = analysis;

  if (goal === "interest") return reduceTerm;
  if (goal === "cashflow") return reducePayment;

  const interestBase = Math.max(analysis.baseline.totalInterest, 1);
  const paymentBase = Math.max(analysis.currentMonthlyPayment, 1);
  const monthBase = Math.max(analysis.baseline.totalMonths, 1);

  const score = (strategy: StrategyResult) =>
    (strategy.interestSaved / interestBase) * 0.5 +
    (strategy.monthlySavings / paymentBase) * 0.25 +
    (strategy.monthsSaved / monthBase) * 0.25;

  return score(reduceTerm) >= score(reducePayment)
    ? reduceTerm
    : reducePayment;
}
