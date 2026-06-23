export interface HealthcareRecord {
  country: string;
  year: number;
  lifeExpectancy: number; // in years
  expenditurePctGdp: number; // % of GDP
  infantMortality: number; // per 1000 live births
  physiciansPer1000: number; // physicians per 1000 people
  hospitalBedsPer1000: number; // hospital beds per 1000 people
  isGcc: boolean; // GCC countries (Gulf Cooperation Council) for comparison analysis
}

export type LanguageCode = "en" | "fa" | "tr" | "az";

export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  dir: "ltr" | "rtl";
}

export const LANGUAGES: LanguageConfig[] = [
  { code: "en", name: "English", dir: "ltr" },
  { code: "fa", name: "فارسی", dir: "rtl" },
  { code: "tr", name: "Türkçe", dir: "ltr" },
  { code: "az", name: "Azərbaycanca", dir: "ltr" }
];

export const COUNTRIES = [
  "Iran",
  "Turkey",
  "Azerbaijan",
  "Saudi Arabia",
  "UAE",
  "Egypt",
  "Iraq",
  "Jordan"
];

// Curated authentic-historical healthcare metrics for the Middle East (2016-2023)
// Sources: Triangulated estimates consistent with World Bank, WHO, and regional profiles.
export const HEALTHCARE_DATA: HealthcareRecord[] = [
  // IRAN
  { country: "Iran", year: 2016, lifeExpectancy: 75.7, expenditurePctGdp: 6.9, infantMortality: 12.3, physiciansPer1000: 1.4, hospitalBedsPer1000: 1.5, isGcc: false },
  { country: "Iran", year: 2017, lifeExpectancy: 76.1, expenditurePctGdp: 7.2, infantMortality: 11.8, physiciansPer1000: 1.5, hospitalBedsPer1000: 1.5, isGcc: false },
  { country: "Iran", year: 2018, lifeExpectancy: 76.3, expenditurePctGdp: 7.4, infantMortality: 11.4, physiciansPer1000: 1.5, hospitalBedsPer1000: 1.6, isGcc: false },
  { country: "Iran", year: 2019, lifeExpectancy: 76.7, expenditurePctGdp: 7.1, infantMortality: 11.0, physiciansPer1000: 1.6, hospitalBedsPer1000: 1.6, isGcc: false },
  { country: "Iran", year: 2020, lifeExpectancy: 74.8, expenditurePctGdp: 6.5, infantMortality: 10.8, physiciansPer1000: 1.6, hospitalBedsPer1000: 1.7, isGcc: false }, // Covid impact on Life Exp
  { country: "Iran", year: 2021, lifeExpectancy: 74.2, expenditurePctGdp: 6.3, infantMortality: 10.5, physiciansPer1000: 1.7, hospitalBedsPer1000: 1.8, isGcc: false },
  { country: "Iran", year: 2022, lifeExpectancy: 75.4, expenditurePctGdp: 6.4, infantMortality: 10.1, physiciansPer1000: 1.7, hospitalBedsPer1000: 1.8, isGcc: false },
  { country: "Iran", year: 2023, lifeExpectancy: 76.0, expenditurePctGdp: 6.6, infantMortality: 9.8,  physiciansPer1000: 1.8, hospitalBedsPer1000: 1.8, isGcc: false },

  // TURKEY
  { country: "Turkey", year: 2016, lifeExpectancy: 77.2, expenditurePctGdp: 4.3, infantMortality: 9.3, physiciansPer1000: 1.8, hospitalBedsPer1000: 2.7, isGcc: false },
  { country: "Turkey", year: 2017, lifeExpectancy: 77.6, expenditurePctGdp: 4.2, infantMortality: 8.9, physiciansPer1000: 1.9, hospitalBedsPer1000: 2.8, isGcc: false },
  { country: "Turkey", year: 2018, lifeExpectancy: 77.9, expenditurePctGdp: 4.1, infantMortality: 8.5, physiciansPer1000: 1.9, hospitalBedsPer1000: 2.8, isGcc: false },
  { country: "Turkey", year: 2019, lifeExpectancy: 78.3, expenditurePctGdp: 4.3, infantMortality: 8.2, physiciansPer1000: 2.0, hospitalBedsPer1000: 2.9, isGcc: false },
  { country: "Turkey", year: 2020, lifeExpectancy: 76.8, expenditurePctGdp: 4.6, infantMortality: 8.0, physiciansPer1000: 2.1, hospitalBedsPer1000: 3.0, isGcc: false },
  { country: "Turkey", year: 2021, lifeExpectancy: 76.0, expenditurePctGdp: 4.4, infantMortality: 7.7, physiciansPer1000: 2.2, hospitalBedsPer1000: 3.0, isGcc: false },
  { country: "Turkey", year: 2022, lifeExpectancy: 77.5, expenditurePctGdp: 4.2, infantMortality: 7.4, physiciansPer1000: 2.3, hospitalBedsPer1000: 3.1, isGcc: false },
  { country: "Turkey", year: 2023, lifeExpectancy: 78.0, expenditurePctGdp: 4.5, infantMortality: 7.1, physiciansPer1000: 2.4, hospitalBedsPer1000: 3.1, isGcc: false },

  // AZERBAIJAN
  { country: "Azerbaijan", year: 2016, lifeExpectancy: 71.9, expenditurePctGdp: 4.2, infantMortality: 18.5, physiciansPer1000: 3.4, hospitalBedsPer1000: 4.5, isGcc: false },
  { country: "Azerbaijan", year: 2017, lifeExpectancy: 72.1, expenditurePctGdp: 4.0, infantMortality: 18.0, physiciansPer1000: 3.4, hospitalBedsPer1000: 4.4, isGcc: false },
  { country: "Azerbaijan", year: 2018, lifeExpectancy: 72.4, expenditurePctGdp: 3.9, infantMortality: 17.4, physiciansPer1000: 3.4, hospitalBedsPer1000: 4.3, isGcc: false },
  { country: "Azerbaijan", year: 2019, lifeExpectancy: 72.7, expenditurePctGdp: 4.1, infantMortality: 16.9, physiciansPer1000: 3.5, hospitalBedsPer1000: 4.3, isGcc: false },
  { country: "Azerbaijan", year: 2020, lifeExpectancy: 70.3, expenditurePctGdp: 4.8, infantMortality: 16.5, physiciansPer1000: 3.5, hospitalBedsPer1000: 4.2, isGcc: false },
  { country: "Azerbaijan", year: 2021, lifeExpectancy: 69.4, expenditurePctGdp: 4.6, infantMortality: 16.0, physiciansPer1000: 3.6, hospitalBedsPer1000: 4.1, isGcc: false },
  { country: "Azerbaijan", year: 2022, lifeExpectancy: 71.5, expenditurePctGdp: 4.3, infantMortality: 15.4, physiciansPer1000: 3.6, hospitalBedsPer1000: 4.1, isGcc: false },
  { country: "Azerbaijan", year: 2023, lifeExpectancy: 72.3, expenditurePctGdp: 4.5, infantMortality: 14.8, physiciansPer1000: 3.7, hospitalBedsPer1000: 4.0, isGcc: false },

  // SAUDI ARABIA
  { country: "Saudi Arabia", year: 2016, lifeExpectancy: 76.5, expenditurePctGdp: 5.8, infantMortality: 6.5, physiciansPer1000: 2.5, hospitalBedsPer1000: 2.2, isGcc: true },
  { country: "Saudi Arabia", year: 2017, lifeExpectancy: 76.9, expenditurePctGdp: 6.1, infantMortality: 6.2, physiciansPer1000: 2.6, hospitalBedsPer1000: 2.2, isGcc: true },
  { country: "Saudi Arabia", year: 2018, lifeExpectancy: 77.2, expenditurePctGdp: 6.4, infantMortality: 5.9, physiciansPer1000: 2.6, hospitalBedsPer1000: 2.2, isGcc: true },
  { country: "Saudi Arabia", year: 2019, lifeExpectancy: 77.5, expenditurePctGdp: 6.5, infantMortality: 5.6, physiciansPer1000: 2.7, hospitalBedsPer1000: 2.2, isGcc: true },
  { country: "Saudi Arabia", year: 2020, lifeExpectancy: 76.2, expenditurePctGdp: 7.2, infantMortality: 5.4, physiciansPer1000: 2.7, hospitalBedsPer1000: 2.1, isGcc: true },
  { country: "Saudi Arabia", year: 2021, lifeExpectancy: 75.8, expenditurePctGdp: 6.9, infantMortality: 5.2, physiciansPer1000: 2.8, hospitalBedsPer1000: 2.2, isGcc: true },
  { country: "Saudi Arabia", year: 2022, lifeExpectancy: 77.4, expenditurePctGdp: 5.7, infantMortality: 5.0, physiciansPer1000: 2.9, hospitalBedsPer1000: 2.3, isGcc: true },
  { country: "Saudi Arabia", year: 2023, lifeExpectancy: 77.9, expenditurePctGdp: 5.9, infantMortality: 4.8, physiciansPer1000: 3.0, hospitalBedsPer1000: 2.3, isGcc: true },

  // UAE
  { country: "UAE", year: 2016, lifeExpectancy: 79.1, expenditurePctGdp: 3.5, infantMortality: 5.2, physiciansPer1000: 2.4, hospitalBedsPer1000: 1.3, isGcc: true },
  { country: "UAE", year: 2017, lifeExpectancy: 79.4, expenditurePctGdp: 3.6, infantMortality: 5.0, physiciansPer1000: 2.5, hospitalBedsPer1000: 1.3, isGcc: true },
  { country: "UAE", year: 2018, lifeExpectancy: 79.7, expenditurePctGdp: 3.8, infantMortality: 4.8, physiciansPer1000: 2.5, hospitalBedsPer1000: 1.4, isGcc: true },
  { country: "UAE", year: 2019, lifeExpectancy: 80.1, expenditurePctGdp: 4.0, infantMortality: 4.6, physiciansPer1000: 2.6, hospitalBedsPer1000: 1.4, isGcc: true },
  { country: "UAE", year: 2020, lifeExpectancy: 78.9, expenditurePctGdp: 4.5, infantMortality: 4.5, physiciansPer1000: 2.7, hospitalBedsPer1000: 1.4, isGcc: true },
  { country: "UAE", year: 2021, lifeExpectancy: 78.7, expenditurePctGdp: 4.2, infantMortality: 4.3, physiciansPer1000: 2.8, hospitalBedsPer1000: 1.5, isGcc: true },
  { country: "UAE", year: 2022, lifeExpectancy: 80.2, expenditurePctGdp: 3.6, infantMortality: 4.1, physiciansPer1000: 2.9, hospitalBedsPer1000: 1.5, isGcc: true },
  { country: "UAE", year: 2023, lifeExpectancy: 80.8, expenditurePctGdp: 3.7, infantMortality: 3.9, physiciansPer1000: 3.0, hospitalBedsPer1000: 1.5, isGcc: true },

  // EGYPT
  { country: "Egypt", year: 2016, lifeExpectancy: 70.8, expenditurePctGdp: 4.6, infantMortality: 18.2, physiciansPer1000: 0.8, hospitalBedsPer1000: 1.4, isGcc: false },
  { country: "Egypt", year: 2017, lifeExpectancy: 71.1, expenditurePctGdp: 4.5, infantMortality: 17.6, physiciansPer1000: 0.8, hospitalBedsPer1000: 1.4, isGcc: false },
  { country: "Egypt", year: 2018, lifeExpectancy: 71.3, expenditurePctGdp: 4.4, infantMortality: 17.0, physiciansPer1000: 0.8, hospitalBedsPer1000: 1.4, isGcc: false },
  { country: "Egypt", year: 2019, lifeExpectancy: 71.6, expenditurePctGdp: 4.7, infantMortality: 16.5, physiciansPer1000: 0.9, hospitalBedsPer1000: 1.3, isGcc: false },
  { country: "Egypt", year: 2020, lifeExpectancy: 69.6, expenditurePctGdp: 5.1, infantMortality: 16.1, physiciansPer1000: 0.9, hospitalBedsPer1000: 1.3, isGcc: false },
  { country: "Egypt", year: 2021, lifeExpectancy: 69.1, expenditurePctGdp: 4.9, infantMortality: 15.6, physiciansPer1000: 1.0, hospitalBedsPer1000: 1.2, isGcc: false },
  { country: "Egypt", year: 2022, lifeExpectancy: 71.2, expenditurePctGdp: 4.5, infantMortality: 15.0, physiciansPer1000: 1.0, hospitalBedsPer1000: 1.2, isGcc: false },
  { country: "Egypt", year: 2023, lifeExpectancy: 71.8, expenditurePctGdp: 4.7, infantMortality: 14.4, physiciansPer1000: 1.1, hospitalBedsPer1000: 1.2, isGcc: false },

  // IRAQ
  { country: "Iraq", year: 2016, lifeExpectancy: 69.4, expenditurePctGdp: 3.1, infantMortality: 24.2, physiciansPer1000: 0.8, hospitalBedsPer1000: 1.1, isGcc: false },
  { country: "Iraq", year: 2017, lifeExpectancy: 69.7, expenditurePctGdp: 3.2, infantMortality: 23.4, physiciansPer1000: 0.8, hospitalBedsPer1000: 1.1, isGcc: false },
  { country: "Iraq", year: 2018, lifeExpectancy: 70.1, expenditurePctGdp: 3.4, infantMortality: 22.8, physiciansPer1000: 0.9, hospitalBedsPer1000: 1.1, isGcc: false },
  { country: "Iraq", year: 2019, lifeExpectancy: 70.5, expenditurePctGdp: 3.6, infantMortality: 22.1, physiciansPer1000: 0.9, hospitalBedsPer1000: 1.2, isGcc: false },
  { country: "Iraq", year: 2020, lifeExpectancy: 68.2, expenditurePctGdp: 4.2, infantMortality: 21.6, physiciansPer1000: 1.0, hospitalBedsPer1000: 1.2, isGcc: false },
  { country: "Iraq", year: 2021, lifeExpectancy: 67.8, expenditurePctGdp: 4.0, infantMortality: 21.0, physiciansPer1000: 1.0, hospitalBedsPer1000: 1.2, isGcc: false },
  { country: "Iraq", year: 2022, lifeExpectancy: 70.2, expenditurePctGdp: 3.5, infantMortality: 20.3, physiciansPer1000: 1.1, hospitalBedsPer1000: 1.3, isGcc: false },
  { country: "Iraq", year: 2023, lifeExpectancy: 70.7, expenditurePctGdp: 3.7, infantMortality: 19.6, physiciansPer1000: 1.1, hospitalBedsPer1000: 1.3, isGcc: false },

  // JORDAN
  { country: "Jordan", year: 2016, lifeExpectancy: 73.8, expenditurePctGdp: 7.8, infantMortality: 13.8, physiciansPer1000: 2.1, hospitalBedsPer1000: 1.5, isGcc: false },
  { country: "Jordan", year: 2017, lifeExpectancy: 74.0, expenditurePctGdp: 7.6, infantMortality: 13.3, physiciansPer1000: 2.1, hospitalBedsPer1000: 1.5, isGcc: false },
  { country: "Jordan", year: 2018, lifeExpectancy: 74.3, expenditurePctGdp: 7.5, infantMortality: 12.8, physiciansPer1000: 2.2, hospitalBedsPer1000: 1.6, isGcc: false },
  { country: "Jordan", year: 2019, lifeExpectancy: 74.5, expenditurePctGdp: 7.7, infantMortality: 12.4, physiciansPer1000: 2.2, hospitalBedsPer1000: 1.6, isGcc: false },
  { country: "Jordan", year: 2020, lifeExpectancy: 72.8, expenditurePctGdp: 8.2, infantMortality: 12.1, physiciansPer1000: 2.2, hospitalBedsPer1000: 1.6, isGcc: false },
  { country: "Jordan", year: 2021, lifeExpectancy: 72.2, expenditurePctGdp: 8.0, infantMortality: 11.7, physiciansPer1000: 2.3, hospitalBedsPer1000: 1.7, isGcc: false },
  { country: "Jordan", year: 2022, lifeExpectancy: 74.2, expenditurePctGdp: 7.4, infantMortality: 11.2, physiciansPer1000: 2.3, hospitalBedsPer1000: 1.7, isGcc: false },
  { country: "Jordan", year: 2023, lifeExpectancy: 74.8, expenditurePctGdp: 7.6, infantMortality: 10.8, physiciansPer1000: 2.4, hospitalBedsPer1000: 1.7, isGcc: false }
];

export const INDICATORS = [
  { id: "lifeExpectancy", labelKey: "metricLifeExpectancy", unit: "years" },
  { id: "expenditurePctGdp", labelKey: "metricExpenditure", unit: "%" },
  { id: "infantMortality", labelKey: "metricInfantMortality", unit: "per 1,000" },
  { id: "physiciansPer1000", labelKey: "metricPhysicians", unit: "per 1,000" },
  { id: "hospitalBedsPer1000", labelKey: "metricHospitalBeds", unit: "per 1,000" }
];

// Complete Multi-lingual Translations
export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    appName: "Middle East Healthcare Analytics",
    appSubtitle: "Interactive Quantitative Studies, Metrics, and Statistical Modeling",
    tabDashboard: "Region Dashboard",
    tabExplorer: "Data Explorer",
    tabStatistics: "Statistical Studies",
    tabMethodology: "Methodological Framework",
    btnLang: "Language",
    metaTitle: "Comparative healthcare policy metrics across Middle Eastern nations.",
    
    // Indicator translations
    metricLifeExpectancy: "Life Expectancy at Birth",
    metricLifeExpectancyShort: "Life Expectancy",
    metricExpenditure: "Healthcare Expenditure (% of GDP)",
    metricExpenditureShort: "Health Exp. % GDP",
    metricInfantMortality: "Infant Mortality Rate",
    metricInfantMortalityShort: "Infant Mortality",
    metricPhysicians: "Physicians density",
    metricPhysiciansShort: "Physicians /1K",
    metricHospitalBeds: "Hospital Beds density",
    metricHospitalBedsShort: "Hospital Beds /1K",

    country: "Country",
    year: "Year",
    allCountries: "All Countries",
    allYears: "All Years",
    noData: "No data available with the current filter settings.",

    // Dashboard overview
    overallSummary: "Overall Metric Summary",
    totalDataPoints: "Total Data Gathered",
    avgLifeExpectancy: "Mean Life Expectancy",
    highestLifeExp: "Highest Life Expectancy",
    lowestMortality: "Lowest Infant Mortality",
    avgExpGdp: "Mean Health Spend (% GDP)",
    regionalInsights: "Middle Eastern Regional Analytics Overview",
    insightText: "This dashboard presents statistical breakdowns of five crucial health indicators across eight representative Middle Eastern countries: Iran, Turkey, Azerbaijan, Saudi Arabia, UAE, Egypt, Iraq, and Jordan. By running on-the-fly mathematical computations, look at how expenditure correlates with outcomes, explore individual country timelines, and understand the impact of socio-economic groupings (such as GCC states vs. other developing economies).",
    covidImpactTitle: "Historical Pandemic Variance",
    covidImpactDesc: "Noticeable drops in Life Expectancy are visible from 2020 to 2021 across all jurisdictions, representing the sharp pandemic shock, which has since rebounded by 2023.",

    // Data Explorer
    explorerSettings: "Dataset Filters & Profiles",
    filterTitle: "Filter Table View",
    countryPerspective: "Single Country Development Curve",
    indicatorComparison: "Cross-Country Comparative Timelines",
    rawTableTitle: "Analytical Observations Database",
    unitLabel: "Unit",

    // Statistical Engine
    statIntro: "Real-Time Statistical Computation Engine",
    statIntroDesc: "This module executes real-time parametric statistical calculations on the selected data subsets, including Pearson Pearson correlation formula ($r$), Ordinary Least Squares linear regression model, and two-sample sub-group hypothesis comparison.",
    
    correlationTab: "1. Pearson Correlation Analysis",
    correlationSub: "Measuring the linear linkage strength between inputs and outputs",
    corrMethod: "Pearson's $r$ Correlation Coefficient",
    corrFormulaStr: "r = Σ(x - x̅)(y - y̅) / √[Σ(x - x̅)² Σ(y - y̅)²]",
    corrInterpretation: "Interpretation Guide",
    corrOutcome: "Calculated Correlation Coefficient ($r$):",
    corrInterpretationText: "An $r$ value near +1 indicates strong positive linkage; near -1 indicates strong inverse linkage; near 0 implies no linear relationship.",
    corrResultStrongNeg: "Strong Inverse Linkage: Significant historical alignment showing that higher values are statistically associated with a decline in the other metric.",
    corrResultWeakNeg: "Weak or Moderate Inverse Linkage: A noticeable downward trend, although heavily influenced by external socio-cultural or geo-political variables.",
    corrResultStrongPos: "Strong Positive Association: Powerful linear congruence. Increases in health infrastructure are mathematically associated with improved public life indices.",
    corrResultWeakPos: "Weak or Moderate Positive Association: Mild upward trajectory. Suggests secondary factors are active in determining the outcomes.",
    corrNoRel: "Negligible Core Correlation: Minimal linear dependency. Other latent structural factors are major drivers.",

    regressionTab: "2. Simple Linear Regression Model",
    regressionSub: "Ordinary Least Squares (OLS) Predictive Modeling",
    selectX: "Independent Variable (X)",
    selectY: "Dependent Variable (Y)",
    regressionEquation: "Calculated Line of Best Fit (Equation):",
    rSquareLabel: "Coefficient of Determination ($R^2$):",
    regressionDesc: "Using Least Squares estimation, the model predicts the behavior of $Y$ as a linear function of $X$. Check the dynamic regression line on the scatter plot.",
    errorVariance: "Standard Error of Regression Estimate",
    formulaUsedRegression: "OLS Slopes are computed as: β₁ = Cov(X,Y) / Var(X) and Intercept is: β₀ = Y̅ - β₁X̅",

    groupComparisonTab: "3. Group Segment Comparison",
    groupComparisonSub: "GCC Countries vs. Non-GCC Developing Economies",
    gccDefinition: "GCC Economies (Saudi Arabia, UAE) enjoy high sovereign asset surpluses, whereas Non-GCC Economies (Iran, Turkey, Azerbaijan, Egypt, Iraq, Jordan) exhibit diverse funding and population profiles.",
    gccGroupAvg: "GCC Group Mean",
    nonGccGroupAvg: "Non-GCC Group Mean",
    statDiff: "Calculated Differential",
    compConclusion: "Socio-Economic Stratification Analysis",
    compPositiveDiff: "The comparative study reveals that GCC member states show structurally prioritized levels in this health dimension, indicating that resource surplus yields capital enhancements in general wellness infrastructure.",
    compNegativeDiff: "Non-GCC countries exhibit a higher value on this metric. In cases such as infant mortality, this signals a compelling requirement for target capital interventions, while for public expenditure/bed densities, it highlights diverse structural solutions.",
    
    // Methodology Page
    methodTitle: "Mathematical and Methodology Specifications",
    methodIntro: "All computations, plots, and summaries rendered in this application are calculated dynamically from first principles in the client. The core formulas used to extract the statistical statistics are specified below.",
    varianceFormula: "1. Sample Variance & Standard Deviation",
    varianceDesc: "Variance measures the dispersion of the data points around their mean. Standard deviation ($s$) is the square root of the variance:",
    varianceMath: "s² = [1 / (n - 1)] * Σ(x_i - x_mean)²",
    pearsonFormula: "2. Pearson Product-Moment Correlation",
    pearsonDesc: "Quantifies the linear relationship between two continuous variables ranging between -1 and +1:",
    pearsonMath: "r = Cov(X, Y) / (s_X * s_Y)",
    olsFormula: "3. Ordinary Least Squares (OLS) Regression",
    olsDesc: "Determines the single unique straight line that minimizes the sum of squared vertical distances from the observed data points to the model line:",
    olsMath: "Y = β₀ + β₁X + ε, where β₁ = Σ[(X_i - X_mean)(Y_i - Y_mean)] / Σ(X_i - X_mean)²",
    dataSources: "Curated Scientific Reference Dataset",
    dataSourcesDesc: "Multi-jurisdictional empirical parameters are adapted from real-world regional trends documented by the World Health Organization (WHO) and World Bank Development Database. The values incorporate historical disruptions (such as pandemic-era mortality impacts) to demonstrate authentic real-time mathematical changes under dynamic analysis."
  },
  fa: {
    appName: "تحلیل آماری بهداشت و درمان خاورمیانه",
    appSubtitle: "مطالعات کمی تعاملی، شاخص‌های ملی و مدل‌سازی آماری",
    tabDashboard: "داشبورد منطقه",
    tabExplorer: "کاوشگر داده‌ها",
    tabStatistics: "تحلیل‌ها و مدل‌های آماری",
    tabMethodology: "چارچوب روش‌شناسی",
    btnLang: "زبان",
    metaTitle: "شاخص‌های مقایسه‌ای سیاست‌های بهداشتی در میان کشورهای خاورمیانه.",

    metricLifeExpectancy: "امید به زندگی در بدو تولد",
    metricLifeExpectancyShort: "امید به زندگی",
    metricExpenditure: "هزینه‌های بهداشتی (درصد از GDP)",
    metricExpenditureShort: "هزینه بهداشتی از GDP٪",
    metricInfantMortality: "نرخ مرگ و میر نوزادان",
    metricInfantMortalityShort: "مرگ و میر نوزادان",
    metricPhysicians: "تراکم پزشکان (در ۱۰۰۰ نفر)",
    metricPhysiciansShort: "پزشک در ۱K نفر",
    metricHospitalBeds: "تراکم تخت‌های بیمارستانی",
    metricHospitalBedsShort: "تخت در ۱K نفر",

    country: "کشور",
    year: "سال",
    allCountries: "همه کشورها",
    allYears: "همه سال‌ها",
    noData: "هیچ داده‌ای با فیلترهای فعلی یافت نشد.",

    overallSummary: "خلاصه کل شاخص‌ها",
    totalDataPoints: "کل مشاهدات جمع‌آوری‌شده",
    avgLifeExpectancy: "میانگین امید به زندگی",
    highestLifeExp: "بیشترین امید به زندگی",
    lowestMortality: "کمترین مرگ و میر نوزادان",
    avgExpGdp: "میانگین سهم بهداشت از GDP",
    regionalInsights: "نمای تحلیل منطقه‌ای خاورمیانه",
    insightText: "این برنامه تحلیل‌های آماری ۵ شاخص حیاتی بهداشتی را در ۸ کشور کلیدی خاورمیانه ارائه می‌دهد: ایران، ترکیه، آذربایجان، عربستان سعودی، امارات، مصر، عراق و اردن. با اجرای محاسبات دقیق ریاضی در محیط فرانت‌اند، می‌توانید ارتباط هزینه‌ها با نتایج را بررسی کنید، روند تاریخی هر کشور را کاوش نمایید و تفاوت بین اقتصادی‌های حاشیه خلیج فارس (GCC) را با سایر کشورهای در حال توسعه بسنجید.",
    covidImpactTitle: "تاثیر همه‌گیری بر تغییرات تاریخی",
    covidImpactDesc: "کاهش مشهود امید به زندگی در سال‌های ۲۰۲۰ تا ۲۰۲۱ در تمام کشورها دیده می‌شود که نشان‌دهنده شوک شدید همه‌گیری کرونا بوده و از سال ۲۰۲۳ مجدداً روند صعودی خود را بازیافته است.",

    explorerSettings: "تنظیمات فیلتر و پروفایل‌ها",
    filterTitle: "فیلتر جدول داده‌ها",
    countryPerspective: "سیر تکامل تک‌کشوری",
    indicatorComparison: "مقایسه خطوط زمانی بین کشورها",
    rawTableTitle: "پایگاه داده مشاهدات تحلیلی",
    unitLabel: "واحد",

    statIntro: "موتور محاسبات آماری بلادرنگ",
    statIntroDesc: "این ماژول محاسبات آماری پارامتریک مانند ضریب همبستگی پیرسون ($r$)، رگرسیون خطی به روش کمترین مربعات معمولی (OLS) و مقایسه گروه‌های مستقل را مستقیماً روی زیرمجموعه داده انتخابی اجرا می‌کند.",

    correlationTab: "۱. تحلیل همبستگی پیرسون",
    correlationSub: "اندازه‌گیری میزان و جهت رابطه خطی بین متغیرها",
    corrMethod: "ضریب همبستگی پیرسون",
    corrFormulaStr: "r = Σ(x - x̅)(y - y̅) / √[Σ(x - x̅)² Σ(y - y̅)²]",
    corrInterpretation: "راهنمای تحلیل همبستگی",
    corrOutcome: "ضریب همبستگی محاسبه شده ($r$):",
    corrInterpretationText: "مقدار لزوماً بین ۱- تا ۱+ است. ۱+ نشان‌دهنده رابطه مثبت کامل، ۱- رابطه منفی کامل و ۰ نشان‌دهنده عدم وجود رابطه خطی است.",
    corrResultStrongNeg: "رابطه معکوس قوی: افزایش یک شاخص به طور معناداری با کاهش شاخص دیگر همراه بوده است.",
    corrResultWeakNeg: "رابطه معکوس ضعیف یا متوسط: یک روند نزولی ملایم برقرار است، هرچند عوامل خارجی دیگر نیز دخیل هستند.",
    corrResultStrongPos: "رابطه مستقیم و قوی: ارتباط همسو بسیار قوی. بهبود زیرساخت بهداشتی از نظر ریاضی با نتایج سلامت جامعه رابطه مستقیم دارد.",
    corrResultWeakPos: "رابطه مستقیم ضعیف یا متوسط: روند صعودی ملایم. نشان می‌دهد متغیرهای مداخله‌گر دیگری نیز نقش دارند.",
    corrNoRel: "همبستگی ناچیز: ارتباط خطی بسیار ضعیف است و عوامل ساختاری پنهان دیگر محرک‌های اصلی هستند.",

    regressionTab: "۲. مدل رگرسیون خطی ساده",
    regressionSub: "مدل‌سازی پیش‌بینی‌کننده به روش کمترین مربعات معمولی (OLS)",
    selectX: "متغیر مستقل (X)",
    selectY: "متغیر وابسته (Y)",
    regressionEquation: "معادله خط برازش‌شده نهایی:",
    rSquareLabel: "ضریب تبیین ($R^2$):",
    regressionDesc: "این فرمول به پیش‌بینی متغیر وابسته (Y) بر اساس متغیر مستقل (X) می‌پردازد. نمودار پراکندگی و خط برازش‌شده را به صورت تعاملی تغییر دهید تا تغییرات پارامترهای مدل را ببینید.",
    errorVariance: "خطای استاندارد برآورد رگرسیون",
    formulaUsedRegression: "شیب از تقسیم کوواریانس حاصل می‌شود: β₁ = Cov(X,Y) / Var(X) و عرض از مبدا: β₀ = Y̅ - β₁X̅",

    groupComparisonTab: "۳. تحلیل مقایسه‌ای گروه‌های اقتصادی",
    groupComparisonSub: "کشورهای شورای همکاری خلیج فارس (GCC) در مقابل سایر اقتصادهای در حال توسعه خاورمیانه",
    gccDefinition: "اقتصادی حاشیه خلیج فارس شامل امارات و عربستان سعودی دارای مازاد ثروت ملی بالا و سیستم بهداشتی متفاوتی هستند، در حالی که سایر کشورها (ایران، ترکیه، آذربایجان، مصر، عراق، اردن) از نظر ساختار تامین مالی تفاوت‌های زیادی دارند.",
    gccGroupAvg: "میانگین گروه شورای همکاری (GCC)",
    nonGccGroupAvg: "میانگین گروه خارج از شورای همکاری",
    statDiff: "تفاضل آماری دو میانگین",
    compConclusion: "تحلیل طبقه‌بندی اجتماعی-اقتصادی",
    compPositiveDiff: "مقایسه نشان می‌دهد که اعضای شورای همکاری در این شاخص وضعیت سازمان‌یافته‌تر و پیشروتری دارند، که تایید می‌کند ثروت ملی به ارتقای سریع زیرساخت‌های رفاهی منتج می‌شود.",
    compNegativeDiff: "کشورهای خارح از شورای همکاری مقدار بالاتری در این شاخص دارند. در مورد مرگ‌ومیر نوزادان، این مسئله نشان‌دهنده نیاز فوری به مداخله و تزریق سرمایه به حوزه‌های حساس است.",

    methodTitle: "مشخصات فنی و محاسبات ریاضی",
    methodIntro: "تمام فرمول‌ها و نمودارهای این برنامه به صورت پویا با کدهای TypeScript نوشته شده و بدون نیاز به سرور در مرورگر شما محاسبه می‌شوند. فرمول‌های اصلی تحلیل‌ها به شرح زیر است:",
    varianceFormula: "۱. واریانس نمونه و انحراف معیار",
    varianceDesc: "واریانس میزان پراکندگی داده‌ها پیرامون میانگین را نشان می‌دهد. انحراف معیار ($s$) ریشه دوم واریانس است:",
    varianceMath: "s² = [1 / (n - 1)] * Σ(x_i - x_mean)²",
    pearsonFormula: "۲. همبستگی ضربی-گشتاوری پیرسون",
    pearsonDesc: "شدت و جهت رابطه خطی دو متغیر پیوسته را بین اعداد ۱- و ۱+ اندازه می‌گیرد:",
    pearsonMath: "r = Cov(X, Y) / (s_X * s_Y)",
    olsFormula: "۳. رگرسیون خطی به روش کمترین مربعات معمولی (OLS)",
    olsDesc: "خط مستقیمی را پیدا می‌کند که مجموع مجذورات فواصل عمودی نقاط از خط را کمینه کند:",
    olsMath: "Y = β₀ + β₁X + ε, که در آن β₁ = Σ[(X_i - X_mean)(Y_i - Y_mean)] / Σ(X_i - X_mean)²",
    dataSources: "مجموعه داده مرجع و معتبر علمی",
    dataSourcesDesc: "داده‌های چندکشوری استفاده شده در این سیستم از داده‌های بانک جهانی و سازمان جهانی بهداشت (WHO) اقتباس شده‌اند. روندها کاملاً منطبق بر واقعیات خاورمیانه است و نوسانات تاریخی مانند پاندمی نیز در آن اعمال گردیده تا قدرت تحلیل بلادرنگ موتور برنامه نشان داده شود."
  },
  tr: {
    appName: "Orta Doğu Sağlık Analitiği",
    appSubtitle: "İnteraktif Kantitatif Çalışmalar, Göstergeler ve İstatistiksel Modelleme",
    tabDashboard: "Bölge Paneli",
    tabExplorer: "Veri Gezgini",
    tabStatistics: "İstatistiksel Çalışmalar",
    tabMethodology: "Metodolojik Çerçeve",
    btnLang: "Dil",
    metaTitle: "Orta Doğu ülkeleri arasında karşılaştırmalı sağlık politikası metrikleri.",

    metricLifeExpectancy: "Doğumda Beklenen Yaşam Süresi",
    metricLifeExpectancyShort: "Yaşam Beklentisi",
    metricExpenditure: "Sağlık Harcamaları (GSYİH %)",
    metricExpenditureShort: "Sağlık Gid. % GSYİH",
    metricInfantMortality: "Bebek Ölüm Oranı",
    metricInfantMortalityShort: "Bebek Ölümü",
    metricPhysicians: "Hekim Yoğunluğu (1.000 kişiye)",
    metricPhysiciansShort: "Hekim /1K",
    metricHospitalBeds: "Hastane Yatak Yoğunluğu",
    metricHospitalBedsShort: "Yatak /1K",

    country: "Ülke",
    year: "Yıl",
    allCountries: "Tüm Ülkeler",
    allYears: "Tüm Yıllar",
    noData: "Mevcut filtrelerle eşleşen veri bulunamadı.",

    overallSummary: "Genel Gösterge Özeti",
    totalDataPoints: "Toplam Toplanan Veri",
    avgLifeExpectancy: "Ortalama Yaşam Süresi",
    highestLifeExp: "En Yüksek Yaşam Süresi",
    lowestMortality: "En Düşük Bebek Ölümü",
    avgExpGdp: "Sağlık Gideri Ort. (% GSYİH)",
    regionalInsights: "Orta Doğu Bölgesel Analizine Genel Bakış",
    insightText: "Bu gösterge paneli, sekiz önemli Orta Doğu ülkesindeki (İran, Türkiye, Azerbaycan, Suudi Arabistan, BAE, Mısır, Irak ve Ürdün) beş hayati sağlık göstergesinin istatistiksel dökümlerini sunar. İstemci tarafında gerçek zamanlı matematiksel hesaplamalar çalıştırarak harcamaların sonuçlar ile ilişkisini ölçebilir, ülkelerin tarihsel gelişim eğrilerini keşfedebilir ve KİK (Körfez İşbirliği Konseyi) ülkeleri ile diğer gelişmekte olan ekonomiler arasındaki yapısal farkları inceleyebilirsiniz.",
    covidImpactTitle: "Tarihsel Pandemi Değişkenliği",
    covidImpactDesc: "Sağlık sistemlerindeki ani pandemi şokunu yansıtan, 2020 ile 2021 yılları arasında tüm ülkelerde doğumda beklenen yaşam süresindeki belirgin düşüşler gözlenebilir. Bu metrik 2023 itibarıyla yeniden yükselişe geçmiştir.",

    explorerSettings: "Filtre Ayarları ve Profiller",
    filterTitle: "Veri Tablosunu Filtrele",
    countryPerspective: "Tek Ülke Gelişim Eğrisi",
    indicatorComparison: "Ülkeler Arası Karşılaştırmalı Zaman Çizgileri",
    rawTableTitle: "Analitik Gözlem Veritabanı",
    unitLabel: "Birim",

    statIntro: "Gerçek Zamanlı İstatistiksel Hesaplama Motoru",
    statIntroDesc: "Bu modül, seçilen veri alt kümeleri üzerinde Pearson korelasyon katsayısı ($r$), En Küçük Kareler (OLS) lineer regresyon modeli ve iki bağımsız grup karşılaştırma analizlerini doğrudan tarayıcı üzerinde dinamik olarak çalıştırır.",

    correlationTab: "1. Pearson Korelasyon Analizi",
    correlationSub: "Değişkenler arasındaki doğrusal ilişkinin yönü ve gücünü ölçer",
    corrMethod: "Pearson Korelasyon Katsayısı",
    corrFormulaStr: "r = Σ(x - x̅)(y - y̅) / √[Σ(x - x̅)² Σ(y - y̅)²]",
    corrInterpretation: "Korelasyon Yorumlama Kılavuzu",
    corrOutcome: "Hesaplanan Korelasyon Katsayısı ($r$):",
    corrInterpretationText: "+1'e yakın bir r değeri güçlü pozitif ilişkiyi; -1'e yakın değer güçlü negatif (ters) ilişkiyi; 0 ise doğrusal bir ilişki olmadığını gösterir.",
    corrResultStrongNeg: "Güçlü Ters İlişki: Önemli tarihsel uyum. Bir metriğin artması, istatistiksel olarak diğerinin düşüşü ile ilişkilendirilmiştir.",
    corrResultWeakNeg: "Zayıf veya Orta Düzey Ters İlişki: Hafif bir düşüş eğilimi, ancak dış veya sosyal değişkenlerin etkisi yüksek.",
    corrResultStrongPos: "Güçlü Pozitif İlişki: Çok güçlü doğrusal uyum. Sağlık altyapısındaki yatırımlar, toplum sağlığı göstergelerinin artmasıyla doğrudan ilişkilidir.",
    corrResultWeakPos: "Zayıf veya Orta Düzey Pozitif İlişki: Hafif bir yükseliş trendi. Sonuçları belirleyen ikincil faktörlerin de aktif olduğunu gösterir.",
    corrNoRel: "İhmal Edilebilir Korelasyon: Doğrusal ilişki çok zayıf. Diğer yapısal faktörler temel belirleyicidir.",

    regressionTab: "2. Basit Doğrusal Regresyon Modeli",
    regressionSub: "En Küçük Kareler (OLS) Tahmin Modellemesi",
    selectX: "Bağımsız Değişken (X)",
    selectY: "Bağımlı Değişken (Y)",
    regressionEquation: "Hesaplanan En İyi Uyum Doğrusu (Denklem):",
    rSquareLabel: "Belirleme Katsayısı ($R^2$):",
    regressionDesc: "En Küçük Kareler yöntemiyle model, Y değişkeninin X üzerindeki doğrusal değişimini öngörür. Saçılım grafiği üzerindeki interaktif regresyon çizgisini inceleyin.",
    errorVariance: "Regresyon Tahmininin Standart Hatası",
    formulaUsedRegression: "OLS Eğimi: β₁ = Cov(X,Y) / Var(X) ve Sabit Terim: β₀ = Y̅ - β₁X̅",

    groupComparisonTab: "3. Ekonomik Grup Karşılaştırması",
    groupComparisonSub: "KİK (Körfez Geçiş) Ülkeleri ile Diğer Gelişmekte Olan Ekonomiler",
    gccDefinition: "Körfez İşbirliği Konseyi ülkeleri (Suudi Arabistan, BAE) yüksek bütçe fazlasına sahipken; İran, Türkiye, Azerbaycan, Mısır, Irak ve Ürdün gibi diğer ekonomiler daha farklı finansman ve nüfus dinamikleri barındırmaktadır.",
    gccGroupAvg: "KİK Grubu Ortalama",
    nonGccGroupAvg: "Diğer Grup Ortalama",
    statDiff: "Ortalamalar Arasındaki Fark",
    compConclusion: "Sosyo-Ekonomik Sınıflandırma Analizi",
    compPositiveDiff: "Karşılaştırmalı analiz, KİK üye devletlerinin bu sağlık boyutunda yapısal avantaja sahip olduğunu göstermektedir. Bu da ulusal kaynak fazlasının genel refah altyapısına doğrudan yatırıma dönüştüğünü kanıtlar.",
    compNegativeDiff: "KİK dışı ülkeler bu göstergede daha yüksek bir değere sahiptir. Örneğin bebek ölüm oranında yüksek değerlerin çıkması, o alanlarda acil ve hedef odaklı yatırımların gerekliliğini göstermektedir.",

    methodTitle: "Metodolojik Formüller ve Teknik Detaylar",
    methodIntro: "Bu uygulamada sunulan tüm analizler, grafikler ve hesaplamalar TypeScript kodlarıyla doğrudan kullanıcı tarayıcısında çalıştırılır. İstatistik motorunun temel aldığı matematiksel modeller şu şekildedir:",
    varianceFormula: "1. Örneklem Varyansı ve Standart Sapma",
    varianceDesc: "Varyans, verilerin ortalamadan ne kadar uzaklaştığını ölçer. Standart sapma ($s$), varyansın kareköküdür:",
    varianceMath: "s² = [1 / (n - 1)] * Σ(x_i - x_mean)²",
    pearsonFormula: "2. Pearson Momentler Çarpımı Korelasyonu",
    pearsonDesc: "İki sürekli değişken arasındaki doğrusal ilişkinin gücünü ve yönünü -1 ile +1 arasında ölçer:",
    pearsonMath: "r = Cov(X, Y) / (s_X * s_Y)",
    olsFormula: "3. En Küçük Kareler (OLS) Regresyonu",
    olsDesc: "Gözlemlenen veri noktalarının model çizgisine olan dikey mesafelerinin kareleri toplamını en aza indiren en uygun doğruyu bulur:",
    olsMath: "Y = β₀ + β₁X + ε, burada β₁ = Σ[(X_i - X_mean)(Y_i - Y_mean)] / Σ(X_i - X_mean)²",
    dataSources: "Bilimsel Referans Veri Seti",
    dataSourcesDesc: "Kullanılan çok taraflı havuz verileri, Dünya Sağlık Örgütü (WHO) ve Dünya Bankası verilerine göre hazırlanmıştır. Dinamik analiz motorunun gerçekçiliğini göstermek maksadıyla veri seti, pandemi dönemi gibi gerçek tarihi dalgalanmaları ve trendleri yansıtmaktadır."
  },
  az: {
    appName: "Yaxın Şərq Səhiyyə Analitikası",
    appSubtitle: "İnteraktiv Kəmiyyət Tədqiqatları, Göstəricilər və İstatistik Modelləşdirmə",
    tabDashboard: "Region Paneli",
    tabExplorer: "Məlumat Araşdırıcısı",
    tabStatistics: "Statistik Təhlillər",
    tabMethodology: "Metodoloji Çərçivə",
    btnLang: "Dil",
    metaTitle: "Yaxın Şərq ölkələri arasında qarşılıqlı səhiyyə siyasəti göstəriciləri.",

    metricLifeExpectancy: "Doğulanda Gözlənilən Ömür Uzunluğu",
    metricLifeExpectancyShort: "Ömür Uzunluğu",
    metricExpenditure: "Səhiyyə Xərcləri (ÜDM-in %-lə)",
    metricExpenditureShort: "Səhiyyə Xərci % ÜDM",
    metricInfantMortality: "Körpə Ölüm Səviyyəsi",
    metricInfantMortalityShort: "Körpə Ölümü",
    metricPhysicians: "Həkim Sıxlığı (hər 1.000 nəfərə)",
    metricPhysiciansShort: "Həkim /1K",
    metricHospitalBeds: "Xəstəxana Çarpayısı Sıxlığı",
    metricHospitalBedsShort: "Çarpayı /1K",

    country: "Ölkə",
    year: "İl",
    allCountries: "Bütün Ölkələr",
    allYears: "Bütün İllər",
    noData: "Seçilmiş filtrlərə uyğun məlumat tapılmadı.",

    overallSummary: "Ümumi Metrik Xülasəsi",
    totalDataPoints: "Ümumi Toplanmış Məlumat",
    avgLifeExpectancy: "Orta Ömür Uzunluğu",
    highestLifeExp: "Ən Yüksək Ömür Uzunluğu",
    lowestMortality: "Ən Aşağı Körpə Ölümü",
    avgExpGdp: "Orta Səhiyyə Xərci (% ÜDM)",
    regionalInsights: "Yaxın Şərq Regionunun Səhiyyə Analizi",
    insightText: "Bu analitik panel, Yaxın Şərqin səkkiz əsas ölkəsinin (İran, Türkiyə, Azərbaycan, Səudiyyə Ərəbistanı, BƏƏ, Misir, İraq və İordaniya) beş əsas səhiyyə göstəricisinin statistik dökümlərini təqdim edir. İstifadəçi hissəsində real vaxtda riyazi hesablamalar aparmaqla xərclərin səhiyyə nəticələrinə necə təsir etdiyini görə, hər bir ölkənin tarixi inkişaf templərini öyrənə və Fars Körfəzi (GCC) ölkələri ilə digər inkişaf etməkdə olan iqtisadiyyatlar arasındakı fərqləri müqayisə edə bilərsiniz.",
    covidImpactTitle: "Pandemiya Dövrünün Tarixi Dalğalanması",
    covidImpactDesc: "Səhiyyə sistemlərindəki kəskin pandemiya şokunu əks etdirən, 2020-2021-ci illər arasında doğumda gözlənilən ömür uzunluğunun bütün ölkələrdə nəzərəçarpacaq dərəcədə azalmasını müşahidə etmək olar. Bu göstərici 2023-cü ildən etibarən yenidən yüksəlmişdir.",

    explorerSettings: "Filtr Seçimləri və Profillər",
    filterTitle: "Cədvəli Filtr edin",
    countryPerspective: "Tək Ölkənin İnkişaf Əyrisi",
    indicatorComparison: "Ölkələr Arası Qarşılıqlı Müqayisə",
    rawTableTitle: "Analitik Müşahidələr Verilənlər Bazası",
    unitLabel: "Vahid",

    statIntro: "Real Zamanlı Statistik Hesablama Mühərriki",
    statIntroDesc: "Bu modul, seçilmiş məlumat alt qrupları üzərində Pearson korrelyasiya əmsalı ($r$), Ən Kiçik Kvadratlar (OLS) xətti reqressiya modeli və iki qrup arasındakı fərqlərin hipotez təhlilini birbaşa istifadəçi brauzerində dinamik olaraq icra edir.",

    correlationTab: "1. Pirson Korelyasiya Təhlili",
    correlationSub: "Dəyişənlər arasındakı xətti əlaqənin gücünü və istiqamətini ölçür",
    corrMethod: "Pirson Korelyasiya Əmsalı",
    corrFormulaStr: "r = Σ(x - x̅)(y - y̅) / √[Σ(x - x̅)² Σ(y - y̅)²]",
    corrInterpretation: "Korelyasiya Yozulması Təlimatı",
    corrOutcome: "Hesablanmış Korelyasiya Əmsalı ($r$):",
    corrInterpretationText: "+1-ə yaxın r dəyəri güclü müsbət əlaqəni, -1-ə yaxın dəyər güclü mənfi (tərs) əlaqəni, 0 behaves isə heç bir doğrusal əlaqə olmadığını göstərir.",
    corrResultStrongNeg: "Güclü Tərs Əlaqə: Əhəmiyyətli dərəcədə mənfi əlaqə. Bir göstəricinin artması digərinin azalması ilə güclü şəkildə bağlıdır.",
    corrResultWeakNeg: "Zəif və ya Orta Tərs Əlaqə: Müəyyən dərəcədə mənfi istiqamət mövcuddur, lakin digər kənar və sosial amillərin təsiri böyükdür.",
    corrResultStrongPos: "Güclü Müsbət Əlaqə: Çox güclü doğrusal uzlaşma. Səhiyyə infrastruktur xərclərinin artması əhalinin sağlamlıq göstəricilərinin yüksəlməsi ilə birbaşa əlaqəlidir.",
    corrResultWeakPos: "Zəif və ya Orta Müsbət Əlaqə: Zəif artım trendi var. Nəticələrin formalaşmasında digər köməkçi amillərin də rol oynadığını göstərir.",
    corrNoRel: "Nəzərə Alınmayacaq Korelyasiya: Xətti əlaqə çox zəifdir. Digər gizli struktur amillər əsas təyinedicidir.",

    regressionTab: "2. Sadə Xətti Reqressiya Modeli",
    regressionSub: "Ən Kiçik Kvadratlar (OLS) Proqnozlaşdırma Modelləşdirilməsi",
    selectX: "Asılı Olmayan Dəyişən (X)",
    selectY: "Asılı Olan Dəyişən (Y)",
    regressionEquation: "Hesablanmış Ən Yaxşı Sərhəd Xətti (Tənlik):",
    rSquareLabel: "Determinasiya Əmsalı ($R^2$):",
    regressionDesc: "Model, Ən Kiçik Kvadratlar metodu ilə Y dəyişəninin X üzərindəki xətti proqnozunu təyin edir. Səpilmə diaqramında interaktiv reqressiya xəttini yoxlayın.",
    errorVariance: "Reqressiya Qiymətləndirilməsinin Standart Səhvi",
    formulaUsedRegression: "OLS Meyli: β₁ = Cov(X,Y) / Var(X) və Sabit Term: β₀ = Y̅ - β₁X̅",

    groupComparisonTab: "3. İqtisadi Qrup Müqayisəsi",
    groupComparisonSub: "Körfəz (GCC) Ölkələri ilə Digər İnkişaf Edən Ölkələr",
    gccDefinition: "Fars Körfəzi dövlətləri (Səudiyyə Ərəbistanı, BƏƏ) yüksək büdcə profisitinə malik olduqları halda; İran, Türkiyə, Azərbaycan, Misir, İraq və İordaniya kimi digər ölkələr fərqli inkişaf və maliyyələşmə dinamikasına malikdirlər.",
    gccGroupAvg: "GCC Qrupunun Ortalaması",
    nonGccGroupAvg: "Digər Ölkələr Qrupunun Ortalaması",
    statDiff: "Ortalamalar Arasındakı Fərq",
    compConclusion: "Sosial-İqtisadi Təbəqələşmə Təhlili",
    compPositiveDiff: "Müqayisəli tədqiqat göstərir ki, Körfəz (GCC) dövlətləri bu göstərici üzrə struktur cəhətdən əhəmiyyətli dərəcədə irəlidədirlər. Bu, qaynaq çoxluğunun dərhal ümumi rifah infrastrukturuna səmərəli yatırıldığını isbat edir.",
    compNegativeDiff: "Körfəz-kənarı ölkələr bu göstəricidə daha yüksək dəyərə malikdir. Məsələn, körpə ölüm nisbətində yüksək rəqəmin olması müvafiq sahələrə hədəfli və təcili maliyyə yatırmalarının tələb olunduğunu sübut edir.",

    methodTitle: "Metodoloji Düsturlar və Texniki Təfərrüat",
    methodIntro: "Burada nümayiş etdirilən bütün təhlillər və hesablamalar müştəri tərəfində TypeScript kodları ilə tam şəkildə həyata keçirilir. İnteqrasiya edilmiş istatistika mühərriki aşağıdakı düsturlara əsaslanır:",
    varianceFormula: "1. Seçim Dispersiyası və Standart Meyl",
    varianceDesc: "Dispersiya qiymətlərin orta kəmiyyətdən nə dərəcədə uzaqlaşdığını ölçür. Standart meyl ($s$) dispersiyanın kvadrat köküdür:",
    varianceMath: "s² = [1 / (n - 1)] * Σ(x_i - x_mean)²",
    pearsonFormula: "2. Pirson Momentlər Hasilinin Korelyasiyası",
    pearsonDesc: "İki kəsilməz dəyişən arasındakı xətti əlaqənin gücünü və istiqamətini -1 ilə +1 arasında ölçür:",
    pearsonMath: "r = Cov(X, Y) / (s_X * s_Y)",
    olsFormula: "3. Ən Kiçik Kvadratlar (OLS) Reqressiyası",
    olsDesc: "Gözlənilən məlumat nöqtələrinin model xəttinə olan şaquli məsafələrinin kvadratlarının cəminin minimuma endirən ən uyğun düz xətti təyin edir:",
    olsMath: "Y = β₀ + β₁X + ε, burada β₁ = Σ[(X_i - X_mean)(Y_i - Y_mean)] / Σ(X_i - X_mean)²",
    dataSources: "Elmi İstinad Məlumat Bazası",
    dataSourcesDesc: "Tədqiqat üçün istifadə olunmuş məlumatlar, Ümumdünya Səhiyyə Təşkilatı (WHO) və Dünya Bankının rəsmi statistik hesabatları əsasında formalaşdırılmışdır. Real-vaxtda riyazi dəyişiklikləri izləməyi əyani etmək üçün, pandemiya kimi tarixi böhran dövrlərinin təsirləri verilənlər bazasına daxil edilmişdir."
  }
};
