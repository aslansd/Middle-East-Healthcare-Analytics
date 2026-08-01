import { useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, Info, Minus, Sparkles, Stethoscope, TrendingUp } from "lucide-react";
import { INDICATORS, INDICATOR_BY_ID } from "../data";
import type { HealthcareRecord, IndicatorId } from "../data";
import { getSummaryStatistics, getTrendByCountry } from "../statistics";
import type { NumericIndicatorKey } from "../statistics";
import { COUNTRY_COLORS } from "../theme";
import type { ThemeMode } from "../theme";
import { EmptyState, Eyebrow, LabelledSelect, Panel } from "../components/ui";

interface DashboardTabProps {
  data: HealthcareRecord[];
  indicator: IndicatorId;
  onIndicatorChange: (id: IndicatorId) => void;
  theme: ThemeMode;
  t: (key: string) => string;
}

export function DashboardTab({
  data,
  indicator,
  onIndicatorChange,
  theme,
  t
}: DashboardTabProps) {
  const kpis = useMemo(() => {
    if (data.length === 0) return null;

    const avgLife =
      data.reduce((acc, d) => acc + d.lifeExpectancy, 0) / data.length;
    const avgExpenditure =
      data.reduce((acc, d) => acc + d.expenditurePctGdp, 0) / data.length;

    const bestLife = data.reduce((best, current) =>
      current.lifeExpectancy > best.lifeExpectancy ? current : best
    );
    const bestMortality = data.reduce((best, current) =>
      current.infantMortality < best.infantMortality ? current : best
    );

    return {
      total: data.length,
      countries: new Set(data.map((d) => d.country)).size,
      years: new Set(data.map((d) => d.year)).size,
      avgLife: avgLife.toFixed(1),
      avgExpenditure: avgExpenditure.toFixed(2),
      bestLife: `${bestLife.lifeExpectancy} (${bestLife.country}, ${bestLife.year})`,
      bestMortality: `${bestMortality.infantMortality} (${bestMortality.country}, ${bestMortality.year})`
    };
  }, [data]);

  const trends = useMemo(
    () => getTrendByCountry(data, indicator as NumericIndicatorKey),
    [data, indicator]
  );

  const indicatorConfig = INDICATOR_BY_ID[indicator];
  const colors = COUNTRY_COLORS[theme];

  if (!kpis) {
    return (
      <Panel>
        <EmptyState message={t("noDataScope")} />
      </Panel>
    );
  }

  return (
    <div className="space-y-8">
      {/* Regional introduction */}
      <Panel className="p-6 sm:p-8">
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300 text-xs font-semibold rounded-full">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>WHO &amp; World Bank indicators</span>
          </div>
          <h2 className="text-2xl font-bold text-ink font-display">
            {t("regionalInsights")}
          </h2>
          <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
            {t("insightText")}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-8 pt-6 border-t border-hairline">
          <KpiCard
            label={t("totalDataPoints")}
            value={String(kpis.total)}
            hint={`${kpis.countries} × ${kpis.years} ${t("scopeYears").toLowerCase()}`}
            mono
          />
          <KpiCard
            label={t("avgLifeExpectancy")}
            value={`${kpis.avgLife}`}
            hint="years"
            tone="teal"
            mono
          />
          <KpiCard label={t("highestLifeExp")} value={kpis.bestLife} small />
          <KpiCard label={t("lowestMortality")} value={kpis.bestMortality} small />
          <KpiCard
            label={t("avgExpGdp")}
            value={`${kpis.avgExpenditure}%`}
            hint="share of GDP"
            tone="violet"
            mono
          />
        </div>
      </Panel>

      {/* Pandemic note */}
      <div className="bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/25 rounded-xl p-5 flex items-start gap-4">
        <div className="p-2.5 bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 rounded-lg shrink-0">
          <Info className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-ink">{t("covidImpactTitle")}</h4>
          <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
            {t("covidImpactDesc")}
          </p>
        </div>
      </div>

      {/* Per-indicator descriptive summary */}
      <section className="space-y-6">
        <h3 className="text-lg font-bold text-ink tracking-tight font-display border-s-4 border-teal-500 ps-2.5">
          {t("overallSummary")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {INDICATORS.map((config) => {
            const stats = getSummaryStatistics(data, config.id as NumericIndicatorKey);
            return (
              <Panel key={config.id} className="p-4 hover:shadow-md transition-shadow">
                <p className="text-xs font-semibold text-muted uppercase tracking-tight line-clamp-2 min-h-[2rem]">
                  {t(config.labelKey)}
                </p>

                <div className="mt-2.5 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-ink font-mono">
                    {stats.mean.toFixed(2)}
                  </span>
                  <span className="text-xs text-faint font-medium">{config.unit}</span>
                </div>

                <dl className="mt-3.5 space-y-1.5 pt-3.5 border-t border-hairline text-xs">
                  <div className="flex justify-between text-muted">
                    <dt>Min</dt>
                    <dd className="font-semibold text-ink font-mono">
                      {stats.min.toFixed(1)}
                    </dd>
                  </div>
                  <div className="flex justify-between text-muted">
                    <dt>Median</dt>
                    <dd className="font-semibold text-ink font-mono">
                      {stats.median.toFixed(1)}
                    </dd>
                  </div>
                  <div className="flex justify-between text-muted">
                    <dt>Max</dt>
                    <dd className="font-semibold text-ink font-mono">
                      {stats.max.toFixed(1)}
                    </dd>
                  </div>
                  <div className="flex justify-between text-muted">
                    <dt>SD (s)</dt>
                    <dd className="font-semibold text-teal-600 dark:text-teal-400 font-mono">
                      {stats.sd.toFixed(2)}
                    </dd>
                  </div>
                </dl>
              </Panel>
            );
          })}
        </div>
      </section>

      {/* Trend analysis */}
      <Panel className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-5 border-b border-hairline">
          <div>
            <Eyebrow>{t("trendCagr")}</Eyebrow>
            <h3 className="text-lg font-bold text-ink font-display mt-0.5">
              {t("trendTitle")}
            </h3>
            <p className="text-xs text-muted mt-1">{t("trendDesc")}</p>
          </div>

          <LabelledSelect
            id="dashboard-trend-indicator"
            label={t("selectIndicator")}
            value={indicator}
            onChange={(value) => onIndicatorChange(value as IndicatorId)}
          >
            {INDICATORS.map((config) => (
              <option key={config.id} value={config.id}>
                {t(config.labelKey)}
              </option>
            ))}
          </LabelledSelect>
        </div>

        {trends.length === 0 ? (
          <EmptyState message={t("scopeTooFew")} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-faint uppercase tracking-tight text-[10px]">
                  <th scope="col" className="p-2 text-start font-bold">
                    {t("country")}
                  </th>
                  <th scope="col" className="p-2 text-end font-bold">
                    {trends[0].firstYear}
                  </th>
                  <th scope="col" className="p-2 text-end font-bold">
                    {trends[0].lastYear}
                  </th>
                  <th scope="col" className="p-2 text-end font-bold">
                    {t("trendChange")}
                  </th>
                  <th scope="col" className="p-2 text-end font-bold">
                    {t("trendPerYear")}
                  </th>
                  <th scope="col" className="p-2 text-end font-bold">
                    {t("trendCagr")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {trends.map((trend) => {
                  // "Good" depends on the indicator: falling infant mortality is good.
                  const improving = indicatorConfig.lowerIsBetter
                    ? trend.absoluteChange < 0
                    : trend.absoluteChange > 0;
                  const flat = Math.abs(trend.absoluteChange) < 1e-9;

                  return (
                    <tr key={trend.country} className="hover:bg-raised transition-colors">
                      <td className="p-2 font-bold text-ink">
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: colors[trend.country] ?? "#94a3b8" }}
                            aria-hidden="true"
                          />
                          {trend.country}
                        </span>
                      </td>
                      <td className="p-2 text-end font-mono text-muted">
                        {trend.firstValue.toFixed(1)}
                      </td>
                      <td className="p-2 text-end font-mono text-ink font-semibold">
                        {trend.lastValue.toFixed(1)}
                      </td>
                      <td className="p-2 text-end font-mono">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            flat
                              ? "text-faint"
                              : improving
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {flat ? (
                            <Minus className="w-3 h-3" aria-hidden="true" />
                          ) : trend.absoluteChange > 0 ? (
                            <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" aria-hidden="true" />
                          )}
                          {trend.absoluteChange > 0 ? "+" : ""}
                          {trend.absoluteChange.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-2 text-end font-mono text-muted">
                        {trend.slopePerYear > 0 ? "+" : ""}
                        {trend.slopePerYear.toFixed(3)}
                      </td>
                      <td className="p-2 text-end font-mono font-bold text-ink">
                        {trend.cagr > 0 ? "+" : ""}
                        {trend.cagr.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Context cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 dark:bg-inverse text-white rounded-2xl p-6 shadow-md flex flex-col justify-between border border-transparent dark:border-line">
          <div className="space-y-4">
            <span className="text-xs text-teal-400 font-bold uppercase tracking-wider">
              Regional context
            </span>
            <h4 className="text-lg font-bold font-display leading-tight">
              Health systems are not built the same way
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              High-income Gulf states run capital-intensive, largely state-funded
              systems. Elsewhere in the region, funding is split across public
              budgets, social insurance and out-of-pocket payment, which shows up
              in how much spending translates into measured outcomes.
            </p>
          </div>
        </div>

        <Panel className="p-6">
          <div className="space-y-3">
            <div className="text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/15 p-2.5 rounded-lg w-fit">
              <Stethoscope className="w-5 h-5" aria-hidden="true" />
            </div>
            <h4 className="text-sm font-bold text-ink">Reading the density figures</h4>
            <p className="text-xs text-muted leading-relaxed">
              Physician and hospital-bed density describe capacity, not access.
              Azerbaijan reports high bed density alongside weaker outcomes, so
              treat these two indicators as inputs to be explained rather than as
              results in themselves.
            </p>
          </div>
        </Panel>

        <Panel className="p-6">
          <div className="space-y-3">
            <div className="text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/15 p-2.5 rounded-lg w-fit">
              <TrendingUp className="w-5 h-5" aria-hidden="true" />
            </div>
            <h4 className="text-sm font-bold text-ink">Where the movement is</h4>
            <p className="text-xs text-muted leading-relaxed">
              Infant mortality falls steadily in every country in the dataset,
              while life expectancy dips sharply in 2020–21 and then recovers.
              Use the scope controls above to isolate either period and watch the
              statistics update.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  tone = "default",
  mono = false,
  small = false
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "teal" | "violet";
  mono?: boolean;
  small?: boolean;
}) {
  const toneClass =
    tone === "teal"
      ? "text-teal-700 dark:text-teal-300"
      : tone === "violet"
        ? "text-violet-700 dark:text-violet-300"
        : "text-ink";

  return (
    <div className="bg-raised p-4 rounded-xl border border-hairline">
      <p className="text-xs text-muted font-medium">{label}</p>
      <p
        className={`mt-1 font-bold ${toneClass} ${mono ? "font-mono" : ""} ${
          small ? "text-sm leading-snug" : "text-xl sm:text-2xl"
        }`}
      >
        {value}
      </p>
      {hint ? <span className="text-[10px] text-faint font-medium">{hint}</span> : null}
    </div>
  );
}
