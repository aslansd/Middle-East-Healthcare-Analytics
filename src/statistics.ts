import { HealthcareRecord } from "./data";

export type NumericIndicatorKey =
  | "lifeExpectancy"
  | "expenditurePctGdp"
  | "infantMortality"
  | "physiciansPer1000"
  | "hospitalBedsPer1000";

export interface SummaryStats {
  mean: number;
  median: number;
  sd: number;
  min: number;
  max: number;
  count: number;
}

// 1. Calculates basic descriptive statistics for a subset
export function getSummaryStatistics(
  data: HealthcareRecord[],
  key: NumericIndicatorKey
): SummaryStats {
  const count = data.length;
  if (count === 0) {
    return { mean: 0, median: 0, sd: 0, min: 0, max: 0, count: 0 };
  }

  const values = data.map((d) => d[key]).sort((a, b) => a - b);
  const sum = values.reduce((acc, v) => acc + v, 0);
  const mean = sum / count;

  // Median
  const mid = Math.floor(count / 2);
  const median = count % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;

  // Standard deviation (sample sd: n-1)
  const sumSqDiff = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
  const sd = count > 1 ? Math.sqrt(sumSqDiff / (count - 1)) : 0;

  const min = values[0];
  const max = values[count - 1];

  return { mean, median, sd, min, max, count };
}

// 2. Calculates Pearson Correlation Coefficient r between X and Y
export function getPearsonCorrelation(
  data: HealthcareRecord[],
  xKey: NumericIndicatorKey,
  yKey: NumericIndicatorKey
): number {
  const n = data.length;
  if (n < 2) return 0;

  const xValues = data.map((d) => d[xKey]);
  const yValues = data.map((d) => d[yKey]);

  const xSum = xValues.reduce((a, b) => a + b, 0);
  const ySum = yValues.reduce((a, b) => a + b, 0);

  const xMean = xSum / n;
  const yMean = ySum / n;

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

  if (denX === 0 || denY === 0) return 0;

  return num / Math.sqrt(denX * denY);
}

export interface RegressionResult {
  slope: number;
  intercept: number;
  r2: number;
  errorStd: number;
  equation: string;
  points: { country: string; year: number; x: number; y: number; py: number }[];
}

// 3. Fits Simple OLS Linear Regression y = beta_0 + beta_1 * x
export function getLinearRegression(
  data: HealthcareRecord[],
  xKey: NumericIndicatorKey,
  yKey: NumericIndicatorKey
): RegressionResult {
  const n = data.length;
  if (n < 2) {
    return { slope: 0, intercept: 0, r2: 0, errorStd: 0, equation: "Y = 0", points: [] };
  }

  const xValues = data.map((d) => d[xKey]);
  const yValues = data.map((d) => d[yKey]);

  const xSum = xValues.reduce((a, b) => a + b, 0);
  const ySum = yValues.reduce((a, b) => a + b, 0);

  const xMean = xSum / n;
  const yMean = ySum / n;

  let numCov = 0;
  let denVarX = 0;

  for (let i = 0; i < n; i++) {
    const dx = xValues[i] - xMean;
    const dy = yValues[i] - yMean;
    numCov += dx * dy;
    denVarX += dx * dx;
  }

  const slope = denVarX !== 0 ? numCov / denVarX : 0;
  const intercept = yMean - slope * xMean;

  // Calculate R^2 coefficient of determination
  // R^2 = SSR / SST = 1 - (SSE / SST)
  let sse = 0;
  let sst = 0;

  const points = data.map((d) => {
    const x = d[xKey];
    const y = d[yKey];
    const py = intercept + slope * x; // predicted Y
    sse += Math.pow(y - py, 2);
    sst += Math.pow(y - yMean, 2);
    return {
      country: d.country,
      year: d.year,
      x,
      y,
      py
    };
  });

  const r2 = sst !== 0 ? 1 - sse / sst : 1;
  const errorStd = n > 2 ? Math.sqrt(sse / (n - 2)) : 0;

  const sign = slope >= 0 ? "+" : "-";
  const absSlope = Math.abs(slope).toFixed(4);
  const equation = `Y = ${intercept.toFixed(4)} ${sign} ${absSlope} * X`;

  return {
    slope,
    intercept,
    r2,
    errorStd,
    equation,
    points
  };
}

export interface GroupComparisonResult {
  gccMean: number;
  nonGccMean: number;
  difference: number;
  tValue: number; // calculated standard t-statistic for information
  significant: boolean;
}

// 4. Group Comparison between GCC (high income) vs Non-GCC developing economies
export function compareGroupAverages(
  data: HealthcareRecord[],
  key: NumericIndicatorKey
): GroupComparisonResult {
  const gccPoints = data.filter((d) => d.isGcc);
  const nonGccPoints = data.filter((d) => !d.isGcc);

  const gccCount = gccPoints.length;
  const nonGccCount = nonGccPoints.length;

  if (gccCount === 0 || nonGccCount === 0) {
    return { gccMean: 0, nonGccMean: 0, difference: 0, tValue: 0, significant: false };
  }

  const gccSum = gccPoints.reduce((acc, d) => acc + d[key], 0);
  const nonGccSum = nonGccPoints.reduce((acc, d) => acc + d[key], 0);

  const gccMean = gccSum / gccCount;
  const nonGccMean = nonGccSum / nonGccCount;
  const difference = gccMean - nonGccMean;

  // Standard Two-Sample t-test for equal or unequal variance
  // We can approximate variance
  const gccSqDiffSum = gccPoints.reduce((acc, d) => acc + Math.pow(d[key] - gccMean, 2), 0);
  const nonGccSqDiffSum = nonGccPoints.reduce((acc, d) => acc + Math.pow(d[key] - nonGccMean, 2), 0);

  const gccVar = gccCount > 1 ? gccSqDiffSum / (gccCount - 1) : 0.01;
  const nonGccVar = nonGccCount > 1 ? nonGccSqDiffSum / (nonGccCount - 1) : 0.01;

  // t-stat formula
  const denominator = Math.sqrt((gccVar / gccCount) + (nonGccVar / nonGccCount));
  const tValue = denominator !== 0 ? difference / denominator : 0;

  // Simple significance threshold based on t-critical value ~ 1.96 for normal sample sizes
  const significant = Math.abs(tValue) >= 1.96;

  return {
    gccMean,
    nonGccMean,
    difference,
    tValue,
    significant
  };
}
