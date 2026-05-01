// MIST Trainer — Evaluator
// Claude returns facts (booleans + lists); JS computes derived scores.
// Compatible with Node.js (18+) and browser.

const PROMPT_VERSION = "v1.0";
const MODEL = "claude-haiku-4-5-20251001";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// Claude returns this; JS derives EvaluationResult from it.
// interface ClaudeOutput {
//   components: { mechanism: bool, injuries: bool, signs: bool, treatment: bool }
//   hedges: string[]       — vague language instances found
//   order: StructureEnum   — detected MIST component order
//   gaps: string[]         — specific missing/incorrect items
//   modelAnswer: string    — complete correct MIST for this scenario
// }

const SYSTEM_PROMPT = `You are a MIST handoff evaluator for trauma medicine and military casualty care (TCCC).

MIST = Mechanism of injury | Injuries sustained | Signs & symptoms | Treatment given

You will receive:
1. A scenario object describing a patient
2. A spoken transcript of the practitioner's MIST report

Return ONLY a JSON object with NO prose, NO markdown fences. Schema:

{
  "components": {
    "mechanism": boolean,   // true if mechanism of injury was mentioned
    "injuries": boolean,    // true if injuries were mentioned
    "signs": boolean,       // true if signs/symptoms/vitals were mentioned
    "treatment": boolean    // true if treatment given was mentioned
  },
  "hedges": string[],       // list of specific vague phrases found — e.g. ["seems stable", "BP is low", "GCS around 13"]
  "order": string,          // detected MIST component order — use "MIST" | "MITS" | "MSIT" | "MTSI" | "IMST" | "ISMS" | "SMIT" | "TMIS" | "TIMS" | "out-of-order" | "incomplete"
  "gaps": string[],         // specific actionable gaps — e.g. ["tourniquet time not stated", "GCS given as range"]
  "modelAnswer": string     // complete correct MIST report for this specific patient, using scenario data
}

PRECISION RULES (populate hedges[]):
- Vague quantifiers count: "seems", "maybe", "approximately", "like", "kind of", "about", "around"
- Missing specifics count: said "BP is low" when scenario has exact value → add "said 'BP is low' instead of [actual value]"
- Rounding that loses clinical significance counts: "GCS around 13" when exact value available

ABBREVIATION ALLOWLIST (these are precise, do NOT flag as hedges):
- TQ = tourniquet  |  GCS = Glasgow Coma Scale  |  BP = blood pressure
- HR / PR = heart/pulse rate  |  RR = respiratory rate  |  SpO2 / O2sat = pulse ox
- "TQ at 14:32" is precise  |  "BP 90/60" is precise  |  "GCS 13" is precise

ORDER DETECTION — identify the first sentence where each MIST component appears, then report the order.
If fewer than 4 components appear, return "incomplete".
Over-flag incorrect order rather than pass it — false negatives are higher risk.

MODEL ANSWER — use the specific vitals, numbers, and times from the scenario, not generic advice.`;

function buildUserContent(scenario, transcript) {
  return `SCENARIO:
${JSON.stringify(scenario, null, 2)}

TRANSCRIPT:
"${transcript}"`;
}

function stripFences(text) {
  return text.trim().replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
}

function validateClaudeOutput(obj) {
  const required = ["components", "hedges", "order", "gaps", "modelAnswer"];
  for (const key of required) {
    if (!(key in obj)) throw new Error(`Missing field: ${key}`);
  }
  const compFields = ["mechanism", "injuries", "signs", "treatment"];
  for (const f of compFields) {
    if (typeof obj.components[f] !== "boolean") throw new Error(`components.${f} must be boolean`);
  }
  if (!Array.isArray(obj.hedges)) throw new Error("hedges must be array");
  if (!Array.isArray(obj.gaps)) throw new Error("gaps must be array");
  if (typeof obj.order !== "string") throw new Error("order must be string");
  if (typeof obj.modelAnswer !== "string") throw new Error("modelAnswer must be string");
}

function deriveScores(claudeOutput, durationSec, scenario) {
  const { components, hedges, order, gaps, modelAnswer } = claudeOutput;
  const completeness = Object.values(components).filter(Boolean).length * 0.25;
  const precision = Math.max(0, 1.0 - 0.2 * hedges.length);
  const fluency = { withinTime: durationSec <= scenario.timeLimitSec, durationSec };
  return {
    scores: { completeness, precision, fluency, structure: order },
    hedges,
    gaps,
    modelAnswer,
    _meta: { promptVersion: PROMPT_VERSION, model: MODEL }
  };
}

async function callClaude(apiKey, scenario, transcript) {
  const body = {
    model: MODEL,
    max_tokens: 1024,
    temperature: 0,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserContent(scenario, transcript) }]
  };

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-allow-browser": "true"
    },
    body: JSON.stringify(body)
  });

  if (res.status === 401) throw { code: "invalid_key", message: "Invalid API key — check Settings" };
  if (res.status === 429) throw { code: "rate_limit", message: "Rate limited" };
  if (!res.ok) throw { code: "api_error", message: `API error ${res.status}` };

  const data = await res.json();
  return data.content[0].text;
}

function parseClaudeResponse(raw) {
  const stripped = stripFences(raw);
  const parsed = JSON.parse(stripped);
  validateClaudeOutput(parsed);
  return parsed;
}

// Main export
// durationSec: measured in speech.js from first onresult(final) to recording stop
async function evaluate(scenario, transcript, durationSec, apiKey) {
  let raw;

  // First attempt
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      raw = await callClaude(apiKey, scenario, transcript);
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    if (err.code === "rate_limit") {
      await new Promise(r => setTimeout(r, 2000));
      raw = await callClaude(apiKey, scenario, transcript);
    } else if (err.name === "AbortError") {
      return { error: "timeout" };
    } else {
      throw err;
    }
  }

  // Parse with one retry on failure
  let claudeOutput;
  try {
    claudeOutput = parseClaudeResponse(raw);
  } catch (_) {
    // Retry the API call once on parse failure
    try {
      raw = await callClaude(apiKey, scenario, transcript);
      claudeOutput = parseClaudeResponse(raw);
    } catch (err2) {
      return { error: "evaluation_failed", raw };
    }
  }

  return deriveScores(claudeOutput, durationSec, scenario);
}

// Node.js / browser compatibility
if (typeof module !== "undefined") {
  module.exports = { evaluate, PROMPT_VERSION, MODEL };
}
