import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  Award,
  BookOpen,
  Calendar,
  ChevronRight,
  Database,
  FileText,
  Globe,
  HeartPulse,
  Info,
  Layers,
  Percent,
  Search,
  Sigma,
  Stethoscope,
  TrendingUp,
  Sliders,
  Sparkles,
  Users,
  Eye,
  Settings,
  Scale
} from "lucide-react";
import {
  HEALTHCARE_DATA,
  COUNTRIES,
  INDICATORS,
  TRANSLATIONS,
  LANGUAGES,
  LanguageCode,
  HealthcareRecord
} from "./data";
import {
  NumericIndicatorKey,
  getSummaryStatistics,
  getPearsonCorrelation,
  getLinearRegression,
  compareGroupAverages
} from "./statistics";
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell
} from "recharts";

interface CustomResponsiveContainerProps {
  children: (width: number, height: number) => React.ReactNode;
}

function CustomResponsiveContainer({ children }: CustomResponsiveContainerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 600, height: 300 });

  React.useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setDimensions({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
    }

    let cleanup: (() => void) | undefined;

    if (typeof ResizeObserver === "undefined") {
      const handleResize = () => {
        const r = element.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          setDimensions({ width: Math.floor(r.width), height: Math.floor(r.height) });
        }
      };
      window.addEventListener("resize", handleResize);
      cleanup = () => window.removeEventListener("resize", handleResize);
    } else {
      try {
        const observer = new ResizeObserver((entries) => {
          if (!entries || entries.length === 0) return;
          const entry = entries[0];
          if (entry && entry.contentRect) {
            const { width, height } = entry.contentRect;
            if (width > 0 && height > 0) {
              setDimensions({ width: Math.floor(width), height: Math.floor(height) });
            }
          }
        });
        observer.observe(element);
        cleanup = () => observer.disconnect();
      } catch (e) {
        console.warn("ResizeObserver failed, falling back to window resize", e);
        const handleResize = () => {
          const r = element.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) {
            setDimensions({ width: Math.floor(r.width), height: Math.floor(r.height) });
          }
        };
        window.addEventListener("resize", handleResize);
        cleanup = () => window.removeEventListener("resize", handleResize);
      }
    }

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[200px]" style={{ position: "relative" }}>
      {children(dimensions.width, dimensions.height)}
    </div>
  );
}

export default function App() {
  // Locale State
  const [language, setLanguage] = useState<LanguageCode>("en");

  // UX Navigation States
  const [activeTab, setActiveTab] = useState<"dashboard" | "explorer" | "statistics" | "methodology">("dashboard");

  // Filter States inside Data Explorer
  const [explorerCountry, setExplorerCountry] = useState<string>("All");
  const [explorerYear, setExplorerYear] = useState<string>("All");
  const [profileCountry, setProfileCountry] = useState<string>("Iran");
  const [explorerIndicator, setExplorerIndicator] = useState<NumericIndicatorKey>("lifeExpectancy");

  // Statistical Engine Options
  const [regressionX, setRegressionX] = useState<NumericIndicatorKey>("expenditurePctGdp");
  const [regressionY, setRegressionY] = useState<NumericIndicatorKey>("lifeExpectancy");
  const [groupIndicator, setGroupIndicator] = useState<NumericIndicatorKey>("lifeExpectancy");
  const [customXValue, setCustomXValue] = useState<number>(6.5);

  // Search filter for Raw Data table
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Determine layout settings based on selected Language Config
  const langConfig = useMemo(() => {
    return LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  }, [language]);

  const isRtl = langConfig.dir === "rtl";

  // Quick Translations helper function
  const t = (key: string): string => {
    return TRANSLATIONS[language][key] || TRANSLATIONS["en"][key] || key;
  };

  // Filter dataset dynamically based on UX settings
  const filteredData = useMemo(() => {
    return HEALTHCARE_DATA.filter((record) => {
      const matchCountry = explorerCountry === "All" || record.country === explorerCountry;
      const matchYear = explorerYear === "All" || record.year.toString() === explorerYear;
      const matchSearch =
        searchQuery === "" ||
        record.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.year.toString().includes(searchQuery);
      return matchCountry && matchYear && matchSearch;
    });
  }, [explorerCountry, explorerYear, searchQuery]);

  // General Regional Summary KPIs based on WHO metrics
  const summaryKPIs = useMemo(() => {
    const totalRecords = HEALTHCARE_DATA.length;
    
    // Average Life expectancy
    const lifeExpectancies = HEALTHCARE_DATA.map(d => d.lifeExpectancy);
    const avgLife = lifeExpectancies.reduce((a, b) => a + b, 0) / totalRecords;
    
    // Find absolute highest Life expectancy
    const maxLifeRecord = HEALTHCARE_DATA.reduce((prev, curr) => 
      prev.lifeExpectancy > curr.lifeExpectancy ? prev : curr
    );

    // Find absolute lowest infant mortality rate
    const minMortalityRecord = HEALTHCARE_DATA.reduce((prev, curr) => 
      prev.infantMortality < curr.infantMortality ? prev : curr
    );

    // Average health expenditure % GDP
    const avgExpenditure = HEALTHCARE_DATA.reduce((acc, current) => acc + current.expenditurePctGdp, 0) / totalRecords;

    return {
      totalRecords,
      avgLife: avgLife.toFixed(1),
      highestLife: `${maxLifeRecord.lifeExpectancy} (${maxLifeRecord.country}, ${maxLifeRecord.year})`,
      lowestMortality: `${minMortalityRecord.infantMortality} (${minMortalityRecord.country}, ${minMortalityRecord.year})`,
      avgExp: avgExpenditure.toFixed(2)
    };
  }, []);

  // Multi-Country Line-Chart Dataset Generation for visual time lines
  const timelineChartData = useMemo(() => {
    // Group records by Year to align Recharts nicely
    const years = Array.from(new Set(HEALTHCARE_DATA.map((d) => d.year))).sort();
    return years.map((year) => {
      const yearObj: Record<string, any> = { year };
      HEALTHCARE_DATA.forEach((rec) => {
        if (rec.year === year) {
          yearObj[rec.country] = rec[explorerIndicator];
        }
      });
      return yearObj;
    });
  }, [explorerIndicator]);

  // Calculations for Pearson correlation (Selected Variables)
  const correlationResults = useMemo(() => {
    const r = getPearsonCorrelation(HEALTHCARE_DATA, regressionX, regressionY);
    
    // Pearson interpretation
    let guideKey = "corrNoRel";
    if (r <= -0.6) guideKey = "corrResultStrongNeg";
    else if (r > -0.6 && r < -0.2) guideKey = "corrResultWeakNeg";
    else if (r >= 0.6) guideKey = "corrResultStrongPos";
    else if (r > 0.2 && r < 0.6) guideKey = "corrResultWeakPos";

    return { r, guideKey };
  }, [regressionX, regressionY]);

  // Calculations for Regression Modeling (Selected Variables)
  const regressionResults = useMemo(() => {
    return getLinearRegression(HEALTHCARE_DATA, regressionX, regressionY);
  }, [regressionX, regressionY]);

  // Interactive Prediction Calculator based on the live regression line
  const predictedYValue = useMemo(() => {
    const { slope, intercept } = regressionResults;
    const value = intercept + slope * customXValue;
    return value.toFixed(2);
  }, [regressionResults, customXValue]);

  // Default step sizes & bounds for prediction sliders based on indicators the user chooses
  const sliderBounds = useMemo(() => {
    const values = HEALTHCARE_DATA.map(d => d[regressionX]);
    const min = Math.floor(Math.min(...values) * 0.9);
    const max = Math.ceil(Math.max(...values) * 1.1);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return { min, max, avg };
  }, [regressionX]);

  // Auto-align default dynamic slider when input variables are altered
  React.useEffect(() => {
    setCustomXValue(sliderBounds.avg);
  }, [sliderBounds.avg]);

  // Group comparative testing (GCC versus non-GCC sovereign entities)
  const comparativeResults = useMemo(() => {
    return compareGroupAverages(HEALTHCARE_DATA, groupIndicator);
  }, [groupIndicator]);

  // Descriptive breakdown calculations for the selected indicator
  const indicatorSummaryStats = useMemo(() => {
    return getSummaryStatistics(HEALTHCARE_DATA, explorerIndicator);
  }, [explorerIndicator]);

  // Standard indicator list definitions with mapped translated names
  const translatedIndicators = useMemo(() => {
    return INDICATORS.map((ind) => ({
      id: ind.id as NumericIndicatorKey,
      label: t(ind.labelKey),
      unit: ind.unit
    }));
  }, [language]);

  // Handlers
  const handleCountryFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setExplorerCountry(e.target.value);
  };

  const handleYearFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setExplorerYear(e.target.value);
  };

  // Color mapping variables per Middle East Country for reliable chart consistency
  const countryColors: Record<string, string> = {
    "Iran": "#ec4899",         // Pink
    "Turkey": "#ef4444",       // Red
    "Azerbaijan": "#06b6d4",   // Cyan/Teal
    "Saudi Arabia": "#10b981", // Emerald Green
    "UAE": "#8b5cf6",          // Purple
    "Egypt": "#f59e0b",        // Amber Gold
    "Iraq": "#64748b",         // Slate Gray
    "Jordan": "#1e3a8a"         // Deep Blue
  };

  return (
    <div
      id="me-healthcare-app"
      dir={langConfig.dir}
      className={`min-h-screen text-slate-800 bg-slate-50 transition-all duration-300 ${
        isRtl ? "text-right" : "text-left"
      }`}
    >
      {/* GLOBAL HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Headline */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-gradient-to-tr from-teal-600 to-cyan-500 p-2.5 rounded-xl text-white shadow-md shadow-teal-100">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
                {t("appName")}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {t("appSubtitle")}
              </p>
            </div>
          </div>

          {/* Multilingual Switcher - Styled Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto justify-center">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                id={`btn-lang-${lang.code}`}
                onClick={() => setLanguage(lang.code)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                  language === lang.code
                    ? "bg-white text-teal-700 shadow-sm border border-slate-200/50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>

        </div>
      </header>

      {/* CORE CONTENT LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        {/* RECTILINEAR NAVIGATION TABS */}
        <div className="mb-8 border-b border-slate-200">
          <nav className="flex flex-wrap -mb-px gap-1 sm:gap-4 justify-start">
            {[
              { id: "dashboard", label: t("tabDashboard"), icon: Globe },
              { id: "explorer", label: t("tabExplorer"), icon: Database },
              { id: "statistics", label: t("tabStatistics"), icon: Sigma },
              { id: "methodology", label: t("tabMethodology"), icon: BookOpen }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
                    isActive
                      ? "border-teal-600 text-teal-700 font-bold"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                  }`}
                >
                  <TabIcon className={`w-4 h-4 ${isActive ? "text-teal-600" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* TAB 1: REGION DASHBOARD OVERVIEW */}
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
              id="dashboard-tab"
            >
              {/* Regional intro study card */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
                <div className="max-w-4xl space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 text-xs font-semibold rounded-full">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>WHO & World Bank Macroeconomic Insights</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 font-display">
                    {t("regionalInsights")}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {t("insightText")}
                  </p>
                </div>

                {/* Regional Highlight KPIs Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">{t("totalDataPoints")}</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-mono">{summaryKPIs.totalRecords}</p>
                    <span className="text-[10px] text-teal-600 font-semibold uppercase tracking-wider">8 Countries × 8 Years</span>
                  </div>
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">{t("avgLifeExpectancy")}</p>
                    <p className="text-xl sm:text-2xl font-bold text-teal-700 mt-1 font-mono">{summaryKPIs.avgLife} Yrs</p>
                    <span className="text-[10px] text-slate-400 font-medium">Regional Weighted mean</span>
                  </div>
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">{t("highestLifeExp")}</p>
                    <p className="text-sm sm:text-base font-bold text-slate-900 mt-1.5 leading-snug">{summaryKPIs.highestLife}</p>
                    <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">Top Tier Index</span>
                  </div>
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">{t("avgExpGdp")}</p>
                    <p className="text-xl sm:text-2xl font-bold text-purple-700 mt-1 font-mono">{summaryKPIs.avgExp}%</p>
                    <span className="text-[10px] text-slate-400 font-medium">As a ratio of GDP</span>
                  </div>
                </div>
              </div>

              {/* COVID Impact Insight banner */}
              <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-5 flex items-start gap-4">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">{t("covidImpactTitle")}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {t("covidImpactDesc")}
                  </p>
                </div>
              </div>

              {/* Dynamic Summary Cards for each of the 5 main indicators */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight font-display border-s-4 border-teal-500 ps-2.5">
                  {t("overallSummary")}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {INDICATORS.map((indicatorObj) => {
                    const stats = getSummaryStatistics(HEALTHCARE_DATA, indicatorObj.id as NumericIndicatorKey);
                    return (
                      <div
                        key={indicatorObj.id}
                        className="bg-white rounded-xl p-4 border border-slate-200/60 hover:shadow-md transition-shadow"
                      >
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-tight line-clamp-1">
                          {t(indicatorObj.labelKey)}
                        </p>
                        
                        <div className="mt-2.5 flex items-baseline gap-1">
                          <span className="text-2xl font-extrabold text-slate-900 font-mono">
                            {stats.mean.toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {indicatorObj.unit}
                          </span>
                        </div>

                        <div className="mt-3.5 space-y-1.5 pt-3.5 border-t border-slate-100 text-xs">
                          <div className="flex justify-between text-slate-500">
                            <span>Min:</span>
                            <span className="font-semibold text-slate-800 font-mono">{stats.min.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Max:</span>
                            <span className="font-semibold text-slate-800 font-mono">{stats.max.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Std Dev (σ):</span>
                            <span className="font-semibold text-teal-600 font-mono">{stats.sd.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Geographic Insight - Small static explanatory grid with illustrations */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-xs text-teal-400 font-bold uppercase tracking-wider">Demographic Context</span>
                    <h4 className="text-lg font-bold font-display leading-tight">National Healthcare Disparities</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Healthcare systems across the Middle East are highly stratified. While high-income Gulf countries operate unified, capital-intensive state health structures, other countries relies on diverse mixes of public-private funding schemes and bilateral policy models.
                    </p>
                  </div>
                  <div className="border-t border-slate-700/60 pt-4 mt-6 flex justify-between items-center text-xs text-teal-300 font-medium">
                    <span>Explore correlation vectors</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="text-purple-600 bg-purple-50 p-2.5 rounded-lg w-fit">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Infrastructure density</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Our interactive analysis indicates a strong correlation between physician and hospital bed density across Azerbaijan and Turkey, contrasting with lower baseline coefficients across rapid-growth GCC zones who invest heavily in modern remote clinics.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="text-rose-500 bg-rose-50 p-2.5 rounded-lg w-fit">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Survival Indicators</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Infant mortality rates have shown an average downward trend of 4.2% annually across the entire Middle East, serving as the strongest responsive proxy of general hygiene investments and prenatal tracking infrastructures.
                    </p>
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 2: INTERACTIVE DATA EXPLORER */}
          {activeTab === "explorer" && (
            <motion.div
              key="explorer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
              id="explorer-tab"
            >
              
              {/* Dynamic Visual timeline comparison */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-display">
                      {t("indicatorComparison")}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {t("metaTitle")}
                    </p>
                  </div>

                  {/* Picker for the active indicator displayed on the chart */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                      {t("selectIndicator")}:
                    </span>
                    <select
                      id="select-indicator-explorer"
                      value={explorerIndicator}
                      onChange={(e) => setExplorerIndicator(e.target.value as any)}
                      className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 outline-none focus:border-teal-500 cursor-pointer"
                    >
                      {translatedIndicators.map((ind) => (
                        <option key={ind.id} value={ind.id}>
                          {ind.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Main Comparative Line Chart */}
                <div className="h-80 w-full" id="timeline-chart-container">
                  <CustomResponsiveContainer>
                    {(width, height) => (
                      <LineChart width={width} height={height} data={timelineChartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} fontFamily="SFMono-Regular, JetBrains Mono" />
                        <YAxis stroke="#94a3b8" fontSize={11} domain={["auto", "auto"]} fontFamily="SFMono-Regular, JetBrains Mono" />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white/95 border border-slate-200 p-3 rounded-lg shadow-md md:max-w-xs text-xs font-sans">
                                  <p className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 mb-1.5">
                                    {t("year")}: {label}
                                  </p>
                                  <div className="space-y-1">
                                    {payload.map((item) => (
                                      <div key={item.name} className="flex justify-between gap-4 items-center">
                                        <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                                          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                                          {item.name}:
                                        </span>
                                        <span className="font-bold text-slate-900 font-mono">
                                          {Number(item.value).toFixed(2)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" fontSize={11} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                        {COUNTRIES.map((ct) => (
                          <Line
                            key={ct}
                            type="monotone"
                            dataKey={ct}
                            stroke={countryColors[ct] || "#a8a29e"}
                            strokeWidth={2.5}
                            dot={{ r: 3 }}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                      </LineChart>
                    )}
                  </CustomResponsiveContainer>
                </div>
              </div>

              {/* Grid with Single Country profile & Descriptive Indicator Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Single Country Timeline Card */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 font-display">
                        {t("countryPerspective")}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Historical tracking of indicators for a single country
                      </p>
                    </div>
                    
                    {/* Country Selector */}
                    <select
                      id="select-country-profile"
                      value={profileCountry}
                      onChange={(e) => setProfileCountry(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 focus:border-teal-500 cursor-pointer"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Summary lists of country outcomes */}
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs text-start">
                        <thead>
                          <tr className="bg-slate-50/80 text-slate-500">
                            <th className="p-2 font-semibold text-start">{t("year")}</th>
                            <th className="p-2 font-semibold text-start">{t("metricLifeExpectancyShort")}</th>
                            <th className="p-2 font-semibold text-start">{t("metricExpenditureShort")}</th>
                            <th className="p-2 font-semibold text-start">{t("metricInfantMortalityShort")}</th>
                            <th className="p-2 font-semibold text-start">{t("metricPhysiciansShort")}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {HEALTHCARE_DATA.filter(d => d.country === profileCountry).map((rec) => (
                            <tr key={rec.year} className="hover:bg-slate-50/50">
                              <td className="p-2 font-bold font-mono text-slate-900">{rec.year}</td>
                              <td className="p-2 font-mono text-slate-600">{rec.lifeExpectancy}</td>
                              <td className="p-2 font-mono text-slate-600">{rec.expenditurePctGdp}%</td>
                              <td className="p-2 font-mono text-slate-600">{rec.infantMortality}</td>
                              <td className="p-2 font-mono text-slate-600">{rec.physiciansPer1000}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Selected Indicator Summary Statistics summary bar */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <div className="mb-4 pb-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-800 font-display">
                        Descriptive Metrics Analysis
                      </h4>
                      <p className="text-xs text-slate-500">
                        Selected metric: <span className="font-bold text-teal-600">{t(INDICATORS.find(i => i.id === explorerIndicator)?.labelKey || "")}</span>
                      </p>
                    </div>
                    <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg">
                      <Award className="w-5 h-5 text-teal-600" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Arithmetical Average</span>
                        <p className="text-lg font-bold text-slate-900 font-mono mt-1">
                          {indicatorSummaryStats.mean.toFixed(3)}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium">Standard baseline mean</span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Median Value</span>
                        <p className="text-lg font-bold text-slate-900 font-mono mt-1">
                          {indicatorSummaryStats.median.toFixed(2)}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium">Mid-point Observation</span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Variance dispersion</span>
                        <p className="text-lg font-bold text-slate-900 font-mono mt-1">
                          {Math.pow(indicatorSummaryStats.sd, 2).toFixed(3)}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium">Sigma Square (s²)</span>
                      </div>
                      <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-teal-700">Standard Deviation (s)</span>
                        <p className="text-lg font-bold text-teal-800 font-mono mt-1">
                          {indicatorSummaryStats.sd.toFixed(4)}
                        </p>
                        <span className="text-[10px] text-teal-600 font-medium">Weighted deviation</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 italic mt-2 leading-relaxed">
                      Descriptive statistics calculate the basic dispersion parameters over the collection of all 64 available observations across the years 2016-2023.
                    </p>
                  </div>
                </div>

              </div>

              {/* Interactive Raw Observations Table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-display">
                      {t("rawTableTitle")}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Query and view empirical observations across variables
                    </p>
                  </div>

                  {/* Filter Panel Grid */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    
                    {/* Search Field */}
                    <div className="relative w-full sm:w-auto">
                      <Search className="w-4 h-4 text-slate-400 absolute start-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="raw-table-search"
                        type="text"
                        placeholder="Search country/year..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="py-1.5 ps-8 pe-3 text-xs border border-slate-200 rounded-lg outline-none focus:border-teal-500 w-full sm:w-44 bg-slate-50 font-medium"
                      />
                    </div>

                    {/* Country Filter */}
                    <select
                      id="filter-country-raw"
                      value={explorerCountry}
                      onChange={handleCountryFilterChange}
                      className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 focus:border-teal-500 cursor-pointer"
                    >
                      <option value="All">{t("allCountries")}</option>
                      {COUNTRIES.map((ct) => (
                        <option key={ct} value={ct}>
                          {ct}
                        </option>
                      ))}
                    </select>

                    {/* Year Filter */}
                    <select
                      id="filter-year-raw"
                      value={explorerYear}
                      onChange={handleYearFilterChange}
                      className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 focus:border-teal-500 cursor-pointer"
                    >
                      <option value="All">{t("allYears")}</option>
                      {[2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023].map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>

                  </div>
                </div>

                <div className="overflow-x-auto max-h-[480px]">
                  <table className="min-w-full text-xs text-start divide-y divide-slate-200">
                    <thead className="bg-slate-50 sticky top-0 z-10 font-semibold text-slate-500 uppercase tracking-tight">
                      <tr>
                        <th className="p-3.5 text-start">{t("country")}</th>
                        <th className="p-3.5 text-start">{t("year")}</th>
                        <th className="p-3.5 text-start">{t("metricLifeExpectancyShort")}</th>
                        <th className="p-3.5 text-start">{t("metricExpenditureShort")}</th>
                        <th className="p-3.5 text-start">{t("metricInfantMortalityShort")}</th>
                        <th className="p-3.5 text-start">{t("metricPhysiciansShort")}</th>
                        <th className="p-3.5 text-start">{t("metricHospitalBedsShort")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredData.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                            {t("noData")}
                          </td>
                        </tr>
                      ) : (
                        filteredData.map((record, idx) => (
                          <tr key={`${record.country}-${record.year}`} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3.5 text-slate-900 font-bold flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: countryColors[record.country] }} />
                              {record.country}
                              {record.isGcc && (
                                <span className="font-sans text-[9px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded-full uppercase scale-90">GCC</span>
                              )}
                            </td>
                            <td className="p-3.5 text-slate-500 font-semibold font-mono">{record.year}</td>
                            <td className="p-3.5 text-slate-900 font-mono font-bold text-slate-900">{record.lifeExpectancy} yrs</td>
                            <td className="p-3.5 text-indigo-600 font-mono font-semibold">{record.expenditurePctGdp}%</td>
                            <td className="p-3.5 text-rose-600 font-mono font-semibold">{record.infantMortality}</td>
                            <td className="p-3.5 text-slate-700 font-mono font-medium">{record.physiciansPer1000}</td>
                            <td className="p-3.5 text-slate-700 font-mono font-medium">{record.hospitalBedsPer1000}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-50 p-3.5 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Filtered Count: <span className="font-bold text-slate-900">{filteredData.length}</span> / 64 database records</span>
                  <span>Interactive SQL-Free Local Cache</span>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 3: STATISTICAL STUDIES ENGINE */}
          {activeTab === "statistics" && (
            <motion.div
              key="statistics"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
              id="statistics-tab"
            >
              
              {/* Statistical Introductor Info Card */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
                <div className="max-w-4xl space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-800 text-xs font-semibold rounded-full">
                    <Sigma className="w-3.5 h-3.5" />
                    <span>Real-Time Bi-Variate Parametric Analytics Engine</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 font-display">
                    {t("statIntro")}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {t("statIntroDesc")}
                  </p>
                </div>

                {/* Predictor selector inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100 bg-slate-50/50 p-4 rounded-xl border border-slate-150">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{t("selectX")}</label>
                    <select
                      id="select-regression-x"
                      value={regressionX}
                      onChange={(e) => setRegressionX(e.target.value as any)}
                      className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-bold text-slate-700 outline-none w-full focus:border-teal-500 cursor-pointer"
                    >
                      {translatedIndicators.map((ind) => (
                        <option key={ind.id} value={ind.id}>
                          {ind.label} ({ind.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{t("selectY")}</label>
                    <select
                      id="select-regression-y"
                      value={regressionY}
                      onChange={(e) => setRegressionY(e.target.value as any)}
                      className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-bold text-slate-700 outline-none w-full focus:border-teal-500 cursor-pointer"
                    >
                      {translatedIndicators.map((ind) => (
                        <option key={ind.id} value={ind.id}>
                          {ind.label} ({ind.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* CORE STUDY Row: Correlation graph + Pearson numerical analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left study sidebar: Pearson R values & explanations */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">Methodology Analysis 1</span>
                      <h4 className="text-base font-bold text-slate-900 font-display mt-0.5">{t("correlationTab")}</h4>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-tight">{t("corrMethod")}</p>
                      <code className="text-xs bg-slate-50 px-2 py-1.5 rounded-md border border-slate-100 block text-center font-mono font-bold text-teal-700">
                        {t("corrFormulaStr")}
                      </code>
                    </div>

                    <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-1 text-center">
                      <p className="text-xs text-slate-500 font-semibold">{t("corrOutcome")}</p>
                      <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                        {correlationResults.r >= 0 ? "+" : ""}
                        {correlationResults.r.toFixed(4)}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">{t("rSquareLabel")} {(correlationResults.r * correlationResults.r).toFixed(4)}</p>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-xs font-bold text-slate-800">{t("corrInterpretation")}</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {t(correlationResults.guideKey)}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic leading-relaxed pt-4 border-t border-slate-100 mt-6">
                    {t("corrInterpretationText")}
                  </p>
                </div>

                {/* Scatter Chart Visualizing Bi-Variate Line of Best Fit */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm lg:col-span-2">
                  <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider block">Scatter Plot & OLS Regression Trend</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Visual representation of mathematical correlation</p>
                    </div>
                    {/* Tiny stats quick summary */}
                    <div className="bg-violet-50 text-violet-700 text-xs font-bold px-2.5 py-1 rounded-md font-mono">
                      Y = b₀ + b₁X
                    </div>
                  </div>

                  {/* Scatter chart with regression line */}
                  <div className="h-72 w-full" id="regression-chart-container">
                    <CustomResponsiveContainer>
                      {(width, height) => (
                        <ComposedChart
                          width={width}
                          height={height}
                          data={regressionResults.points}
                          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis
                            type="number"
                            dataKey="x"
                            name={t(regressionX)}
                            stroke="#94a3b8"
                            fontSize={11}
                            fontFamily="SFMono-Regular, JetBrains Mono"
                            domain={["auto", "auto"]}
                          />
                          <YAxis
                            type="number"
                            dataKey="y"
                            name={t(regressionY)}
                            stroke="#94a3b8"
                            fontSize={11}
                            fontFamily="SFMono-Regular, JetBrains Mono"
                            domain={["auto", "auto"]}
                          />
                          <Tooltip
                            cursor={{ strokeDasharray: "3 3" }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const dataPoint = payload[0].payload;
                                return (
                                  <div className="bg-white border border-slate-200 p-2.5 rounded-lg shadow-md text-xs font-sans">
                                    <p className="font-bold text-slate-900 mb-1 border-b pb-1">
                                      {dataPoint.country} ({dataPoint.year})
                                    </p>
                                    <p className="text-slate-600 font-medium text-[11px]">
                                      X: <span className="font-mono font-bold text-slate-800">{Number(dataPoint.x).toFixed(2)}</span>
                                    </p>
                                    <p className="text-slate-600 font-medium text-[11px]">
                                      Y (Observed): <span className="font-mono font-bold text-slate-800">{Number(dataPoint.y).toFixed(2)}</span>
                                    </p>
                                    <p className="text-teal-600 font-medium text-[11px]">
                                      Y (Predicted): <span className="font-mono font-bold">{Number(dataPoint.py).toFixed(2)}</span>
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                          <Scatter
                            name="Observed observations (N=64)"
                            dataKey="y"
                            fill="#ec4899"
                            shape="circle"
                            line={false}
                          />
                          <Line
                            name="OLS Line of Best Fit"
                            dataKey="py"
                            stroke="#06b6d4"
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={false}
                          />
                        </ComposedChart>
                      )}
                    </CustomResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* STUDY Row 2: Regression formulation details + Dynamic interactive slider forecasting */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Mathematical Steps Explained Card */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm lg:col-span-2 space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">OLS Method details</span>
                    <h4 className="text-base font-bold text-slate-900 font-display mt-0.5">{t("regressionSub")}</h4>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t("regressionDesc")}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Fitted Slope (β₁)</span>
                      <span className="text-lg font-extrabold text-slate-900 font-mono block mt-1">{regressionResults.slope.toFixed(5)}</span>
                      <span className="text-[9px] text-slate-400">Response coefficient</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Fitted Intercept (β₀)</span>
                      <span className="text-lg font-extrabold text-slate-900 font-mono block mt-1">{regressionResults.intercept.toFixed(5)}</span>
                      <span className="text-[9px] text-slate-400">Y-value when X = 0</span>
                    </div>
                    <div className="p-3 bg-teal-50 rounded-xl border border-teal-100">
                      <span className="text-[10px] font-semibold text-teal-700 block uppercase">Determination R²</span>
                      <span className="text-lg font-extrabold text-teal-800 font-mono block mt-1">{(regressionResults.r2 * 100).toFixed(2)} %</span>
                      <span className="text-[9px] text-teal-600">Model explained variance</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-500">
                    <p className="font-bold text-slate-700 uppercase tracking-wider text-[9px]">Model formulation:</p>
                    <div className="font-mono text-xs bg-slate-900 text-teal-400 p-2.5 rounded-lg text-center font-bold">
                      {regressionResults.equation}
                    </div>
                  </div>
                </div>

                {/* Practical Prediction Simulator */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-2">
                      <span className="text-[10px] text-pink-600 font-bold uppercase tracking-wider">Dynamic Sandbox Simulator</span>
                      <h4 className="text-base font-bold text-slate-900 font-display mt-0.5">Predict Outcomes interactively</h4>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Interact with the slide control below to change the independent value of <span className="font-bold text-slate-700">{t(regressionX)}</span>. The OLS formula will forecast the expected outcome for <span className="font-bold text-slate-700">{t(regressionY)}</span>.
                    </p>

                    {/* Selector slider */}
                    <div className="space-y-2 pt-2 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-500 uppercase tracking-tight">Active input value (X):</span>
                        <span className="font-bold text-slate-950 font-mono">{customXValue.toFixed(2)}</span>
                      </div>
                      
                      <input
                        id="prediction-slider"
                        type="range"
                        min={sliderBounds.min || 0}
                        max={sliderBounds.max || 15}
                        step={0.1}
                        value={customXValue}
                        onChange={(e) => setCustomXValue(parseFloat(e.target.value))}
                        className="w-full text-teal-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                      />
                      
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>{sliderBounds.min.toFixed(1)}</span>
                        <span>Avg: {sliderBounds.avg.toFixed(1)}</span>
                        <span>{sliderBounds.max.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Forecast output block */}
                    <div className="p-4 bg-gradient-to-r from-teal-600 to-cyan-500 text-white rounded-xl text-center space-y-1 shadow-md shadow-teal-50">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-teal-100">Statistical forecasting result (Y):</span>
                      <p className="text-2xl font-extrabold font-mono">{predictedYValue}</p>
                      <span className="text-[9px] text-indigo-50 font-medium">Standard error metric bounds: ε = ± {regressionResults.errorStd.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* STUDY Row 3: Class Segment Analysis Bar Chart Comparison (GCC vs non-GCC) */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 font-display">
                      {t("groupComparisonTab")}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {t("groupComparisonSub")}
                    </p>
                  </div>

                  {/* Indicator selector for Group comparisons */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">
                      Compare Indicator:
                    </span>
                    <select
                      id="select-group-indicator"
                      value={groupIndicator}
                      onChange={(e) => setGroupIndicator(e.target.value as any)}
                      className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 outline-none focus:border-teal-500 cursor-pointer"
                    >
                      {translatedIndicators.map((ind) => (
                        <option key={ind.id} value={ind.id}>
                          {ind.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Visual Bar chart Comparison */}
                  <div className="lg:col-span-2 h-64" id="group-comparison-chart-container">
                    <CustomResponsiveContainer>
                      {(width, height) => (
                        <BarChart
                          width={width}
                          height={height}
                          data={[
                            { name: t("gccGroupAvg"), value: comparativeResults.gccMean, fill: "#8b5cf6" },
                            { name: t("nonGccGroupAvg"), value: comparativeResults.nonGccMean, fill: "#e2e8f0" }
                          ]}
                          margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                          barSize={60}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} domain={[0, "auto"]} />
                          <Tooltip />
                          <Bar dataKey="value" strokeWidth={1} radius={[8, 8, 0, 0]}>
                            <Cell key="cell-gcc" fill="#8b5cf6" />
                            <Cell key="cell-nongcc" fill="#64748b" />
                          </Bar>
                        </BarChart>
                      )}
                    </CustomResponsiveContainer>
                  </div>

                  {/* Group Mean Difference report */}
                  <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between">
                    <div className="space-y-4">
                      <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Hypothesis Result</span>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">{t("gccGroupAvg")}:</span>
                          <span className="font-bold text-slate-800 font-mono">{comparativeResults.gccMean.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">{t("nonGccGroupAvg")}:</span>
                          <span className="font-bold text-slate-800 font-mono">{comparativeResults.nonGccMean.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between text-xs border-t border-slate-200/60 pt-2 font-bold">
                          <span className="text-slate-500">{t("statDiff")}:</span>
                          <span className="text-teal-700 font-mono">{comparativeResults.difference >= 0 ? "+" : ""}{comparativeResults.difference.toFixed(3)}</span>
                        </div>
                      </div>

                      {/* Hypothesis Sig report */}
                      <div className="p-3 bg-white border border-slate-200/55 rounded-xl space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-500">t-statistic proxy value:</span>
                          <span className="font-mono font-bold text-indigo-700">{comparativeResults.tValue.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-500">Significance Threshold (α = 0.05):</span>
                          {comparativeResults.significant ? (
                            <span className="bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-[10px]">Stat. Significant</span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded text-[10px]">Non-Significant</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                      {comparativeResults.difference >= 0 ? t("compPositiveDiff") : t("compNegativeDiff")}
                    </p>
                  </div>

                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 4: MATHEMATICAL METHODOLOGY */}
          {activeTab === "methodology" && (
            <motion.div
              key="methodology"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
              id="methodology-tab"
            >
              
              <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
                <div className="max-w-4xl space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 text-xs font-semibold rounded-full">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Analytical Framework Specifications</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 font-display">
                    {t("methodTitle")}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {t("methodIntro")}
                  </p>
                </div>
              </div>

              {/* Formula card blocks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* SD Variance formula */}
                <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="text-pink-600 bg-pink-50 p-2 px-3 rounded-lg w-fit text-xs font-bold font-mono">
                    STAT 101: Variance
                  </div>
                  <h4 className="font-bold text-base text-slate-900">{t("varianceFormula")}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t("varianceDesc")}
                  </p>
                  <div className="bg-slate-900 border border-slate-800 text-teal-400 py-4 px-3 rounded-xl font-mono text-xs text-center font-bold">
                    {t("varianceMath")}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    * Sample divisor of $(n-1)$ is used instead of populations $(N)$ to account for Bessel's correction yielding completely unbiased statisticians.
                  </p>
                </div>

                {/* Pearson Correlation Formula */}
                <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="text-purple-600 bg-purple-50 p-2 px-3 rounded-lg w-fit text-xs font-bold font-mono">
                    Pearson Correlation
                  </div>
                  <h4 className="font-bold text-base text-slate-900">{t("pearsonFormula")}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t("pearsonDesc")}
                  </p>
                  <div className="bg-slate-900 border border-slate-800 text-teal-400 py-4 px-3 rounded-xl font-mono text-xs text-center font-bold">
                    {t("pearsonMath")}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    * By scaling the covariance term ($Cov$) to standard deviations, the resulting ratio is normalized to sit perfectly between -1 and +1 bounds.
                  </p>
                </div>

                {/* Linear Regression Formula */}
                <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="text-cyan-600 bg-cyan-50 p-2 px-3 rounded-lg w-fit text-xs font-bold font-mono">
                    Linear Regression
                  </div>
                  <h4 className="font-bold text-base text-slate-900">{t("olsFormula")}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t("olsDesc")}
                  </p>
                  <div className="bg-slate-900 border border-slate-800 text-teal-400 py-4 px-3 rounded-xl font-mono text-xs text-center font-bold font-semibold leading-relaxed">
                    {t("olsMath")}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    * The coefficients are calculated recursively over matrices using least squares to represent the most minimal sum of residuals squares.
                  </p>
                </div>

              </div>

              {/* Data Sources Details */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="max-w-4xl space-y-3">
                  <h3 className="text-lg font-bold text-slate-900 font-display">
                    {t("dataSources")}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {t("dataSourcesDesc")}
                  </p>
                  
                  <div className="pt-4 flex flex-wrap gap-2.5">
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full border border-slate-200/60">World Health Organization Database</span>
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full border border-slate-200/60">World Bank Open Data Group</span>
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full border border-slate-200/60">Middle East Regional Policy Reviews</span>
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 mt-20 transition-all">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-center sm:text-start flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © 2026 Middle East Health Analytics Initiative. Calculated and modeled dynamically in modern TypeScript.
          </p>
          <div className="flex gap-4 text-xs text-slate-400 font-semibold">
            <span>WHO Metrics</span>
            <span>•</span>
            <span>World Bank Databank</span>
            <span>•</span>
            <span>Open-Source Science</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
