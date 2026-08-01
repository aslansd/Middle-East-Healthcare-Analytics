import { useCallback, useEffect, useRef, useState } from "react";
import { COUNTRIES, HEALTHCARE_DATA, YEARS } from "../data";
import type { HealthcareRecord } from "../data";

export interface AnalysisScope {
  countries: string[];
  yearFrom: number;
  yearTo: number;
}

export const DEFAULT_SCOPE: AnalysisScope = {
  countries: [...COUNTRIES],
  yearFrom: YEARS[0],
  yearTo: YEARS[YEARS.length - 1]
};

export function applyScope(
  data: HealthcareRecord[],
  scope: AnalysisScope
): HealthcareRecord[] {
  const allowed = new Set(scope.countries);
  const low = Math.min(scope.yearFrom, scope.yearTo);
  const high = Math.max(scope.yearFrom, scope.yearTo);
  return data.filter(
    (record) =>
      allowed.has(record.country) && record.year >= low && record.year <= high
  );
}

export function scopedData(scope: AnalysisScope): HealthcareRecord[] {
  return applyScope(HEALTHCARE_DATA, scope);
}

export function isDefaultScope(scope: AnalysisScope): boolean {
  return (
    scope.yearFrom === DEFAULT_SCOPE.yearFrom &&
    scope.yearTo === DEFAULT_SCOPE.yearTo &&
    scope.countries.length === DEFAULT_SCOPE.countries.length
  );
}

/* ------------------------------------------------------------------ *
 * Shareable view state, encoded in the URL hash.
 * The hash is used rather than the query string so that a static host
 * (and Cloud Run's SPA fallback) never has to handle the extra routes.
 * ------------------------------------------------------------------ */

export interface ViewState {
  tab: string;
  lang: string;
  countries: string[];
  yearFrom: number;
  yearTo: number;
  x: string;
  y: string;
  group: string;
  indicator: string;
}

export function encodeViewState(state: ViewState): string {
  const params = new URLSearchParams();
  params.set("tab", state.tab);
  params.set("lang", state.lang);
  params.set("from", String(state.yearFrom));
  params.set("to", String(state.yearTo));
  params.set("x", state.x);
  params.set("y", state.y);
  params.set("g", state.group);
  params.set("i", state.indicator);
  // Only record the country list when it differs from "everything".
  if (state.countries.length !== COUNTRIES.length) {
    params.set("c", state.countries.join("|"));
  }
  return params.toString();
}

export function decodeViewState(hash: string): Partial<ViewState> {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw) return {};

  const params = new URLSearchParams(raw);
  const result: Partial<ViewState> = {};

  const readString = (key: string, field: keyof ViewState) => {
    const value = params.get(key);
    if (value) (result as Record<string, unknown>)[field] = value;
  };

  readString("tab", "tab");
  readString("lang", "lang");
  readString("x", "x");
  readString("y", "y");
  readString("g", "group");
  readString("i", "indicator");

  const from = Number(params.get("from"));
  const to = Number(params.get("to"));
  if (Number.isFinite(from) && from > 0) result.yearFrom = from;
  if (Number.isFinite(to) && to > 0) result.yearTo = to;

  const countries = params.get("c");
  if (countries) {
    // Discard unknown names so a stale link cannot produce an empty dataset.
    const valid = countries.split("|").filter((c) => COUNTRIES.includes(c));
    if (valid.length > 0) result.countries = valid;
  }

  return result;
}

/** Writes view state to the URL hash without adding history entries. */
export function useHashSync(state: ViewState, enabled = true): void {
  const lastWritten = useRef<string>("");

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const encoded = encodeViewState(state);
    if (encoded === lastWritten.current) return;
    lastWritten.current = encoded;
    window.history.replaceState(null, "", `${window.location.pathname}#${encoded}`);
  }, [state, enabled]);
}

/** Reads the hash once on mount, so deep links restore the saved view. */
export function useInitialHashState(): Partial<ViewState> {
  const [initial] = useState<Partial<ViewState>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return decodeViewState(window.location.hash);
    } catch {
      return {};
    }
  });
  return initial;
}

/** Copies the current URL, returning false when the clipboard is unavailable. */
export function useCopyLink(): [boolean, () => Promise<boolean>] {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch {
      return false;
    }
  }, []);

  return [copied, copy];
}
