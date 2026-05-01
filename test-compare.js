#!/usr/bin/env node
// MIST Trainer — Model Comparison: Claude Haiku vs Groq Llama 3.3 70B
// Usage: ANTHROPIC_API_KEY=sk-ant-... GROQ_API_KEY=gsk_... node test-compare.js
//
// Runs 4 zh-TW test cases through both models, prints side-by-side results.

const { SCENARIOS } = require("./scenarios.js");

// ── Load .env ────────────────────────────────────────────────────────────────
const fs = require("fs"), path = require("path");
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m) process.env[m[1]] = m[2].trim();
  }
}

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const GROQ_KEY      = process.env.GROQ_API_KEY;

if (!ANTHROPIC_KEY) { console.error("Missing ANTHROPIC_API_KEY in .env"); process.exit(1); }
if (!GROQ_KEY)      { console.error("Missing GROQ_API_KEY in .env"); process.exit(1); }

// ── Shared prompt (same as evaluator.js) ────────────────────────────────────
const SYSTEM_PROMPT = `你是一個戰傷急救（TCCC）MIST 傷患交接報告評估系統，服務對象為台灣戰時自訓團（zh-TW）的學員。

MIST = 傷害機轉（Mechanism of injury）| 受傷部位（Injuries sustained）| 生命徵象（Signs & symptoms）| 已給予處置（Treatment given）

你將收到：
1. 一個描述傷患狀況的情境物件（scenario）— 僅供產生標準答案和判斷缺漏，不算作學員已報告的內容
2. 學員口述的 MIST 報告逐字稿（transcript）— 這才是你評分的唯一依據

⚠️ 嚴格規則：components 的 true/false 判斷完全依據 transcript 的文字內容，絕不能因為 scenario 中有某項資訊就判為 true。如果 transcript 是空白、無意義字詞（例如「測試」「test」「嗯」），所有 components 必須全部為 false。

Return ONLY a JSON object with NO prose, NO markdown fences. Schema:
{
  "components": { "mechanism": boolean, "injuries": boolean, "signs": boolean, "treatment": boolean },
  "hedges": string[],
  "order": string,
  "gaps": string[],
  "modelAnswer": string
}

PRECISION RULES（填入 hedges[]）：
- 模糊量詞算：「好像」「可能」「大概」「差不多」「左右」「似乎」
- 缺少具體數值算：說「血壓很低」但情境有確切數值 → 加入
- 臨床上有意義的四捨五入算

ABBREVIATION ALLOWLIST（不列入 hedges）：TQ、GCS、BP、HR、RR、SpO2

ORDER DETECTION：辨識每個 MIST 要素第一次出現的順序，少於 4 個要素回傳 "incomplete"。

MODEL ANSWER：必須使用情境中的具體數值與細節。`;

function buildContent(scenario, transcript) {
  return `SCENARIO:\n${JSON.stringify(scenario, null, 2)}\n\nTRANSCRIPT:\n"${transcript}"`;
}

function stripFences(text) {
  return text.trim().replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
}

// ── Claude Haiku call ────────────────────────────────────────────────────────
async function callClaude(scenario, transcript) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildContent(scenario, transcript) }]
    })
  });
  if (!res.ok) throw new Error(`Claude ${res.status}: ${await res.text()}`);
  const d = await res.json();
  return JSON.parse(stripFences(d.content[0].text));
}

// ── Groq Llama 3.3 70B call ──────────────────────────────────────────────────
async function callGroq(scenario, transcript) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: buildContent(scenario, transcript) }
      ]
    })
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  const d = await res.json();
  return JSON.parse(stripFences(d.choices[0].message.content));
}

// ── Test cases ───────────────────────────────────────────────────────────────
const scenarioMap = Object.fromEntries(SCENARIOS.map(s => [s.id, s]));

const TESTS = [
  {
    label: "完整正確的 MIST（IED 情境）",
    scenarioId: "s01",
    transcript: "傷患為 22 歲男性，台北信義區遭 IED 爆炸受傷。傷害機轉：地雷爆炸，距離約 2 公尺。受傷部位：左大腿近端股動脈撕裂傷，大量噴射性出血；左小腿骨折伴皮膚撕脫；右前臂多發彈片傷。生命徵象：GCS 12，BP 74/40 mmHg，HR 138，RR 28，SpO2 94%，皮膚蒼白濕冷。已給予處置：已於左腹股溝近端施打止血帶，傷口使用 Combat Gauze 填塞加壓，建立靜脈通路輸注生理食鹽水，給予氧氣面罩給氧，已通報後送。"
  },
  {
    label: "模糊用語（應扣分）",
    scenarioId: "s01",
    transcript: "傷患好像是被爆炸炸傷的，大概在左腿附近有傷，血壓似乎有點低，心跳好像很快，我們有幫他大概處理一下止血。"
  },
  {
    label: "缺少處置（治療項目未提）",
    scenarioId: "s01",
    transcript: "傷害機轉是 IED 爆炸距離 2 公尺。受傷部位：左大腿股動脈撕裂出血、左小腿骨折、右前臂彈片傷。生命徵象：GCS 12，BP 74/40，HR 138，RR 28，SpO2 94%。"
  },
  {
    label: "無意義輸入（應全部 false）",
    scenarioId: "s01",
    transcript: "測試測試測試"
  }
];

// ── Compare ──────────────────────────────────────────────────────────────────
function summarize(result) {
  const c = result.components;
  const comp = `完整度 ${((c.mechanism+c.injuries+c.signs+c.treatment)/4*100).toFixed(0)}%`;
  const prec = `精確度 ${result.hedges.length === 0 ? "100" : Math.max(0,100-result.hedges.length*20)}%`;
  const flags = Object.entries(c).filter(([,v])=>v).map(([k])=>k).join(",") || "none";
  return `${comp} | ${prec} | order:${result.order} | hedges:${result.hedges.length} | gaps:${result.gaps.length}\n     components:[${flags}]` + (result.hedges.length ? `\n     hedges: ${result.hedges.slice(0,2).join(" / ")}` : "");
}

async function main() {
  console.log("\n🔬 MIST 模型比較測試: Claude Haiku 4.5 vs Groq Llama 3.3 70B");
  console.log("═".repeat(70));

  let claudeWins = 0, groqWins = 0, ties = 0;

  for (const t of TESTS) {
    const scenario = scenarioMap[t.scenarioId];
    console.log(`\n📋 ${t.label}`);
    console.log(`   逐字稿: "${t.transcript.substring(0, 60)}..."`);
    console.log("─".repeat(70));

    const [claudeResult, groqResult] = await Promise.all([
      callClaude(scenario, t.transcript).catch(e => ({ error: e.message })),
      callGroq(scenario, t.transcript).catch(e => ({ error: e.message }))
    ]);

    if (claudeResult.error) {
      console.log(`  🔵 Claude  → ERROR: ${claudeResult.error}`);
    } else {
      console.log(`  🔵 Claude  → ${summarize(claudeResult)}`);
    }

    if (groqResult.error) {
      console.log(`  🟡 Llama   → ERROR: ${groqResult.error}`);
    } else {
      console.log(`  🟡 Llama   → ${summarize(groqResult)}`);
    }

    // Judge agreement
    if (!claudeResult.error && !groqResult.error) {
      const cc = claudeResult.components, gc = groqResult.components;
      const compMatch = ["mechanism","injuries","signs","treatment"].every(k => cc[k] === gc[k]);
      const orderMatch = claudeResult.order === groqResult.order;
      const hedgeDiff = Math.abs(claudeResult.hedges.length - groqResult.hedges.length);
      if (compMatch && orderMatch && hedgeDiff <= 1) {
        console.log(`  ✅ 結果一致`); ties++;
      } else {
        const diffs = [];
        if (!compMatch) diffs.push("components 不一致");
        if (!orderMatch) diffs.push(`order: Claude=${claudeResult.order} Llama=${groqResult.order}`);
        if (hedgeDiff > 1) diffs.push(`hedges 差異 ${hedgeDiff} 個`);
        console.log(`  ⚠️  差異: ${diffs.join(" | ")}`);
      }
    }

    // Rate limit buffer
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log("\n" + "═".repeat(70));
  console.log(`✅ 一致: ${ties}/${TESTS.length}  ⚠️ 差異: ${TESTS.length - ties}/${TESTS.length}`);
  console.log("\n💡 判斷標準: components、order、hedges 差 ≤1 視為一致");
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
