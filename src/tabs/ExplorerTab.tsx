import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Download, Search } from "lucide-react";
import { COUNTRIES, INDICATORS, INDICATOR_BY_ID, YEARS } from "../data";
import type { HealthcareRecord, IndicatorId } from "../data";
import { getSummaryStatistics } from "../statistics";
import type { NumericIndicatorKey } from "../statistics";
import { CHART_COLORS, COUNTRY_COLORS } from "../theme";
import type { ThemeMode } from "../theme";
import { downloadFile, recordsToCsv, timestampedName } from "../lib/export";
import { ChartFrame, EmptyState, LabelledSelect, Panel, StatTile } from "../components/ui";
import { ErrorBoundary } from "../components/ErrorBoundary";

interface ExplorerTabProps {
  data: HealthcareRecord[];
  indicator: IndicatorId;
  onIndicatorChange: (id: IndicatorId) => void;
  theme: ThemeMode;
  t: (key: string) => string;
}

export function ExplorerTab({
  data,
  indicator,
  onIndicatorChange,
  theme,
  t
}: ExplorerTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [tableCountry, setTableCountry] = useState("All");
  const [tableYear, setTableYear] = useState("All");
  const [hiddenCountries, setHiddenCountries] = useState<Set<string>>(new Set());
  const [profileCountry, setProfileCountry] = useState<string>(
    () => COUNTRIES.find((c) => data.some((d) => d.country === c)) ?? COUNTRIES[0]
  );

  const chartColors = CHART_COLORS[theme];
  const countryColors = COUNTRY_COLORS[theme];
  const indicatorConfig = INDICATOR_BY_ID[indicator];

  // Countries actually present in the current scope.
  const availableCountries = useMemo(
    () => COUNTRIES.filter((c) => data.some((d) => d.country === c)),
    [data]
  );

  const visibleCountries = availableCountries.filter((c) => !hiddenCountries.has(c));

  const timelineData = useMemo(() => {
    const years = Array.from(new Set(data.map((d) => d.year))).sort((a, b) => a - b);
    return years.map((year) => {
      const row: Record<string, number | string> = { year };
      for (const record of data) {
        if (record.year === year) {
          row[record.country] = record[indicator as NumericIndicatorKey];
        }
      }
      return row;
    });
  }, [data, indicator]);

  const tableRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return data.filter((record) => {
      const matchCountry = tableCountry === "All" || record.country === tableCountry;
      const matchYear = tableYear === "All" || String(record.year) === tableYear;
      const matchSearch =
        query === "" ||
        record.country.toLowerCase().includes(query) ||
        String(record.year).includes(query);
      return matchCountry && matchYear && matchSearch;
    });
  }, [data, searchQuery, tableCountry, tableYear]);

  const summary = useMemo(
    () => getSummaryStatistics(data, indicator as NumericIndicatorKey),
    [data, indicator]
  );

  const profileRows = useMemo(
    () =>
      data
        .filter((d) => d.country === profileCountry)
        .sort((a, b) => a.year - b.year),
    [data, profileCountry]
  );

  const toggleCountryLine = (country: string) => {
    setHiddenCountries((current) => {
      const next = new Set(current);
      if (next.has(country)) next.delete(country);
      else next.add(country);
      return next;
    });
  };

  if (data.length === 0) {
    return (
      <Panel>
        <EmptyState message={t("noDataScope")} />
      </Panel>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cross-country timeline */}
      <Panel className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-hairline">
          <div>
            <h3 className="text-lg font-bold text-ink font-display">
              {t("indicatorComparison")}
            </h3>
            <p className="text-xs text-muted mt-1">{t("metaTitle")}</p>
          </div>

          <LabelledSelect
            id="explorer-indicator"
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

        {/* Country line toggles */}
        <fieldset className="mb-4 no-print">
          <legend className="sr-only">{t("toggleCountries")}</legend>
          <div className="flex flex-wrap gap-1.5">
            {availableCountries.map((country) => {
              const visible = !hiddenCountries.has(country);
              return (
                <button
                  key={country}
                  type="button"
                  onClick={() => toggleCountryLine(country)}
                  aria-pressed={visible}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full border transition-all cursor-pointer ${
                    visible
                      ? "border-line text-ink bg-raised"
                      : "border-line text-faint opacity-60"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: visible ? countryColors[country] : "transparent",
                      border: visible ? "none" : `1.5px solid ${countryColors[country]}`
                    }}
                    aria-hidden="true"
                  />
                  {country}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="h-80 w-full">
          <ErrorBoundary resetKey={`${indicator}-${visibleCountries.join()}`}>
            <ChartFrame
              label={`${t("indicatorComparison")}: ${t(indicatorConfig.labelKey)}`}
            >
              {(width, height) => (
                <LineChart
                  width={width}
                  height={height}
                  data={timelineData}
                  margin={{ top: 10, right: 24, left: 4, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis
                    dataKey="year"
                    stroke={chartColors.axis}
                    fontSize={11}
                    tickMargin={8}
                  />
                  <YAxis
                    stroke={chartColors.axis}
                    fontSize={11}
                    domain={["auto", "auto"]}
                    width={48}
                    label={{
                      value: indicatorConfig.unit,
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 10, fill: chartColors.axis }
                    }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const sorted = [...payload].sort(
                        (a, b) => Number(b.value) - Number(a.value)
                      );
                      return (
                        <div className="bg-surface border border-line p-3 rounded-lg shadow-lg text-xs font-sans max-w-xs">
                          <p className="font-bold text-ink border-b border-hairline pb-1.5 mb-1.5">
                            {t("year")}: {label}
                          </p>
                          <div className="space-y-1">
                            {sorted.map((item) => (
                              <div
                                key={String(item.name)}
                                className="flex justify-between gap-4 items-center"
                              >
                                <span className="flex items-center gap-1.5 text-muted font-medium">
                                  <span
                                    className="w-2 h-2 rounded-full inline-block"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  {item.name}
                                </span>
                                <span className="font-bold text-ink font-mono">
                                  {Number(item.value).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                  />
                  {visibleCountries.map((country) => (
                    <Line
                      key={country}
                      type="monotone"
                      dataKey={country}
                      stroke={countryColors[country] ?? "#94a3b8"}
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                      connectNulls
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              )}
            </ChartFrame>
          </ErrorBoundary>
        </div>
      </Panel>

      {/* Country profile + descriptive statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel className="p-6">
          <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-hairline">
            <div>
              <h4 className="text-base font-bold text-ink font-display">
                {t("countryPerspective")}
              </h4>
              <p className="text-xs text-muted">
                {profileRows.length} {t("scopeObservations")}
              </p>
            </div>

            <LabelledSelect
              id="explorer-profile-country"
              label={t("country")}
              value={profileCountry}
              onChange={setProfileCountry}
            >
              {availableCountries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </LabelledSelect>
          </div>

          {profileRows.length === 0 ? (
            <EmptyState message={t("noDataScope")} />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="bg-raised text-muted">
                    <th scope="col" className="p-2 font-semibold text-start">
                      {t("year")}
                    </th>
                    <th scope="col" className="p-2 font-semibold text-end">
                      {t("metricLifeExpectancyShort")}
                    </th>
                    <th scope="col" className="p-2 font-semibold text-end">
                      {t("metricExpenditureShort")}
                    </th>
                    <th scope="col" className="p-2 font-semibold text-end">
                      {t("metricInfantMortalityShort")}
                    </th>
                    <th scope="col" className="p-2 font-semibold text-end">
                      {t("metricPhysiciansShort")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {profileRows.map((record) => (
                    <tr key={record.year} className="hover:bg-raised">
                      <td className="p-2 font-bold font-mono text-ink">{record.year}</td>
                      <td className="p-2 font-mono text-muted text-end">
                        {record.lifeExpectancy}
                      </td>
                      <td className="p-2 font-mono text-muted text-end">
                        {record.expenditurePctGdp}%
                      </td>
                      <td className="p-2 font-mono text-muted text-end">
                        {record.infantMortality}
                      </td>
                      <td className="p-2 font-mono text-muted text-end">
                        {record.physiciansPer1000}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel className="p-6">
          <div className="mb-4 pb-4 border-b border-hairline">
            <h4 className="text-base font-bold text-ink font-display">
              Descriptive statistics
            </h4>
            <p className="text-xs text-muted">
              {t(indicatorConfig.labelKey)} · n = {summary.count}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatTile label="Mean" value={summary.mean.toFixed(3)} hint="Arithmetic average" />
            <StatTile label="Median" value={summary.median.toFixed(2)} hint="50th percentile" />
            <StatTile label="Variance (s²)" value={summary.variance.toFixed(3)} hint="Squared spread" />
            <StatTile
              label="Std deviation (s)"
              value={summary.sd.toFixed(4)}
              hint="Bessel-corrected"
              emphasis
            />
            <StatTile label="Q1" value={summary.q1.toFixed(2)} hint="25th percentile" />
            <StatTile label="Q3" value={summary.q3.toFixed(2)} hint="75th percentile" />
            <StatTile label="IQR" value={summary.iqr.toFixed(2)} hint="Q3 − Q1" />
            <StatTile
              label={t("observedRange")}
              value={`${summary.min.toFixed(1)}–${summary.max.toFixed(1)}`}
              hint="Min to max"
            />
          </div>
        </Panel>
      </div>

      {/* Raw observation table */}
      <Panel className="overflow-hidden">
        <div className="p-6 border-b border-hairline flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-ink font-display">
              {t("rawTableTitle")}
            </h3>
            <p className="text-xs text-muted mt-0.5">
              {tableRows.length} {t("scopeObservations")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 no-print">
            <div className="relative w-full sm:w-auto">
              <Search
                className="w-4 h-4 text-faint absolute start-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="raw-table-search"
                type="search"
                aria-label={`${t("country")} / ${t("year")}`}
                placeholder={`${t("country")} / ${t("year")}…`}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="py-1.5 ps-8 pe-3 text-xs border border-line rounded-lg outline-none focus:border-teal-500 w-full sm:w-44 bg-raised text-ink font-medium"
              />
            </div>

            <LabelledSelect
              id="raw-table-country"
              label={t("country")}
              value={tableCountry}
              onChange={setTableCountry}
            >
              <option value="All">{t("allCountries")}</option>
              {availableCountries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </LabelledSelect>

            <LabelledSelect
              id="raw-table-year"
              label={t("year")}
              value={tableYear}
              onChange={setTableYear}
            >
              <option value="All">{t("allYears")}</option>
              {YEARS.filter((year) => data.some((d) => d.year === year)).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </LabelledSelect>

            <button
              type="button"
              onClick={() =>
                downloadFile(
                  timestampedName("middle-east-healthcare", "csv"),
                  recordsToCsv(tableRows),
                  "text/csv"
                )
              }
              disabled={tableRows.length === 0}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              {t("exportCsv")}
            </button>

            <button
              type="button"
              onClick={() =>
                downloadFile(
                  timestampedName("middle-east-healthcare", "json"),
                  JSON.stringify(tableRows, null, 2),
                  "application/json"
                )
              }
              disabled={tableRows.length === 0}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-line text-muted hover:text-ink hover:border-teal-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              {t("exportJson")}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[480px]">
          <table className="min-w-full text-xs divide-y divide-line">
            <thead className="bg-raised sticky top-0 z-10 font-semibold text-muted uppercase tracking-tight">
              <tr>
                <th scope="col" className="p-3.5 text-start">{t("country")}</th>
                <th scope="col" className="p-3.5 text-start">{t("year")}</th>
                <th scope="col" className="p-3.5 text-end">{t("metricLifeExpectancyShort")}</th>
                <th scope="col" className="p-3.5 text-end">{t("metricExpenditureShort")}</th>
                <th scope="col" className="p-3.5 text-end">{t("metricInfantMortalityShort")}</th>
                <th scope="col" className="p-3.5 text-end">{t("metricPhysiciansShort")}</th>
                <th scope="col" className="p-3.5 text-end">{t("metricHospitalBedsShort")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {tableRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-faint font-medium">
                    {t("noData")}
                  </td>
                </tr>
              ) : (
                tableRows.map((record) => (
                  <tr
                    key={`${record.country}-${record.year}`}
                    className="hover:bg-raised transition-colors"
                  >
                    {/* The flex lives on an inner span so the cell stays a table cell. */}
                    <td className="p-3.5 text-ink font-bold">
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: countryColors[record.country] }}
                          aria-hidden="true"
                        />
                        {record.country}
                        {record.isGcc && (
                          <span className="font-sans text-[9px] bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 font-bold px-1.5 py-0.5 rounded-full uppercase">
                            GCC
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="p-3.5 text-muted font-semibold font-mono">
                      {record.year}
                    </td>
                    <td className="p-3.5 text-ink font-mono font-bold text-end">
                      {record.lifeExpectancy}
                    </td>
                    <td className="p-3.5 text-indigo-600 dark:text-indigo-400 font-mono font-semibold text-end">
                      {record.expenditurePctGdp}%
                    </td>
                    <td className="p-3.5 text-rose-600 dark:text-rose-400 font-mono font-semibold text-end">
                      {record.infantMortality}
                    </td>
                    <td className="p-3.5 text-ink-soft font-mono text-end">
                      {record.physiciansPer1000}
                    </td>
                    <td className="p-3.5 text-ink-soft font-mono text-end">
                      {record.hospitalBedsPer1000}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-raised p-3.5 border-t border-hairline flex items-center justify-between text-muted text-xs font-semibold">
          <span>
            {tableRows.length} / {data.length} {t("scopeObservations")}
          </span>
          <span className="text-faint">Computed in the browser</span>
        </div>
      </Panel>
    </div>
  );
}
