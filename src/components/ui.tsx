import React, { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ *
 * ChartFrame
 * Measures its own box and hands explicit pixel dimensions to Recharts.
 * ------------------------------------------------------------------ */

interface ChartFrameProps {
  children: (width: number, height: number) => React.ReactNode;
  className?: string;
  /** Accessible description of what the chart shows. */
  label: string;
}

export function ChartFrame({ children, className = "", label }: ChartFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const measure = () => {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize((current) => {
          const width = Math.floor(rect.width);
          const height = Math.floor(rect.height);
          // Skip no-op updates to avoid a resize/render feedback loop.
          if (current.width === width && current.height === height) return current;
          return { width, height };
        });
      }
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={label}
      className={`w-full h-full min-h-[200px] relative ${className}`}
    >
      {size.width > 0 && size.height > 0 ? children(size.width, size.height) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Layout primitives, so panel styling stays consistent across tabs.
 * ------------------------------------------------------------------ */

export function Panel({
  children,
  className = "",
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-surface border border-line rounded-2xl shadow-sm ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Eyebrow({
  children,
  tone = "teal"
}: {
  children: React.ReactNode;
  tone?: "teal" | "violet" | "amber" | "rose";
}) {
  const tones: Record<string, string> = {
    teal: "text-teal-700 dark:text-teal-300",
    violet: "text-violet-700 dark:text-violet-300",
    amber: "text-amber-700 dark:text-amber-300",
    rose: "text-rose-700 dark:text-rose-300"
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function StatTile({
  label,
  value,
  hint,
  emphasis = false
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`p-3 rounded-xl border ${
        emphasis
          ? "bg-teal-50 border-teal-100 dark:bg-teal-500/10 dark:border-teal-500/30"
          : "bg-raised border-hairline"
      }`}
    >
      <span
        className={`text-[10px] uppercase font-bold tracking-wider block ${
          emphasis ? "text-teal-700 dark:text-teal-300" : "text-faint"
        }`}
      >
        {label}
      </span>
      <p
        className={`text-lg font-bold font-mono mt-1 break-words ${
          emphasis ? "text-teal-800 dark:text-teal-200" : "text-ink"
        }`}
      >
        {value}
      </p>
      {hint ? <span className="text-[10px] text-faint font-medium">{hint}</span> : null}
    </div>
  );
}

export function LabelledSelect({
  id,
  label,
  value,
  onChange,
  children,
  className = ""
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label htmlFor={id} className="text-xs font-semibold text-muted whitespace-nowrap">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="px-2.5 py-1.5 text-xs bg-raised border border-line rounded-lg font-semibold text-ink-soft outline-none focus:border-teal-500 cursor-pointer max-w-full"
      >
        {children}
      </select>
    </div>
  );
}

/** Renders "Significant" / "Not significant" consistently across panels. */
export function SignificanceBadge({
  significant,
  yesLabel,
  noLabel
}: {
  significant: boolean;
  yesLabel: string;
  noLabel: string;
}) {
  return (
    <span
      className={`font-bold px-2 py-0.5 rounded text-[10px] whitespace-nowrap ${
        significant
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "bg-raised text-muted"
      }`}
    >
      {significant ? yesLabel : noLabel}
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-10 text-center text-sm text-faint font-medium">{message}</div>
  );
}
