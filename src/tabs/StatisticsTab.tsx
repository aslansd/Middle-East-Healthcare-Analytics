import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  ErrorBar,
  Legend,
  Line,
  Scatter,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { AlertTriangle, Grid3x3, Info, Sigma } from "lucide-react";
import { INDICATORS, INDICATOR_BY_ID } from "../data";
import type { HealthcareRecord, IndicatorId } from "../data";
import {
  compareGroupAverages,
  correlationGuideKey,
  effectSizeKey,
  formatPValue,
  getLinearRegression,
  getPearsonCorrelation,
  predictWithInterval
} from "../statistics";
import type { NumericIndicatorKey } from "../statistics";
import { CHART_COLORS } from "../theme";
import type { ThemeMode } from "../theme";
import {
  ChartFrame,
  EmptyState,
  Eyebrow,
  LabelledSelect,
  Panel,
  SignificanceBadge,
  StatTile
} from "../components/ui";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { CorrelationMatrix } from "../components/CorrelationMatrix";

interface StatisticsTabProps {
  data: HealthcareRecord[];
  regressionX: IndicatorId;
  regressionY: IndicatorId;
  groupIndicator: IndicatorId;
  onRegressionXChange: (id: IndicatorId) => void;
  onRegressionYChange: (id: IndicatorId) => void;
  onGroupIndicatorChange: (id: IndicatorId) => void;
  theme: ThemeMode;
  t: (key: string) => string;
}

export function StatisticsTab({
  data,
  regressionX,
  regressionY,
  groupIndicator,
  onRegressionXChange,
  onRegressionYChange,
  onGroupIndicatorChange,
  theme,
  t
}: StatisticsTabProps) {
  const chartColors = CHART_COLORS[theme];
  const xConfig = INDICATOR_BY_ID[regressionX];
  const yConfig = INDICATOR_BY_ID[regressionY];

  const correlation = useMemo(
    () =>
      getPearsonCorrelation(
        data,
        regressionX as NumericIndicatorKey,
        regressionY as NumericIndicatorKey
      ),
    [data, regressionX, regressionY]
  );

  const regression = useMemo(
    () =>
      getLinearRegression(
        data,
        regressionX as NumericIndicatorKey,
        regressionY as NumericIndicatorKey
      ),
    [data, regressionX, regressionY]
  );

  const comparison = useMemo(
    () => compareGroupAverages(data, groupIndicator as NumericIndicatorKey),
    [data, groupIndicator]
  );

  // Observed range of X, used to bound the slider and flag extrapolation.
  const xRange = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 1, mean: 0.5 };
    const values = data.map((d) => d[regressionX as NumericIndicatorKey]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return {
      min,
      max,
      mean: values.reduce((a, b) => a + b, 0) / values.length
    };
  }, [data, regressionX]);

  const [predictorValue, setPredictorValue] = useState(xRange.mean);

  // Re-centre the slider whenever the X variable or the scope changes.
  useEffect(() => {
    setPredictorValue(Number(xRange.mean.toFixed(2)));
  }, [xRange.mean]);

  const prediction = useMemo(
    () => predictWithInterval(regression, predictorValue, xRange.min, xRange.max),
    [regression, predictorValue, xRange.min, xRange.max]
  );

  const sliderMin = Number((xRange.min - (xRange.max - xRange.min) * 0.15).toFixed(2));
  const sliderMax = Number((xRange.max + (xRange.max - xRange.min) * 0.15).toFixed(2));
  const sliderStep = Math.max(0.01, Number(((sliderMax - sliderMin) / 200).toFixed(3)));

  if (data.length < 3) {
    return (
      <Panel>
        <EmptyState message={t("scopeTooFew")} />
      </Panel>
    );
  }

  const sameVariable = regressionX === regressionY;

  return (
    <div className="space-y-8">
      {/* Intro + variable pickers */}
      <Panel className="p-6 sm:p-8">
        <div className="max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300 text-xs font-semibold rounded-full">
            <Sigma className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Bivariate analysis · n = {data.length}</span>
          </div>
          <h2 className="text-2xl font-bold text-ink font-display">{t("statIntro")}</h2>
          <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
            {t("statIntroDesc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-6 border-t border-hairline">
          <div className="space-y-1.5">
            <label
              htmlFor="regression-x"
              className="text-xs font-bold text-muted uppercase tracking-wider block"
            >
              {t("selectX")}
            </label>
            <select
              id="regression-x"
              value={regressionX}
              onChange={(event) => onRegressionXChange(event.target.value as IndicatorId)}
              className="px-3 py-2 text-xs bg-raised border border-line rounded-lg font-bold text-ink outline-none w-full focus:border-teal-500 cursor-pointer"
            >
              {INDICATORS.map((config) => (
                <option key={config.id} value={config.id}>
                  {t(config.labelKey)} ({config.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="regression-y"
              className="text-xs font-bold text-muted uppercase tracking-wider block"
            >
              {t("selectY")}
            </label>
            <select
              id="regression-y"
              value={regressionY}
              onChange={(event) => onRegressionYChange(event.target.value as IndicatorId)}
              className="px-3 py-2 text-xs bg-raised border border-line rounded-lg font-bold text-ink outline-none w-full focus:border-teal-500 cursor-pointer"
            >
              {INDICATORS.map((config) => (
                <option key={config.id} value={config.id}>
                  {t(config.labelKey)} ({config.unit})
                </option>
              ))}
            </select>
          </div>
        </div>

        {sameVariable && (
          <p className="mt-3 text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            X and Y are the same variable, so the fit is trivially perfect. Pick two
            different indicators.
          </p>
        )}

        <p className="mt-4 text-[11px] text-faint leading-relaxed flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
          {t("independenceCaveat")}
        </p>
      </Panel>

      {/* Correlation + scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel className="p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-hairline pb-3">
              <Eyebrow>Analysis 1</Eyebrow>
              <h4 className="text-base font-bold text-ink font-display mt-0.5">
                {t("correlationTab")}
              </h4>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted uppercase tracking-tight">
                {t("corrMethod")}
              </p>
              <code className="text-[11px] bg-raised px-2 py-1.5 rounded-md border border-hairline block text-center font-mono font-bold text-teal-700 dark:text-teal-300 overflow-x-auto">
                {t("corrFormulaStr")}
              </code>
            </div>

            <div className="bg-raised p-4 border border-hairline rounded-xl space-y-1 text-center">
              <p className="text-xs text-muted font-semibold">{t("corrOutcome")}</p>
              <div className="text-3xl font-extrabold text-ink font-mono tracking-tight">
                {correlation.r >= 0 ? "+" : "−"}
                {Math.abs(correlation.r).toFixed(4)}
              </div>
              <p className="text-[10px] text-faint font-medium">
                R² = {(correlation.r ** 2).toFixed(4)} · n = {correlation.n}
              </p>
            </div>

            <dl className="space-y-1.5 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-muted">{t("pValueLabel")}</dt>
                <dd className="font-mono font-bold text-ink">
                  {formatPValue(correlation.pValue)}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">{t("ciLabel")}</dt>
                <dd className="font-mono font-bold text-ink">
                  [{correlation.ciLower.toFixed(3)}, {correlation.ciUpper.toFixed(3)}]
                </dd>
              </div>
              <div className="flex justify-between items-center gap-2 pt-1">
                <dt className="text-muted">α = 0.05</dt>
                <dd>
                  <SignificanceBadge
                    significant={correlation.significant}
                    yesLabel={t("significantYes")}
                    noLabel={t("significantNo")}
                  />
                </dd>
              </div>
            </dl>

            <div className="space-y-2">
              <h5 className="text-xs font-bold text-ink">{t("corrInterpretation")}</h5>
              <p className="text-xs text-ink-soft leading-relaxed">
                {t(correlationGuideKey(correlation.r))}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-faint italic leading-relaxed pt-4 border-t border-hairline mt-6">
            {t("corrInterpretationText")}
          </p>
        </Panel>

        <Panel className="p-6 lg:col-span-2">
          <div className="flex justify-between items-start gap-4 mb-5 pb-3 border-b border-hairline">
            <div>
              <h4 className="text-sm font-bold text-ink uppercase tracking-wider">
                Scatter plot &amp; OLS fit
              </h4>
              <p className="text-xs text-faint mt-0.5">
                {t(xConfig.labelKey)} → {t(yConfig.labelKey)}
              </p>
            </div>
            <span className="bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 text-xs font-bold px-2.5 py-1 rounded-md font-mono whitespace-nowrap">
              Y = b₀ + b₁X
            </span>
          </div>

          <div className="h-72 w-full">
            <ErrorBoundary resetKey={`${regressionX}-${regressionY}-${data.length}`}>
              <ChartFrame
                label={`Scatter plot of ${t(yConfig.labelKey)} against ${t(xConfig.labelKey)} with fitted regression line`}
              >
                {(width, height) => (
                  <ComposedChart
                    width={width}
                    height={height}
                    margin={{ top: 8, right: 24, left: 4, bottom: 28 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis
                      type="number"
                      dataKey="x"
                      stroke={chartColors.axis}
                      fontSize={11}
                      domain={["dataMin", "dataMax"]}
                      tickMargin={8}
                      allowDuplicatedCategory={false}
                      label={{
                        value: `${t(xConfig.labelKey)} (${xConfig.unit})`,
                        position: "insideBottom",
                        offset: -18,
                        style: { fontSize: 10, fill: chartColors.axis }
                      }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      stroke={chartColors.axis}
                      fontSize={11}
                      domain={["auto", "auto"]}
                      width={52}
                      label={{
                        value: yConfig.unit,
                        angle: -90,
                        position: "insideLeft",
                        style: { fontSize: 10, fill: chartColors.axis }
                      }}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const point = payload[0].payload;
                        if (point?.country === undefined) return null;
                        return (
                          <div className="bg-surface border border-line p-2.5 rounded-lg shadow-lg text-xs font-sans">
                            <p className="font-bold text-ink mb-1 border-b border-hairline pb-1">
                              {point.country} ({point.year})
                            </p>
                            <p className="text-muted text-[11px]">
                              X:{" "}
                              <span className="font-mono font-bold text-ink">
                                {Number(point.x).toFixed(2)}
                              </span>
                            </p>
                            <p className="text-muted text-[11px]">
                              Y observed:{" "}
                              <span className="font-mono font-bold text-ink">
                                {Number(point.y).toFixed(2)}
                              </span>
                            </p>
                            <p className="text-teal-600 dark:text-teal-400 text-[11px]">
                              Y fitted:{" "}
                              <span className="font-mono font-bold">
                                {Number(point.py).toFixed(2)}
                              </span>
                            </p>
                            <p className="text-muted text-[11px]">
                              Residual:{" "}
                              <span className="font-mono font-bold text-ink">
                                {Number(point.residual) >= 0 ? "+" : ""}
                                {Number(point.residual).toFixed(2)}
                              </span>
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={30}
                      wrapperStyle={{ fontSize: "11px" }}
                    />

                    {/* Observations. Given their own data array so the fitted
                        line is not forced to follow the record ordering. */}
                    <Scatter
                      name={`Observations (n = ${regression.n})`}
                      data={regression.points}
                      dataKey="y"
                      fill={chartColors.scatter}
                      isAnimationActive={false}
                    />

                    {/* Fitted line: two endpoints sorted by x, so it renders as
                        a straight line rather than zigzagging between records. */}
                    <Line
                      name="OLS line of best fit"
                      data={regression.linePoints}
                      dataKey="py"
                      stroke={chartColors.fit}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={false}
                      isAnimationActive={false}
                    />
                  </ComposedChart>
                )}
              </ChartFrame>
            </ErrorBoundary>
          </div>
        </Panel>
      </div>

      {/* Correlation matrix */}
      <Panel className="p-6">
        <div className="flex items-start gap-3 mb-5 pb-4 border-b border-hairline">
          <div className="text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/15 p-2 rounded-lg shrink-0">
            <Grid3x3 className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink font-display">
              {t("corrMatrixTitle")}
            </h3>
            <p className="text-xs text-muted mt-0.5">{t("corrMatrixDesc")}</p>
          </div>
        </div>

        <ErrorBoundary resetKey={data.length}>
          <CorrelationMatrix
            data={data}
            isDark={theme === "dark"}
            t={t}
            activePair={{
              x: regressionX as NumericIndicatorKey,
              y: regressionY as NumericIndicatorKey
            }}
            onSelectPair={(x, y) => {
              onRegressionXChange(x as IndicatorId);
              onRegressionYChange(y as IndicatorId);
            }}
          />
        </ErrorBoundary>
      </Panel>

      {/* Regression detail + prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel className="p-6 lg:col-span-2 space-y-4">
          <div className="border-b border-hairline pb-2">
            <Eyebrow>OLS estimates</Eyebrow>
            <h4 className="text-base font-bold text-ink font-display mt-0.5">
              {t("regressionSub")}
            </h4>
          </div>

          <p className="text-xs text-ink-soft leading-relaxed">{t("regressionDesc")}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatTile
              label="Slope (β₁)"
              value={regression.slope.toFixed(4)}
              hint={`SE ${regression.slopeStdError.toFixed(4)}`}
            />
            <StatTile
              label="Intercept (β₀)"
              value={regression.intercept.toFixed(4)}
              hint="Y at X = 0"
            />
            <StatTile
              label="R²"
              value={`${(regression.r2 * 100).toFixed(2)}%`}
              hint={`${t("adjustedR2Label")} ${(regression.adjustedR2 * 100).toFixed(2)}%`}
              emphasis
            />
            <StatTile
              label={t("residualSeLabel")}
              value={regression.errorStd.toFixed(4)}
              hint={`df = ${regression.df}`}
            />
          </div>

          {/* Inference on the slope */}
          <div className="p-4 bg-raised rounded-xl border border-hairline space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-faint">
                Is the slope different from zero?
              </span>
              <SignificanceBadge
                significant={
                  Number.isFinite(regression.slopePValue) && regression.slopePValue < 0.05
                }
                yesLabel={t("significantYes")}
                noLabel={t("significantNo")}
              />
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="flex justify-between sm:flex-col sm:gap-0.5">
                <dt className="text-muted">t</dt>
                <dd className="font-mono font-bold text-ink">
                  {regression.slopeT.toFixed(4)}
                </dd>
              </div>
              <div className="flex justify-between sm:flex-col sm:gap-0.5">
                <dt className="text-muted">{t("pValueLabel")}</dt>
                <dd className="font-mono font-bold text-ink">
                  {formatPValue(regression.slopePValue)}
                </dd>
              </div>
              <div className="flex justify-between sm:flex-col sm:gap-0.5">
                <dt className="text-muted">{t("slopeCiLabel")}</dt>
                <dd className="font-mono font-bold text-ink">
                  [{regression.slopeCiLower.toFixed(4)}, {regression.slopeCiUpper.toFixed(4)}]
                </dd>
              </div>
            </dl>
          </div>

          <div className="p-3 bg-raised rounded-xl border border-hairline space-y-1.5">
            <p className="font-bold text-muted uppercase tracking-wider text-[9px]">
              Fitted model
            </p>
            <div className="font-mono text-xs bg-slate-900 dark:bg-inverse text-teal-400 p-2.5 rounded-lg text-center font-bold overflow-x-auto">
              {regression.equation}
            </div>
            <p className="text-[10px] text-faint leading-relaxed">
              {t("formulaUsedRegression")}
            </p>
          </div>
        </Panel>

        {/* Prediction sandbox */}
        <Panel className="p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-hairline pb-2">
              <Eyebrow tone="rose">Forecast</Eyebrow>
              <h4 className="text-base font-bold text-ink font-display mt-0.5">
                Predict an outcome
              </h4>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Move the slider to set{" "}
              <span className="font-bold text-ink-soft">{t(xConfig.labelKey)}</span> and
              the fitted model forecasts{" "}
              <span className="font-bold text-ink-soft">{t(yConfig.labelKey)}</span>.
            </p>

            <div className="space-y-2 bg-raised p-4 border border-hairline rounded-xl">
              <div className="flex justify-between items-center text-xs">
                <label
                  htmlFor="prediction-slider"
                  className="font-semibold text-muted uppercase tracking-tight"
                >
                  X input
                </label>
                <span className="font-bold text-ink font-mono">
                  {predictorValue.toFixed(2)} {xConfig.unit}
                </span>
              </div>

              <input
                id="prediction-slider"
                type="range"
                min={sliderMin}
                max={sliderMax}
                step={sliderStep}
                value={predictorValue}
                onChange={(event) => setPredictorValue(parseFloat(event.target.value))}
                className="w-full h-1 bg-line rounded-lg appearance-none cursor-pointer accent-teal-600"
              />

              <div className="flex justify-between text-[10px] text-faint font-mono">
                <span>{sliderMin.toFixed(1)}</span>
                <span>
                  {t("observedRange")}: {xRange.min.toFixed(1)}–{xRange.max.toFixed(1)}
                </span>
                <span>{sliderMax.toFixed(1)}</span>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-teal-600 to-cyan-500 text-white rounded-xl text-center space-y-1 shadow-md">
              <span className="text-[9px] uppercase font-bold tracking-wider text-teal-50">
                Predicted {t(yConfig.labelKey)}
              </span>
              <p className="text-2xl font-extrabold font-mono">
                {prediction.predicted.toFixed(2)}
              </p>
              <span className="text-[9px] text-teal-50 font-medium block">
                {t("predictionIntervalLabel")}: {prediction.lower.toFixed(2)} to{" "}
                {prediction.upper.toFixed(2)}
              </span>
            </div>

            {prediction.extrapolating && (
              <p className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold flex items-start gap-1.5 leading-relaxed">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                {t("extrapolationWarning")}
              </p>
            )}
          </div>
        </Panel>
      </div>

      {/* Group comparison */}
      <Panel className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-hairline">
          <div>
            <h3 className="text-base font-bold text-ink font-display">
              {t("groupComparisonTab")}
            </h3>
            <p className="text-xs text-muted mt-1">{t("groupComparisonSub")}</p>
          </div>

          <LabelledSelect
            id="group-indicator"
            label={t("selectIndicator")}
            value={groupIndicator}
            onChange={(value) => onGroupIndicatorChange(value as IndicatorId)}
          >
            {INDICATORS.map((config) => (
              <option key={config.id} value={config.id}>
                {t(config.labelKey)}
              </option>
            ))}
          </LabelledSelect>
        </div>

        {!comparison.valid ? (
          <EmptyState message={t("scopeTooFew")} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-64">
              <ErrorBoundary resetKey={groupIndicator}>
                <ChartFrame
                  label={`Group means for ${t(INDICATOR_BY_ID[groupIndicator].labelKey)} with standard deviation error bars`}
                >
                  {(width, height) => (
                    <BarChart
                      width={width}
                      height={height}
                      data={[
                        {
                          name: `${t("gccGroupAvg")} (n=${comparison.gccCount})`,
                          value: comparison.gccMean,
                          error: comparison.gccSd
                        },
                        {
                          name: `${t("nonGccGroupAvg")} (n=${comparison.nonGccCount})`,
                          value: comparison.nonGccMean,
                          error: comparison.nonGccSd
                        }
                      ]}
                      margin={{ top: 10, right: 24, left: 4, bottom: 4 }}
                      barSize={64}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                      <XAxis
                        dataKey="name"
                        stroke={chartColors.axis}
                        fontSize={11}
                        tickMargin={8}
                      />
                      <YAxis
                        stroke={chartColors.axis}
                        fontSize={11}
                        domain={[0, "auto"]}
                        width={48}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(148,163,184,0.12)" }}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const point = payload[0].payload;
                          return (
                            <div className="bg-surface border border-line p-2.5 rounded-lg shadow-lg text-xs">
                              <p className="font-bold text-ink mb-1">{point.name}</p>
                              <p className="text-muted">
                                Mean:{" "}
                                <span className="font-mono font-bold text-ink">
                                  {Number(point.value).toFixed(3)}
                                </span>
                              </p>
                              <p className="text-muted">
                                SD:{" "}
                                <span className="font-mono font-bold text-ink">
                                  ±{Number(point.error).toFixed(3)}
                                </span>
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} isAnimationActive={false}>
                        <Cell fill={chartColors.groupA} />
                        <Cell fill={chartColors.groupB} />
                        <ErrorBar
                          dataKey="error"
                          width={6}
                          strokeWidth={1.5}
                          stroke={chartColors.axis}
                          direction="y"
                        />
                      </Bar>
                    </BarChart>
                  )}
                </ChartFrame>
              </ErrorBoundary>
            </div>

            <div className="p-5 bg-raised border border-hairline rounded-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <Eyebrow tone="violet">Welch&apos;s t-test</Eyebrow>

                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted">{t("gccGroupAvg")}</dt>
                    <dd className="font-bold text-ink font-mono">
                      {comparison.gccMean.toFixed(3)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted">{t("nonGccGroupAvg")}</dt>
                    <dd className="font-bold text-ink font-mono">
                      {comparison.nonGccMean.toFixed(3)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2 border-t border-line pt-2 font-bold">
                    <dt className="text-muted">{t("statDiff")}</dt>
                    <dd className="text-teal-700 dark:text-teal-300 font-mono">
                      {comparison.difference >= 0 ? "+" : ""}
                      {comparison.difference.toFixed(3)}
                    </dd>
                  </div>
                </dl>

                <div className="p-3 bg-surface border border-line rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center gap-2 text-xs">
                    <span className="font-semibold text-muted">t</span>
                    <span className="font-mono font-bold text-ink">
                      {comparison.tValue.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2 text-xs">
                    <span className="font-semibold text-muted">{t("dfLabel")}</span>
                    <span className="font-mono font-bold text-ink">
                      {comparison.df.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2 text-xs">
                    <span className="font-semibold text-muted">{t("pValueLabel")}</span>
                    <span className="font-mono font-bold text-ink">
                      {formatPValue(comparison.pValue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2 text-xs">
                    <span className="font-semibold text-muted">{t("ciLabel")}</span>
                    <span className="font-mono font-bold text-ink">
                      [{comparison.ciLower.toFixed(2)}, {comparison.ciUpper.toFixed(2)}]
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2 text-xs">
                    <span className="font-semibold text-muted">{t("effectSizeLabel")}</span>
                    <span className="font-mono font-bold text-ink">
                      {comparison.cohensD.toFixed(3)}{" "}
                      <span className="font-sans text-[10px] text-muted">
                        ({t(effectSizeKey(comparison.cohensD))})
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2 pt-1">
                    <span className="font-semibold text-muted text-xs">α = 0.05</span>
                    <SignificanceBadge
                      significant={comparison.significant}
                      yesLabel={t("significantYes")}
                      noLabel={t("significantNo")}
                    />
                  </div>
                </div>

                <p className="text-[10px] text-faint leading-relaxed">{t("welchNote")}</p>
              </div>

              <p className="text-xs text-muted mt-4 leading-relaxed">
                {comparison.difference >= 0
                  ? t("compPositiveDiff")
                  : t("compNegativeDiff")}
              </p>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
