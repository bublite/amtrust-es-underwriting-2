export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { prompt, max_tokens = 800 } = req.body;

  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: Math.min(max_tokens, 2000),
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await r.json();
  const text = data.content?.[0]?.text ?? "";
  return res.status(200).json({ text });
}
