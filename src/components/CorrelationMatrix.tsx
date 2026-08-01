import { useMemo } from "react";
import { INDICATORS } from "../data";
import type { HealthcareRecord } from "../data";
import { getPearsonCorrelation, formatPValue } from "../statistics";
import type { NumericIndicatorKey } from "../statistics";
import { correlationColor } from "../theme";

interface CorrelationMatrixProps {
  data: HealthcareRecord[];
  isDark: boolean;
  t: (key: string) => string;
  /** Called when a cell is clicked, so the regression panel can follow along. */
  onSelectPair?: (x: NumericIndicatorKey, y: NumericIndicatorKey) => void;
  activePair?: { x: NumericIndicatorKey; y: NumericIndicatorKey };
}

export function CorrelationMatrix({
  data,
  isDark,
  t,
  onSelectPair,
  activePair
}: CorrelationMatrixProps) {
  const keys = INDICATORS.map((i) => i.id as NumericIndicatorKey);

  const cells = useMemo(
    () =>
      keys.map((rowKey) =>
        keys.map((colKey) => {
          if (rowKey === colKey) {
            return { r: 1, pValue: 0, significant: false, diagonal: true };
          }
          const result = getPearsonCorrelation(data, colKey, rowKey);
          return {
            r: result.r,
            pValue: result.pValue,
            significant: result.significant,
            diagonal: false
          };
        })
      ),
    [data]
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-xs">
        <caption className="sr-only">{t("corrMatrixDesc")}</caption>
        <thead>
          <tr>
            <th scope="col" className="p-1" />
            {INDICATORS.map((indicator) => (
              <th
                key={indicator.id}
                scope="col"
                className="p-1 text-[10px] font-bold text-muted uppercase tracking-tight align-bottom text-center min-w-[64px]"
              >
                {t(indicator.shortLabelKey)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {INDICATORS.map((rowIndicator, rowIndex) => (
            <tr key={rowIndicator.id}>
              <th
                scope="row"
                className="p-1 text-[10px] font-bold text-muted uppercase tracking-tight text-start whitespace-nowrap"
              >
                {t(rowIndicator.shortLabelKey)}
              </th>

              {INDICATORS.map((colIndicator, colIndex) => {
                const cell = cells[rowIndex][colIndex];
                const isActive =
                  activePair &&
                  activePair.x === colIndicator.id &&
                  activePair.y === rowIndicator.id;

                const title = cell.diagonal
                  ? `${t(rowIndicator.labelKey)}`
                  : `${t(colIndicator.labelKey)} → ${t(rowIndicator.labelKey)}\nr = ${cell.r.toFixed(4)}\n${t("pValueLabel")}: ${formatPValue(cell.pValue)}`;

                return (
                  <td key={colIndicator.id} className="p-0">
                    <button
                      type="button"
                      title={title}
                      aria-label={title.replace(/\n/g, ". ")}
                      disabled={cell.diagonal || !onSelectPair}
                      onClick={() =>
                        onSelectPair?.(
                          colIndicator.id as NumericIndicatorKey,
                          rowIndicator.id as NumericIndicatorKey
                        )
                      }
                      style={{
                        backgroundColor: cell.diagonal
                          ? "transparent"
                          : correlationColor(cell.r, isDark)
                      }}
                      className={`w-full h-12 rounded-lg font-mono font-bold text-xs transition-all ${
                        cell.diagonal
                          ? "text-faint border border-dashed border-line cursor-default"
                          : "text-ink cursor-pointer hover:ring-2 hover:ring-teal-500"
                      } ${isActive ? "ring-2 ring-teal-600" : ""}`}
                    >
                      {cell.diagonal ? (
                        <span aria-hidden="true">—</span>
                      ) : (
                        <>
                          {cell.r >= 0 ? "+" : "−"}
                          {Math.abs(cell.r).toFixed(2)}
                          {cell.significant ? (
                            <span
                              className="block text-[9px] font-sans font-semibold opacity-70"
                              aria-hidden="true"
                            >
                              p&lt;.05
                            </span>
                          ) : null}
                        </>
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-4 text-[10px] text-faint font-semibold">
        <span>−1.0</span>
        <div
          className="h-2 w-40 rounded-full"
          style={{
            background: `linear-gradient(to right, ${correlationColor(-1, isDark)}, ${correlationColor(0, isDark)}, ${correlationColor(1, isDark)})`
          }}
          aria-hidden="true"
        />
        <span>+1.0</span>
      </div>
    </div>
  );
}
