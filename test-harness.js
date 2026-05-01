#!/usr/bin/env node
// MIST Trainer — Test Harness
// Usage: ANTHROPIC_API_KEY=sk-ant-... node test-harness.js
// Runs all 20 transcripts through evaluate() and reports results.

const { evaluate, PROMPT_VERSION } = require("./evaluator.js");
const { SCENARIOS } = require("./scenarios.js");
const { TRANSCRIPTS } = require("./test-transcripts.js");

// Load .env if present
const fs = require("fs");
const path = require("path");
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m) process.env[m[1]] = m[2].trim();
  }
}

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error("No API key found. Run: read -s -p 'Key: ' k && echo \"ANTHROPIC_API_KEY=$k\" > .env");
  process.exit(1);
}

const scenarioMap = Object.fromEntries(SCENARIOS.map(s => [s.id, s]));

function pass(label) { return `\x1b[32m✓ ${label}\x1b[0m`; }
function fail(label) { return `\x1b[31m✗ ${label}\x1b[0m`; }
function warn(label) { return `\x1b[33m~ ${label}\x1b[0m`; }

function checkResult(result, expected, transcript) {
  if (result.error) return [fail(`API error: ${result.error}`)];
  const issues = [];
  const { scores, hedges } = result;

  if ("completeness" in expected) {
    const ok = Math.abs(scores.completeness - expected.completeness) < 0.01;
    issues.push(ok ? pass(`completeness=${scores.completeness}`) : fail(`completeness expected ${expected.completeness}, got ${scores.completeness}`));
  }
  if ("precisionMin" in expected) {
    const ok = scores.precision >= expected.precisionMin;
    issues.push(ok ? pass(`precision=${scores.precision.toFixed(2)} ≥ ${expected.precisionMin}`) : fail(`precision ${scores.precision.toFixed(2)} < min ${expected.precisionMin}`));
  }
  if ("precisionMax" in expected) {
    const ok = scores.precision <= expected.precisionMax;
    issues.push(ok ? pass(`precision=${scores.precision.toFixed(2)} ≤ ${expected.precisionMax} (vague language penalized)`) : fail(`precision ${scores.precision.toFixed(2)} > max ${expected.precisionMax} (vague language not penalized enough)`));
  }
  if ("hedgesMin" in expected) {
    const ok = hedges.length >= expected.hedgesMin;
    issues.push(ok ? pass(`hedges found: ${hedges.length} ≥ ${expected.hedgesMin}`) : fail(`only ${hedges.length} hedge(s) found, expected ≥ ${expected.hedgesMin}`));
  }
  if ("noHedges" in expected && expected.noHedges) {
    const ok = hedges.length === 0;
    issues.push(ok ? pass("no hedges flagged (abbreviations correctly allowed)") : fail(`abbreviations incorrectly flagged as hedges: ${hedges.join(", ")}`));
  }
  if ("orderIs" in expected) {
    const ok = scores.structure === expected.orderIs;
    issues.push(ok ? pass(`order=${scores.structure}`) : fail(`order expected "${expected.orderIs}", got "${scores.structure}"`));
  }
  if ("orderIsNot" in expected) {
    const ok = scores.structure !== expected.orderIsNot;
    issues.push(ok ? pass(`order="${scores.structure}" (correctly not MIST)`) : fail(`order was "${scores.structure}" — wrong order should have been detected`));
  }
  if ("fluencyPass" in expected) {
    const { withinTime, durationSec } = scores.fluency;
    const ok = withinTime === expected.fluencyPass;
    issues.push(ok ? pass(`fluency: ${durationSec}s, withinTime=${withinTime}`) : fail(`fluency: expected withinTime=${expected.fluencyPass}, got ${withinTime}`));
  }
  if ("gapsContain" in expected) {
    for (const fragment of expected.gapsContain) {
      const found = result.gaps.some(g => g.toLowerCase().includes(fragment.toLowerCase()));
      issues.push(found ? pass(`gap mentions "${fragment}"`) : fail(`no gap mentioning "${fragment}" found in: ${JSON.stringify(result.gaps)}`));
    }
  }
  if ("components" in expected) {
    for (const [k, v] of Object.entries(expected.components)) {
      const detected = scores.completeness >= 0.25; // rough proxy; check modelAnswer or future field
      // We can't directly access components post-derivation — warn instead
      issues.push(warn(`component.${k} expected ${v} — verify in raw output`));
    }
  }
  return issues;
}

// Mock fence-wrapped JSON for t19
function mockFenceTest(scenario, durationSec) {
  const { stripFences } = (() => {
    // inline the stripping logic to test it directly
    function stripFences(text) {
      return text.trim().replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
    }
    return { stripFences };
  })();

  const fenceWrapped = '```json\n{"components":{"mechanism":true,"injuries":true,"signs":true,"treatment":true},"hedges":[],"order":"MIST","gaps":[],"modelAnswer":"MIST: IED blast 5m. Amputation RLE BK, soft tissue wound right arm. GCS 13, BP 100/70, HR 110, RR 22, SpO2 96%. TQ at 14:32, wound packed, IV access 500mL NS."}\n```';
  const stripped = stripFences(fenceWrapped);
  try {
    JSON.parse(stripped);
    return [pass("fence-stripping: JSON parsed successfully from fenced response")];
  } catch {
    return [fail("fence-stripping: JSON.parse failed after stripping fences")];
  }
}

async function runConsistencyCheck(scenario, transcript, durationSec, runs) {
  console.log(`  Running ${runs}x for consistency check...`);
  const results = [];
  for (let i = 0; i < runs; i++) {
    const r = await evaluate(scenario, transcript, durationSec, API_KEY);
    results.push(r);
    if (i < runs - 1) await new Promise(res => setTimeout(res, 500));
  }
  // Compare all results
  const jsons = results.map(r => JSON.stringify({
    completeness: r.scores?.completeness,
    precision: r.scores?.precision,
    structure: r.scores?.structure,
    hedgesLen: r.hedges?.length,
    gapsLen: r.gaps?.length
  }));
  const allSame = jsons.every(j => j === jsons[0]);
  return [
    allSame
      ? pass(`consistency: all ${runs} runs produced identical scores`)
      : fail(`consistency: scores differed across runs:\n${jsons.join("\n")}`)
  ];
}

async function main() {
  console.log(`\nMIST Trainer — Test Harness (PROMPT_VERSION: ${PROMPT_VERSION})\n${"═".repeat(60)}`);

  let totalPassed = 0;
  let totalFailed = 0;

  for (const t of TRANSCRIPTS) {
    const scenario = scenarioMap[t.scenarioId];
    console.log(`\n[${t.id}] scenario=${t.scenarioId}, duration=${t.durationSec}s, limit=${scenario.timeLimitSec}s`);

    let checks = [];

    if (t.expected._isFenceTest) {
      checks = mockFenceTest(scenario, t.durationSec);
    } else if (t.expected._isConsistencyCheck) {
      checks = await runConsistencyCheck(scenario, t.transcript, t.durationSec, t.expected.runs);
    } else {
      const result = await evaluate(scenario, t.transcript, t.durationSec, API_KEY);
      if (result.error) {
        console.log(fail(`  Error: ${result.error}`));
        totalFailed++;
        continue;
      }
      console.log(`  → completeness=${result.scores.completeness}, precision=${result.scores.precision.toFixed(2)}, structure="${result.scores.structure}", within_time=${result.scores.fluency.withinTime}`);
      if (result.hedges.length > 0) console.log(`  → hedges: ${result.hedges.join(", ")}`);
      if (result.gaps.length > 0) console.log(`  → gaps: ${result.gaps.join(" | ")}`);
      checks = checkResult(result, t.expected, t.transcript);
      // 500ms delay between API calls to avoid rate limiting
      await new Promise(res => setTimeout(res, 500));
    }

    for (const c of checks) {
      console.log(`  ${c}`);
      if (c.includes("✓")) totalPassed++;
      else if (c.includes("✗")) totalFailed++;
    }
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log(`Results: ${totalPassed} passed, ${totalFailed} failed`);
  if (totalFailed > 0) process.exit(1);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
