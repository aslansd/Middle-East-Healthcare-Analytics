import type { HealthcareRecord } from "./data";

export type NumericIndicatorKey =
  | "lifeExpectancy"
  | "expenditurePctGdp"
  | "infantMortality"
  | "physiciansPer1000"
  | "hospitalBedsPer1000";

/* ------------------------------------------------------------------ *
 * Distribution helpers
 * Needed so the app can report real p-values and confidence intervals
 * instead of comparing a t-statistic against a hard-coded 1.96.
 * ------------------------------------------------------------------ */

// Lanczos approximation of ln(Gamma(x)).
function logGamma(x: number): number {
  const cof = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5
  ];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) ser += cof[j] / ++y;
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

// Continued fraction expansion used by the incomplete beta function.
function betaContinuedFraction(a: number, b: number, x: number): number {
  const MAX_ITER = 300;
  const EPS = 3e-14;
  const TINY = 1e-300;

  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;

  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < TINY) d = TINY;
  d = 1 / d;
  let h = d;

  for (let m = 1; m <= MAX_ITER; m++) {
    const m2 = 2 * m;

    let num = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + num * d;
    if (Math.abs(d) < TINY) d = TINY;
    c = 1 + num / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    h *= d * c;

    num = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + num * d;
    if (Math.abs(d) < TINY) d = TINY;
    c = 1 + num / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    const delta = d * c;
    h *= delta;

    if (Math.abs(delta - 1) < EPS) break;
  }
  return h;
}

// Regularised incomplete beta function I_x(a, b).
function incompleteBeta(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const front = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x)
  );
  if (x < (a + 1) / (a + b + 2)) {
    return (front * betaContinuedFraction(a, b, x)) / a;
  }
  return 1 - (front * betaContinuedFraction(b, a, 1 - x)) / b;
}

/** Two-tailed p-value for a t-statistic with `df` degrees of freedom. */
export function tTestPValue(t: number, df: number): number {
  if (!Number.isFinite(t) || !Number.isFinite(df) || df <= 0) return NaN;
  return incompleteBeta(df / 2, 0.5, df / (df + t * t));
}

/** Critical two-tailed t value for a given confidence level (default 95%). */
export function tCritical(df: number, confidence = 0.95): number {
  if (!Number.isFinite(df) || df <= 0) return NaN;
  const targetP = 1 - confidence;
  let low = 0;
  let high = 200;
  for (let i = 0; i < 200; i++) {
    const mid = (low + high) / 2;
    if (tTestPValue(mid, df) > targetP) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

/** Formats a p-value for display, avoiding a misleading "0.0000". */
export function formatPValue(p: number): string {
  if (!Number.isFinite(p)) return "n/a";
  if (p < 0.0001) return "< 0.0001";
  return p.toFixed(4);
}

/* ------------------------------------------------------------------ *
 * Descriptive statistics
 * ------------------------------------------------------------------ */

export interface SummaryStats {
  mean: number;
  median: number;
  sd: number;
  variance: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
  iqr: number;
  count: number;
}

const EMPTY_SUMMARY: SummaryStats = {
  mean: 0, median: 0, sd: 0, variance: 0,
  min: 0, max: 0, q1: 0, q3: 0, iqr: 0, count: 0
};

// Linear-interpolation quantile on an already-sorted array.
function quantile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const pos = (sorted.length - 1) * p;
  const lower = Math.floor(pos);
  const upper = Math.ceil(pos);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (pos - lower) * (sorted[upper] - sorted[lower]);
}

export function getSummaryStatistics(
  data: HealthcareRecord[],
  key: NumericIndicatorKey
): SummaryStats {
  const count = data.length;
  if (count === 0) return { ...EMPTY_SUMMARY };

  const values = data.map((d) => d[key]).sort((a, b) => a - b);
  const mean = values.reduce((acc, v) => acc + v, 0) / count;

  const sumSqDiff = values.reduce((acc, v) => acc + (v - mean) ** 2, 0);
  const variance = count > 1 ? sumSqDiff / (count - 1) : 0;

  const q1 = quantile(values, 0.25);
  const q3 = quantile(values, 0.75);

  return {
    mean,
    median: quantile(values, 0.5),
    sd: Math.sqrt(variance),
    variance,
    min: values[0],
    max: values[count - 1],
    q1,
    q3,
    iqr: q3 - q1,
    count
  };
}

/* ------------------------------------------------------------------ *
 * Correlation
 * ------------------------------------------------------------------ */

export interface CorrelationResult {
  r: number;
  n: number;
  tValue: number;
  df: number;
  pValue: number;
  significant: boolean;
  /** Fisher z-transform confidence bounds for r. */
  ciLower: number;
  ciUpper: number;
}

export function getPearsonCorrelation(
  data: HealthcareRecord[],
  xKey: NumericIndicatorKey,
  yKey: NumericIndicatorKey
): CorrelationResult {
  const n = data.length;
  const empty: CorrelationResult = {
    r: 0, n, tValue: 0, df: 0, pValue: NaN,
    significant: false, ciLower: 0, ciUpper: 0
  };
  if (n < 3) return empty;

  const xValues = data.map((d) => d[xKey]);
  const yValues = data.map((d) => d[yKey]);
  const xMean = xValues.reduce((a, b) => a + b, 0) / n;
  const yMean = yValues.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xValues[i] - xMean;
    const dy = yValues[i] - yMean;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  if (denX === 0 || denY === 0) return empty;

  const r = Math.max(-1, Math.min(1, num / Math.sqrt(denX * denY)));
  const df = n - 2;

  // Guard against |r| === 1, which would divide by zero.
  const denom = Math.sqrt(Math.max(1 - r * r, 1e-12));
  const tValue = (r * Math.sqrt(df)) / denom;
  const pValue = tTestPValue(tValue, df);

  // Fisher z-transform for the confidence interval of r.
  const clamped = Math.max(-0.999999, Math.min(0.999999, r));
  const z = 0.5 * Math.log((1 + clamped) / (1 - clamped));
  const se = 1 / Math.sqrt(n - 3);
  const zCrit = 1.959963985;
  const lo = Math.tanh(z - zCrit * se);
  const hi = Math.tanh(z + zCrit * se);

  return {
    r,
    n,
    tValue,
    df,
    pValue,
    significant: Number.isFinite(pValue) && pValue < 0.05,
    ciLower: lo,
    ciUpper: hi
  };
}

/** Full indicator-by-indicator correlation matrix. */
export function getCorrelationMatrix(
  data: HealthcareRecord[],
  keys: NumericIndicatorKey[]
): number[][] {
  return keys.map((rowKey) =>
    keys.map((colKey) =>
      rowKey === colKey ? 1 : getPearsonCorrelation(data, rowKey, colKey).r
    )
  );
}

/* ------------------------------------------------------------------ *
 * Ordinary least squares regression
 * ------------------------------------------------------------------ */

export interface RegressionPoint {
  country: string;
  year: number;
  x: number;
  y: number;
  py: number;
  residual: number;
}

export interface RegressionResult {
  slope: number;
  intercept: number;
  r2: number;
  adjustedR2: number;
  errorStd: number;
  slopeStdError: number;
  slopeT: number;
  slopePValue: number;
  slopeCiLower: number;
  slopeCiUpper: number;
  df: number;
  n: number;
  xMean: number;
  sumSqX: number;
  equation: string;
  points: RegressionPoint[];
  /** Same points sorted by x — required for drawing an unbroken fit line. */
  linePoints: { x: number; py: number }[];
  valid: boolean;
}

const EMPTY_REGRESSION: RegressionResult = {
  slope: 0, intercept: 0, r2: 0, adjustedR2: 0, errorStd: 0,
  slopeStdError: 0, slopeT: 0, slopePValue: NaN, slopeCiLower: 0, slopeCiUpper: 0,
  df: 0, n: 0, xMean: 0, sumSqX: 0, equation: "—", points: [], linePoints: [], valid: false
};

export function getLinearRegression(
  data: HealthcareRecord[],
  xKey: NumericIndicatorKey,
  yKey: NumericIndicatorKey
): RegressionResult {
  const n = data.length;
  if (n < 3) return { ...EMPTY_REGRESSION, n };

  const xValues = data.map((d) => d[xKey]);
  const yValues = data.map((d) => d[yKey]);
  const xMean = xValues.reduce((a, b) => a + b, 0) / n;
  const yMean = yValues.reduce((a, b) => a + b, 0) / n;

  let numCov = 0;
  let sumSqX = 0;
  for (let i = 0; i < n; i++) {
    const dx = xValues[i] - xMean;
    numCov += dx * (yValues[i] - yMean);
    sumSqX += dx * dx;
  }
  if (sumSqX === 0) return { ...EMPTY_REGRESSION, n };

  const slope = numCov / sumSqX;
  const intercept = yMean - slope * xMean;

  let sse = 0;
  let sst = 0;
  const points: RegressionPoint[] = data.map((d) => {
    const x = d[xKey];
    const y = d[yKey];
    const py = intercept + slope * x;
    sse += (y - py) ** 2;
    sst += (y - yMean) ** 2;
    return { country: d.country, year: d.year, x, y, py, residual: y - py };
  });

  const df = n - 2;
  const r2 = sst !== 0 ? 1 - sse / sst : 0;
  const adjustedR2 = df > 0 ? 1 - (1 - r2) * ((n - 1) / df) : 0;
  const errorStd = df > 0 ? Math.sqrt(sse / df) : 0;
  const slopeStdError = Math.sqrt(errorStd ** 2 / sumSqX);
  const slopeT = slopeStdError > 0 ? slope / slopeStdError : 0;
  const slopePValue = tTestPValue(slopeT, df);
  const crit = tCritical(df);

  const sign = slope >= 0 ? "+" : "−";
  const equation = `Y = ${intercept.toFixed(4)} ${sign} ${Math.abs(slope).toFixed(4)} · X`;

  // Two endpoints are enough for a straight line, and they cannot zigzag.
  const sortedX = [...xValues].sort((a, b) => a - b);
  const linePoints = [sortedX[0], sortedX[sortedX.length - 1]].map((x) => ({
    x,
    py: intercept + slope * x
  }));

  return {
    slope,
    intercept,
    r2,
    adjustedR2,
    errorStd,
    slopeStdError,
    slopeT,
    slopePValue,
    slopeCiLower: slope - crit * slopeStdError,
    slopeCiUpper: slope + crit * slopeStdError,
    df,
    n,
    xMean,
    sumSqX,
    equation,
    points,
    linePoints,
    valid: true
  };
}

export interface PredictionResult {
  predicted: number;
  lower: number;
  upper: number;
  extrapolating: boolean;
}

/**
 * Point forecast plus a 95% prediction interval for a single new observation.
 * The interval widens as x moves away from the mean of the fitted data.
 */
export function predictWithInterval(
  model: RegressionResult,
  x: number,
  observedMin: number,
  observedMax: number
): PredictionResult {
  const predicted = model.intercept + model.slope * x;
  if (!model.valid || model.df <= 0 || model.sumSqX === 0) {
    return { predicted, lower: predicted, upper: predicted, extrapolating: false };
  }
  const crit = tCritical(model.df);
  const margin =
    crit *
    model.errorStd *
    Math.sqrt(1 + 1 / model.n + (x - model.xMean) ** 2 / model.sumSqX);

  return {
    predicted,
    lower: predicted - margin,
    upper: predicted + margin,
    extrapolating: x < observedMin || x > observedMax
  };
}

/* ------------------------------------------------------------------ *
 * Two-group comparison (Welch's t-test)
 * ------------------------------------------------------------------ */

export interface GroupComparisonResult {
  gccMean: number;
  nonGccMean: number;
  gccSd: number;
  nonGccSd: number;
  gccCount: number;
  nonGccCount: number;
  difference: number;
  tValue: number;
  df: number;
  pValue: number;
  significant: boolean;
  ciLower: number;
  ciUpper: number;
  cohensD: number;
  valid: boolean;
}

const EMPTY_COMPARISON: GroupComparisonResult = {
  gccMean: 0, nonGccMean: 0, gccSd: 0, nonGccSd: 0,
  gccCount: 0, nonGccCount: 0, difference: 0, tValue: 0, df: 0,
  pValue: NaN, significant: false, ciLower: 0, ciUpper: 0, cohensD: 0, valid: false
};

export function compareGroupAverages(
  data: HealthcareRecord[],
  key: NumericIndicatorKey
): GroupComparisonResult {
  const gcc = data.filter((d) => d.isGcc).map((d) => d[key]);
  const nonGcc = data.filter((d) => !d.isGcc).map((d) => d[key]);

  const n1 = gcc.length;
  const n2 = nonGcc.length;
  if (n1 < 2 || n2 < 2) {
    return { ...EMPTY_COMPARISON, gccCount: n1, nonGccCount: n2 };
  }

  const mean1 = gcc.reduce((a, b) => a + b, 0) / n1;
  const mean2 = nonGcc.reduce((a, b) => a + b, 0) / n2;
  const var1 = gcc.reduce((acc, v) => acc + (v - mean1) ** 2, 0) / (n1 - 1);
  const var2 = nonGcc.reduce((acc, v) => acc + (v - mean2) ** 2, 0) / (n2 - 1);

  const difference = mean1 - mean2;
  const se = Math.sqrt(var1 / n1 + var2 / n2);

  if (se === 0) {
    return {
      ...EMPTY_COMPARISON,
      gccMean: mean1, nonGccMean: mean2,
      gccCount: n1, nonGccCount: n2,
      difference, valid: true
    };
  }

  const tValue = difference / se;

  // Welch–Satterthwaite degrees of freedom (groups have unequal size and spread).
  const df =
    (var1 / n1 + var2 / n2) ** 2 /
    ((var1 / n1) ** 2 / (n1 - 1) + (var2 / n2) ** 2 / (n2 - 1));

  const pValue = tTestPValue(tValue, df);
  const crit = tCritical(df);

  // Pooled standard deviation for Cohen's d.
  const pooledSd = Math.sqrt(
    ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2)
  );

  return {
    gccMean: mean1,
    nonGccMean: mean2,
    gccSd: Math.sqrt(var1),
    nonGccSd: Math.sqrt(var2),
    gccCount: n1,
    nonGccCount: n2,
    difference,
    tValue,
    df,
    pValue,
    significant: Number.isFinite(pValue) && pValue < 0.05,
    ciLower: difference - crit * se,
    ciUpper: difference + crit * se,
    cohensD: pooledSd > 0 ? difference / pooledSd : 0,
    valid: true
  };
}

/* ------------------------------------------------------------------ *
 * Trend analysis
 * ------------------------------------------------------------------ */

export interface TrendResult {
  country: string;
  firstYear: number;
  lastYear: number;
  firstValue: number;
  lastValue: number;
  absoluteChange: number;
  percentChange: number;
  /** Compound annual growth rate, in percent. */
  cagr: number;
  /** OLS slope against year: average change per year. */
  slopePerYear: number;
}

export function getTrendByCountry(
  data: HealthcareRecord[],
  key: NumericIndicatorKey
): TrendResult[] {
  const byCountry = new Map<string, HealthcareRecord[]>();
  for (const record of data) {
    const bucket = byCountry.get(record.country);
    if (bucket) bucket.push(record);
    else byCountry.set(record.country, [record]);
  }

  const results: TrendResult[] = [];
  byCountry.forEach((records, country) => {
    if (records.length < 2) return;
    const sorted = [...records].sort((a, b) => a.year - b.year);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const span = last.year - first.year;

    // Least-squares slope of value against year.
    const n = sorted.length;
    const yearMean = sorted.reduce((a, d) => a + d.year, 0) / n;
    const valueMean = sorted.reduce((a, d) => a + d[key], 0) / n;
    let cov = 0;
    let varYear = 0;
    for (const d of sorted) {
      const dy = d.year - yearMean;
      cov += dy * (d[key] - valueMean);
      varYear += dy * dy;
    }

    const firstValue = first[key];
    const lastValue = last[key];

    results.push({
      country,
      firstYear: first.year,
      lastYear: last.year,
      firstValue,
      lastValue,
      absoluteChange: lastValue - firstValue,
      percentChange: firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0,
      cagr:
        span > 0 && firstValue > 0 && lastValue > 0
          ? ((lastValue / firstValue) ** (1 / span) - 1) * 100
          : 0,
      slopePerYear: varYear !== 0 ? cov / varYear : 0
    });
  });

  return results.sort((a, b) => b.cagr - a.cagr);
}

/* ------------------------------------------------------------------ *
 * Interpretation helpers
 * ------------------------------------------------------------------ */

/** Maps |r| onto a translation key. Symmetric across the sign of r. */
export function correlationGuideKey(r: number): string {
  const magnitude = Math.abs(r);
  if (magnitude < 0.2) return "corrNoRel";
  if (r < 0) return magnitude >= 0.6 ? "corrResultStrongNeg" : "corrResultWeakNeg";
  return magnitude >= 0.6 ? "corrResultStrongPos" : "corrResultWeakPos";
}

/** Maps |Cohen's d| onto a translation key. */
export function effectSizeKey(d: number): string {
  const magnitude = Math.abs(d);
  if (magnitude < 0.2) return "effectNegligible";
  if (magnitude < 0.5) return "effectSmall";
  if (magnitude < 0.8) return "effectMedium";
  return "effectLarge";
}
