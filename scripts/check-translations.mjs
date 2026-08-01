#!/usr/bin/env node
/**
 * Verifies that every language defines the same set of translation keys, and
 * that every t("...") call in the source has a matching key.
 *
 * This exists because a missing key fails silently at runtime: t() falls back
 * to English, and if English lacks it too, the raw key name is rendered to the
 * user. That is how "selectIndicator:" ended up visible in the UI.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "src");

let failed = false;
const fail = (message) => {
  console.error(`  ✗ ${message}`);
  failed = true;
};

/* ---- Parse the translation keys out of data.ts ---- */

const dataSource = readFileSync(join(srcDir, "data.ts"), "utf8");

const translationsStart = dataSource.indexOf("export const TRANSLATIONS");
if (translationsStart === -1) {
  console.error("Could not locate TRANSLATIONS in src/data.ts");
  process.exit(1);
}
const translationsBlock = dataSource.slice(translationsStart);

// Language blocks look like:  en: {  ...  },
const languageBlocks = {};
const languageHeader = /^ {2}([a-z]{2}): \{$/gm;
let match;
const starts = [];
while ((match = languageHeader.exec(translationsBlock)) !== null) {
  starts.push({ code: match[1], index: match.index });
}

starts.forEach((entry, i) => {
  const end = i + 1 < starts.length ? starts[i + 1].index : translationsBlock.length;
  languageBlocks[entry.code] = translationsBlock.slice(entry.index, end);
});

const keysByLanguage = {};
for (const [code, block] of Object.entries(languageBlocks)) {
  const keys = new Set();
  // Match "    keyName:" at the start of a line inside the block.
  const keyPattern = /^ {4}([A-Za-z0-9_]+):/gm;
  let keyMatch;
  while ((keyMatch = keyPattern.exec(block)) !== null) {
    keys.add(keyMatch[1]);
  }
  keysByLanguage[code] = keys;
}

const languages = Object.keys(keysByLanguage);
if (languages.length === 0) {
  console.error("No language blocks were found in TRANSLATIONS.");
  process.exit(1);
}

console.log(
  `Checking ${languages.length} languages (${languages.join(", ")})…`
);

/* ---- 1. Every language must define the same keys as English ---- */

const englishKeys = keysByLanguage.en;
if (!englishKeys) {
  console.error("English ('en') is required as the fallback language.");
  process.exit(1);
}

console.log(`\nKey parity (English defines ${englishKeys.size} keys):`);
for (const code of languages) {
  if (code === "en") continue;
  const keys = keysByLanguage[code];
  const missing = [...englishKeys].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !englishKeys.has(k));

  if (missing.length === 0 && extra.length === 0) {
    console.log(`  ✓ ${code}: ${keys.size} keys, complete`);
  } else {
    if (missing.length > 0) fail(`${code} is missing: ${missing.join(", ")}`);
    if (extra.length > 0) fail(`${code} has keys English lacks: ${extra.join(", ")}`);
  }
}

/* ---- 2. Every t("key") in the source must resolve ---- */

const sourceFiles = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (/\.tsx?$/.test(entry)) sourceFiles.push(full);
  }
};
walk(srcDir);

const usedKeys = new Map();
for (const file of sourceFiles) {
  const content = readFileSync(file, "utf8");
  const callPattern = /\bt\(\s*"([A-Za-z0-9_]+)"\s*\)/g;
  let callMatch;
  while ((callMatch = callPattern.exec(content)) !== null) {
    if (!usedKeys.has(callMatch[1])) usedKeys.set(callMatch[1], file);
  }
}

console.log(`\nUsage check (${usedKeys.size} literal t() keys found):`);
const unresolved = [...usedKeys.entries()].filter(([key]) => !englishKeys.has(key));

if (unresolved.length === 0) {
  console.log("  ✓ every t() key resolves to a translation");
} else {
  for (const [key, file] of unresolved) {
    fail(`t("${key}") has no translation — ${file.replace(root + "/", "")}`);
  }
}

/* ---- 3. Warn about keys defined but never referenced ---- */

// Keys resolved indirectly (via labelKey, guide keys, effect-size keys) are
// referenced dynamically, so they are excluded from the unused report.
const dynamicPrefixes = ["metric", "corrResult", "corrNoRel", "effect"];
const unused = [...englishKeys].filter(
  (key) =>
    !usedKeys.has(key) && !dynamicPrefixes.some((prefix) => key.startsWith(prefix))
);

if (unused.length > 0) {
  console.log(`\nNote: ${unused.length} keys defined but not referenced directly:`);
  console.log(`  ${unused.join(", ")}`);
}

console.log("");
if (failed) {
  console.error("Translation check failed.\n");
  process.exit(1);
}
console.log("Translation check passed.\n");
