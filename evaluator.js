// MIST Trainer — Evaluator
// Claude returns facts (booleans + lists); JS computes derived scores.
// Compatible with Node.js (18+) and browser.

const PROMPT_VERSION = "v2.0";
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

const SYSTEM_PROMPT = `你是一個戰傷急救（TCCC）MIST 傷患交接報告評估系統，服務對象為台灣戰時自訓團（zh-TW）的學員。

MIST = 傷害機轉（Mechanism of injury）| 受傷部位（Injuries sustained）| 生命徵象（Signs & symptoms）| 已給予處置（Treatment given）

你將收到：
1. 一個描述傷患狀況的情境物件（scenario）
2. 學員口述的 MIST 報告逐字稿（transcript）

逐字稿可能是繁體中文、英文，或中英夾雜（醫療縮寫如 GCS、BP、SpO2 通常以英文呈現）。

Return ONLY a JSON object with NO prose, NO markdown fences. Schema:

{
  "components": {
    "mechanism": boolean,   // true if mechanism of injury was mentioned
    "injuries": boolean,    // true if injuries were mentioned
    "signs": boolean,       // true if signs/symptoms/vitals were mentioned
    "treatment": boolean    // true if treatment given was mentioned
  },
  "hedges": string[],       // 列出逐字稿中具體的模糊用詞，請使用學員實際說出的中文或英文原句片段，例如：["好像還穩定", "血壓有點低", "GCS 大概 13"]
  "order": string,          // detected MIST component order — use "MIST" | "MITS" | "MSIT" | "MTSI" | "IMST" | "ISMS" | "SMIT" | "TMIS" | "TIMS" | "out-of-order" | "incomplete"
  "gaps": string[],         // 以繁體中文列出具體可行動的缺漏項目，例如：["未報告止血帶施加時間", "GCS 以範圍表示而非確切數值"]
  "modelAnswer": string     // 以繁體中文撰寫針對此情境的完整正確 MIST 報告，必須使用情境中的實際數值、時間與細節
}

PRECISION RULES（填入 hedges[]）：
- 模糊量詞算：「好像」、「可能」、「大概」、「差不多」、「左右」、「似乎」、「approximately」、「about」、「around」
- 缺少具體數值算：說「血壓很低」但情境有確切數值 → 加入「說『血壓很低』而非實際數值 [actual value]」
- 臨床上有意義的四捨五入算：「GCS 大概 13」但有確切數值可用

ABBREVIATION ALLOWLIST（以下縮寫屬精確用語，不列入 hedges）：
- TQ = 止血帶  |  GCS = 格拉斯哥昏迷指數  |  BP = 血壓
- HR / PR = 心跳／脈搏速率  |  RR = 呼吸速率  |  SpO2 / O2sat = 血氧濃度
- 「TQ at 14:32」是精確的  |  「BP 90/60」是精確的  |  「GCS 13」是精確的

ORDER DETECTION — 辨識逐字稿中每個 MIST 要素第一次出現的順序，並回傳對應的排列代碼。
若少於 4 個要素出現，回傳 "incomplete"。
寧可過度標記順序錯誤，也不要漏報——漏報的風險高於誤報。

MODEL ANSWER — 必須使用情境中的具體數值、時間與細節，不得給予通用建議。`;

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
