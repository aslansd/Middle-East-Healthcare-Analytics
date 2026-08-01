import { FileText } from "lucide-react";
import { COUNTRIES, TOTAL_RECORDS, YEARS } from "../data";
import { Panel } from "../components/ui";

interface MethodologyTabProps {
  t: (key: string) => string;
}

export function MethodologyTab({ t }: MethodologyTabProps) {
  const formulaCards = [
    {
      badge: "Dispersion",
      badgeClass:
        "text-pink-600 bg-pink-50 dark:text-pink-300 dark:bg-pink-500/15",
      title: t("varianceFormula"),
      description: t("varianceDesc"),
      math: t("varianceMath"),
      // Corrected: the original said Bessel's correction yields "unbiased
      // statisticians", and overstated what the correction does.
      note: "The (n − 1) divisor is Bessel's correction. It makes the sample variance an unbiased estimator of the population variance; the sample standard deviation remains slightly biased."
    },
    {
      badge: "Association",
      badgeClass:
        "text-violet-600 bg-violet-50 dark:text-violet-300 dark:bg-violet-500/15",
      title: t("pearsonFormula"),
      description: t("pearsonDesc"),
      math: t("pearsonMath"),
      note: "Dividing the covariance by both standard deviations rescales it to the interval [−1, +1], which makes coefficients comparable across indicators measured in different units."
    },
    {
      badge: "Prediction",
      badgeClass:
        "text-cyan-600 bg-cyan-50 dark:text-cyan-300 dark:bg-cyan-500/15",
      title: t("olsFormula"),
      description: t("olsDesc"),
      math: t("olsMath"),
      // Corrected: a simple OLS fit is a closed-form calculation, not a
      // recursive one over matrices.
      note: "For a single predictor the coefficients have a closed-form solution, so no iteration is needed: the slope is the covariance of X and Y divided by the variance of X."
    },
    {
      badge: "Inference",
      badgeClass:
        "text-teal-600 bg-teal-50 dark:text-teal-300 dark:bg-teal-500/15",
      title: "4. Welch's t-test and p-values",
      description:
        "Group means are compared with Welch's t-test, which does not assume the two groups share a variance or a sample size. p-values come from the Student t distribution, evaluated with a regularised incomplete beta function.",
      math: "t = (x̄₁ − x̄₂) / √(s₁²/n₁ + s₂²/n₂)",
      note: "Degrees of freedom use the Welch–Satterthwaite approximation, so they are usually fractional rather than a whole number."
    }
  ];

  return (
    <div className="space-y-8">
      <Panel className="p-6 sm:p-8">
        <div className="max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300 text-xs font-semibold rounded-full">
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            <span>How the numbers are produced</span>
          </div>
          <h2 className="text-2xl font-bold text-ink font-display">{t("methodTitle")}</h2>
          <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
            {t("methodIntro")}
          </p>
        </div>
      </Panel>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formulaCards.map((card) => (
          <Panel key={card.badge} className="p-6 space-y-4">
            <div
              className={`p-2 px-3 rounded-lg w-fit text-xs font-bold font-mono ${card.badgeClass}`}
            >
              {card.badge}
            </div>
            <h4 className="font-bold text-base text-ink">{card.title}</h4>
            <p className="text-xs text-muted leading-relaxed">{card.description}</p>
            <div className="bg-slate-900 dark:bg-inverse border border-slate-800 dark:border-line text-teal-400 py-4 px-3 rounded-xl font-mono text-xs text-center font-bold overflow-x-auto">
              {card.math}
            </div>
            <p className="text-[10px] text-faint leading-relaxed">{card.note}</p>
          </Panel>
        ))}
      </div>

      {/* Assumptions — stated plainly rather than left implicit. */}
      <Panel className="p-6 sm:p-8">
        <h3 className="text-lg font-bold text-ink font-display">
          Assumptions and limitations
        </h3>
        <ul className="mt-4 space-y-3 text-xs sm:text-sm text-muted leading-relaxed list-disc ps-5 max-w-4xl">
          <li>
            <span className="font-semibold text-ink-soft">Panel structure.</span>{" "}
            {t("independenceCaveat")}
          </li>
          <li>
            <span className="font-semibold text-ink-soft">Correlation is not causation.</span>{" "}
            A strong coefficient between spending and outcomes does not establish
            that one produces the other. Wealth, demographics and baseline health
            all move together in this region.
          </li>
          <li>
            <span className="font-semibold text-ink-soft">Linearity.</span> Every
            model here fits a straight line. Relationships that flatten out at
            high spending levels will be understated.
          </li>
          <li>
            <span className="font-semibold text-ink-soft">Small groups.</span> The
            GCC group contains two countries, so its mean is sensitive to a single
            country's trajectory. The reported confidence interval reflects that
            uncertainty; read it alongside the point estimate.
          </li>
          <li>
            <span className="font-semibold text-ink-soft">Unweighted means.</span>{" "}
            Country-year observations are averaged without weighting by
            population, so a small country counts as much as a large one.
          </li>
        </ul>
      </Panel>

      <Panel className="p-6 sm:p-8">
        <div className="max-w-4xl space-y-3">
          <h3 className="text-lg font-bold text-ink font-display">{t("dataSources")}</h3>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            {t("dataSourcesDesc")}
          </p>

          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <div>
              <dt className="text-[10px] uppercase font-bold tracking-wider text-faint">
                Observations
              </dt>
              <dd className="text-lg font-bold text-ink font-mono">{TOTAL_RECORDS}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase font-bold tracking-wider text-faint">
                Countries
              </dt>
              <dd className="text-lg font-bold text-ink font-mono">{COUNTRIES.length}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase font-bold tracking-wider text-faint">
                Years
              </dt>
              <dd className="text-lg font-bold text-ink font-mono">
                {YEARS[0]}–{YEARS[YEARS.length - 1]}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase font-bold tracking-wider text-faint">
                Indicators
              </dt>
              <dd className="text-lg font-bold text-ink font-mono">5</dd>
            </div>
          </dl>

          <div className="pt-4 flex flex-wrap gap-2.5">
            {[
              "World Health Organization",
              "World Bank Open Data",
              "Regional policy reviews"
            ].map((source) => (
              <span
                key={source}
                className="bg-raised text-ink-soft text-xs font-bold px-3 py-1 rounded-full border border-line"
              >
                {source}
              </span>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}
