// Vercel serverless function — verifies access code, returns API keys
// Env vars required: MIST_ACCESS_CODE, MIST_ANTHROPIC_KEY, MIST_GROQ_KEY

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const { code } = req.body || {};
  const validCode = process.env.MIST_ACCESS_CODE;
  const anthropicKey = process.env.MIST_ANTHROPIC_KEY;
  const groqKey = process.env.MIST_GROQ_KEY;

  if (!validCode || !anthropicKey || !groqKey) {
    return res.status(503).json({ error: "server_not_configured" });
  }

  if (!code || code.trim() !== validCode.trim()) {
    return res.status(401).json({ error: "invalid_code" });
  }

  return res.status(200).json({ anthropicKey, groqKey });
}
