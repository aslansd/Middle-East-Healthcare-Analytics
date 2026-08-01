import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BookOpen,
  Check,
  Database,
  Globe,
  HeartPulse,
  Link2,
  Moon,
  Sigma,
  Sun
} from "lucide-react";
import {
  COUNTRIES,
  INDICATORS,
  LANGUAGES,
  TRANSLATIONS,
  YEARS
} from "./data";
import type { IndicatorId, LanguageCode } from "./data";
import { useTheme } from "./theme";
import {
  DEFAULT_SCOPE,
  scopedData,
  useCopyLink,
  useHashSync,
  useInitialHashState
} from "./lib/scope";
import type { AnalysisScope } from "./lib/scope";
import { ScopeBar } from "./components/ScopeBar";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { DashboardTab } from "./tabs/DashboardTab";
import { ExplorerTab } from "./tabs/ExplorerTab";
import { StatisticsTab } from "./tabs/StatisticsTab";
import { MethodologyTab } from "./tabs/MethodologyTab";

type TabId = "dashboard" | "explorer" | "statistics" | "methodology";

const TAB_IDS: TabId[] = ["dashboard", "explorer", "statistics", "methodology"];
const INDICATOR_IDS = INDICATORS.map((i) => i.id);

const isTabId = (value: unknown): value is TabId =>
  typeof value === "string" && TAB_IDS.includes(value as TabId);

const isIndicatorId = (value: unknown): value is IndicatorId =>
  typeof value === "string" && INDICATOR_IDS.includes(value as IndicatorId);

const isLanguageCode = (value: unknown): value is LanguageCode =>
  typeof value === "string" && LANGUAGES.some((l) => l.code === value);

export default function App() {
  const initial = useInitialHashState();
  const { theme, toggleTheme, isDark } = useTheme();
  const [copied, copyLink] = useCopyLink();

  const [language, setLanguage] = useState<LanguageCode>(() =>
    isLanguageCode(initial.lang) ? initial.lang : "en"
  );
  const [activeTab, setActiveTab] = useState<TabId>(() =>
    isTabId(initial.tab) ? initial.tab : "dashboard"
  );

  const [scope, setScope] = useState<AnalysisScope>(() => ({
    countries: initial.countries ?? [...COUNTRIES],
    yearFrom: initial.yearFrom ?? DEFAULT_SCOPE.yearFrom,
    yearTo: initial.yearTo ?? DEFAULT_SCOPE.yearTo
  }));

  const [indicator, setIndicator] = useState<IndicatorId>(() =>
    isIndicatorId(initial.indicator) ? initial.indicator : "lifeExpectancy"
  );
  const [regressionX, setRegressionX] = useState<IndicatorId>(() =>
    isIndicatorId(initial.x) ? initial.x : "expenditurePctGdp"
  );
  const [regressionY, setRegressionY] = useState<IndicatorId>(() =>
    isIndicatorId(initial.y) ? initial.y : "lifeExpectancy"
  );
  const [groupIndicator, setGroupIndicator] = useState<IndicatorId>(() =>
    isIndicatorId(initial.group) ? initial.group : "lifeExpectancy"
  );

  const langConfig = useMemo(
    () => LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0],
    [language]
  );

  // Set direction and language on <html> so RTL affects scrollbars, form
  // controls and text selection, not just the app container.
  useEffect(() => {
    document.documentElement.lang = langConfig.code;
    document.documentElement.dir = langConfig.dir;
  }, [langConfig]);

  const t = useCallback(
    (key: string): string =>
      TRANSLATIONS[language]?.[key] ?? TRANSLATIONS.en[key] ?? key,
    [language]
  );

  useEffect(() => {
    document.title = `${t("appName")} · ${YEARS[0]}–${YEARS[YEARS.length - 1]}`;
  }, [t]);

  const data = useMemo(() => scopedData(scope), [scope]);

  useHashSync({
    tab: activeTab,
    lang: language,
    countries: scope.countries,
    yearFrom: scope.yearFrom,
    yearTo: scope.yearTo,
    x: regressionX,
    y: regressionY,
    group: groupIndicator,
    indicator
  });

  const tabs: { id: TabId; label: string; icon: typeof Globe }[] = [
    { id: "dashboard", label: t("tabDashboard"), icon: Globe },
    { id: "explorer", label: t("tabExplorer"), icon: Database },
    { id: "statistics", label: t("tabStatistics"), icon: Sigma },
    { id: "methodology", label: t("tabMethodology"), icon: BookOpen }
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink transition-colors">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-[60] focus:px-3 focus:py-2 focus:bg-teal-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-bold"
      >
        Skip to content
      </a>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-md border-b border-line shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-gradient-to-tr from-teal-600 to-cyan-500 p-2.5 rounded-xl text-white shadow-md shrink-0">
              <HeartPulse className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-ink font-display truncate">
                {t("appName")}
              </h1>
              <p className="text-xs text-muted font-medium">{t("appSubtitle")}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-center no-print">
            {/* Language switcher */}
            <div
              role="group"
              aria-label={t("btnLang")}
              className="flex flex-wrap items-center gap-1 p-1 bg-raised rounded-xl"
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  lang={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  aria-pressed={language === lang.code}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    language === lang.code
                      ? "bg-surface text-teal-700 dark:text-teal-300 shadow-sm border border-line"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={copyLink}
              title={t("copyLink")}
              aria-label={t("copyLink")}
              className="p-2 rounded-lg border border-line text-muted hover:text-ink hover:border-teal-500 transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" aria-hidden="true" />
              ) : (
                <Link2 className="w-4 h-4" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? t("themeLight") : t("themeDark")}
              aria-label={isDark ? t("themeLight") : t("themeDark")}
              className="p-2 rounded-lg border border-line text-muted hover:text-ink hover:border-teal-500 transition-colors cursor-pointer"
            >
              {isDark ? (
                <Sun className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-line no-print">
          <nav className="flex flex-wrap -mb-px gap-1 sm:gap-4" aria-label="Sections">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    isActive
                      ? "border-teal-600 text-teal-700 dark:text-teal-300 font-bold"
                      : "border-transparent text-muted hover:text-ink hover:border-line"
                  }`}
                >
                  <TabIcon
                    className={`w-4 h-4 ${isActive ? "text-teal-600 dark:text-teal-400" : "text-faint"}`}
                    aria-hidden="true"
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Scope applies to every analytical tab. */}
        {activeTab !== "methodology" && (
          <div className="mb-8">
            <ScopeBar
              scope={scope}
              onChange={setScope}
              matchedCount={data.length}
              t={t}
            />
          </div>
        )}

        <ErrorBoundary resetKey={activeTab}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "dashboard" && (
                <DashboardTab
                  data={data}
                  indicator={indicator}
                  onIndicatorChange={setIndicator}
                  theme={theme}
                  t={t}
                />
              )}

              {activeTab === "explorer" && (
                <ExplorerTab
                  data={data}
                  indicator={indicator}
                  onIndicatorChange={setIndicator}
                  theme={theme}
                  t={t}
                />
              )}

              {activeTab === "statistics" && (
                <StatisticsTab
                  data={data}
                  regressionX={regressionX}
                  regressionY={regressionY}
                  groupIndicator={groupIndicator}
                  onRegressionXChange={setRegressionX}
                  onRegressionYChange={setRegressionY}
                  onGroupIndicatorChange={setGroupIndicator}
                  theme={theme}
                  t={t}
                />
              )}

              {activeTab === "methodology" && <MethodologyTab t={t} />}
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>

      <footer className="bg-surface border-t border-line mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
          <p className="text-xs text-muted">
            Middle East Health Analytics · {YEARS[0]}–{YEARS[YEARS.length - 1]} ·
            All statistics computed in the browser
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-faint font-semibold">
            <span>WHO</span>
            <span aria-hidden="true">·</span>
            <span>World Bank</span>
            <span aria-hidden="true">·</span>
            <span>Open source</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
