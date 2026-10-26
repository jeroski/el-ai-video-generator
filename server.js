import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "40kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    app: "EL AI Video Generator",
    textAIConfigured: Boolean(process.env.HF_TOKEN)
  });
});

app.post("/api/story-plan", async (req, res) => {
  try {
    const { idea, style = "3D cartoon", minutes = 5, voice = "Warm storyteller" } = req.body ?? {};
    if (typeof idea !== "string" || idea.trim().length < 5) {
      return res.status(400).json({ error: "Please enter a video idea with at least 5 characters." });
    }
    if (idea.length > 3000) return res.status(400).json({ error: "Keep the idea under 3,000 characters." });

    const duration = Number(minutes);
    if (![2, 5, 10, 15, 20].includes(duration)) {
      return res.status(400).json({ error: "Choose a supported target length." });
    }

    const token = process.env.HF_TOKEN;
    if (!token) {
      return res.status(503).json({
        error: "Text AI is not connected yet. Add HF_TOKEN in your hosting provider's server environment settings, then redeploy."
      });
    }

    const prompt = `You are EL, a careful assistant that prepares production plans for YouTube videos.
Create a production-ready scene plan from the user's idea.
Style: ${style}
Target duration: ${duration} minutes
Narration style: ${voice}
Return plain text with:
1. An engaging title
2. A short original story/script suitable for the target duration
3. A scene-by-scene breakdown with approximate timestamps
4. Narration for each scene
5. A separate visual-generation prompt for each scene
6. Sound/music suggestions
Keep character descriptions consistent across scenes. Avoid copyrighted characters and do not claim this is a rendered video.
User idea: ${idea.trim()}`;

    // Hugging Face routed chat-completions endpoint. Token stays on the server.
    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.HF_MODEL || "Qwen/Qwen2.5-7B-Instruct",
        messages: [
          { role: "system", content: "You create original, practical video production plans." },
          { role: "user", content: prompt }
        ],
        max_tokens: 3500,
        temperature: 0.7
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("HF request failed:", response.status, JSON.stringify(data).slice(0, 1000));
      return res.status(502).json({
        error: response.status === 401 || response.status === 403
          ? "The AI provider rejected the token or its permissions. Check HF_TOKEN and its Inference Providers permission."
          : response.status === 429
          ? "The AI provider is busy or your free allowance is used up. Try later or check your provider account."
          : "The AI provider returned an error. Check the server logs and provider model availability."
      });
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) return res.status(502).json({ error: "The AI provider returned no text. Try another supported model." });
    res.json({ ok: true, plan: content, model: process.env.HF_MODEL || "Qwen/Qwen2.5-7B-Instruct" });
  } catch (error) {
    console.error("EL API error:", error?.message || error);
    res.status(500).json({ error: "EL could not reach the AI service. Please try again." });
  }
});

app.listen(port, () => console.log(`EL server listening on port ${port}`));
