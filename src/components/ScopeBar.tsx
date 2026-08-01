import { Filter, RotateCcw } from "lucide-react";
import { COUNTRIES, HEALTHCARE_DATA, YEARS } from "../data";
import type { AnalysisScope } from "../lib/scope";
import { DEFAULT_SCOPE } from "../lib/scope";
import { Panel } from "./ui";

interface ScopeBarProps {
  scope: AnalysisScope;
  onChange: (scope: AnalysisScope) => void;
  matchedCount: number;
  t: (key: string) => string;
}

const GCC_COUNTRIES = Array.from(
  new Set(HEALTHCARE_DATA.filter((d) => d.isGcc).map((d) => d.country))
);
const NON_GCC_COUNTRIES = COUNTRIES.filter((c) => !GCC_COUNTRIES.includes(c));

export function ScopeBar({ scope, onChange, matchedCount, t }: ScopeBarProps) {
  const toggleCountry = (country: string) => {
    const selected = new Set(scope.countries);
    if (selected.has(country)) selected.delete(country);
    else selected.add(country);
    // Never allow an empty selection: it would make every statistic undefined.
    if (selected.size === 0) return;
    onChange({ ...scope, countries: COUNTRIES.filter((c) => selected.has(c)) });
  };

  const presets: { label: string; countries: string[] }[] = [
    { label: t("scopePresetAll"), countries: [...COUNTRIES] },
    { label: t("scopePresetGcc"), countries: GCC_COUNTRIES },
    { label: t("scopePresetNonGcc"), countries: NON_GCC_COUNTRIES }
  ];

  const isPresetActive = (countries: string[]) =>
    countries.length === scope.countries.length &&
    countries.every((c) => scope.countries.includes(c));

  return (
    <Panel className="p-5 no-print">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />
            <h3 className="text-sm font-bold text-ink font-display">{t("scopeTitle")}</h3>
          </div>
          <p className="text-xs text-muted leading-relaxed max-w-md">{t("scopeDesc")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300"
            aria-live="polite"
          >
            {matchedCount} {t("scopeObservations")}
          </span>
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_SCOPE, countries: [...COUNTRIES] })}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-line text-muted hover:text-ink hover:border-teal-500 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            {t("scopeReset")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5 pt-5 border-t border-hairline">
        {/* Country selection */}
        <fieldset className="min-w-0">
          <legend className="text-[10px] font-bold uppercase tracking-wider text-faint mb-2">
            {t("scopeCountries")}
          </legend>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange({ ...scope, countries: preset.countries })}
                aria-pressed={isPresetActive(preset.countries)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border transition-colors cursor-pointer ${
                  isPresetActive(preset.countries)
                    ? "bg-teal-600 border-teal-600 text-white"
                    : "border-line text-muted hover:border-teal-500 hover:text-ink"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {COUNTRIES.map((country) => {
              const active = scope.countries.includes(country);
              return (
                <button
                  key={country}
                  type="button"
                  onClick={() => toggleCountry(country)}
                  aria-pressed={active}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-colors cursor-pointer ${
                    active
                      ? "bg-raised border-teal-500 text-ink font-semibold"
                      : "border-line text-faint hover:text-muted line-through"
                  }`}
                >
                  {country}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Year range */}
        <fieldset className="min-w-0">
          <legend className="text-[10px] font-bold uppercase tracking-wider text-faint mb-2">
            {t("scopeYears")}
          </legend>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-muted font-semibold">
              <span className="sr-only">{t("scopeYears")}</span>
              <select
                aria-label={`${t("scopeYears")} — ${t("year")} 1`}
                value={scope.yearFrom}
                onChange={(event) => {
                  const yearFrom = Number(event.target.value);
                  onChange({
                    ...scope,
                    yearFrom,
                    yearTo: Math.max(yearFrom, scope.yearTo)
                  });
                }}
                className="px-2.5 py-1.5 text-xs bg-raised border border-line rounded-lg font-mono font-semibold text-ink outline-none focus:border-teal-500 cursor-pointer"
              >
                {YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <span className="text-faint text-xs" aria-hidden="true">
              &ndash;
            </span>

            <label className="flex items-center gap-1.5 text-xs text-muted font-semibold">
              <span className="sr-only">{t("scopeYears")}</span>
              <select
                aria-label={`${t("scopeYears")} — ${t("year")} 2`}
                value={scope.yearTo}
                onChange={(event) => {
                  const yearTo = Number(event.target.value);
                  onChange({
                    ...scope,
                    yearTo,
                    yearFrom: Math.min(yearTo, scope.yearFrom)
                  });
                }}
                className="px-2.5 py-1.5 text-xs bg-raised border border-line rounded-lg font-mono font-semibold text-ink outline-none focus:border-teal-500 cursor-pointer"
              >
                {YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="text-[11px] text-faint mt-3 leading-relaxed">
            {scope.countries.length} / {COUNTRIES.length} {t("scopeCountries").toLowerCase()}
            {" · "}
            {Math.abs(scope.yearTo - scope.yearFrom) + 1} {t("scopeYears").toLowerCase()}
          </p>
        </fieldset>
      </div>
    </Panel>
  );
}
