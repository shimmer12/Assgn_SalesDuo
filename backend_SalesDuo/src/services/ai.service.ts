import OpenAI from "openai";

export type OptimizedResult = {
  title: string;
  bullets: string[];
  description: string;
  keywords: string[];
};

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function safeParseJson(text: string): any | null {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

/** Build system + user instruction and return raw prompt for logging. */
function buildPrompt(input: { title?: string; bullets?: string[]; description?: string }) {
  const system = `You are an ecommerce copy expert who improves Amazon product listings.
Return JSON only using this exact schema:
{
  "title": "optimized title (string, <=200 chars)",
  "bullets": ["bullet1","bullet2",...],    // 3-5 bullets
  "description": "optimized description (string)",
  "keywords": ["kw1","kw2", ...]            // 3-8 keywords
}
Do NOT include any explanation or extraneous text. If a field cannot be produced, return an empty string or empty array. Avoid unsubstantiated claims.`;

  const parts: string[] = [];
  if (input.title) parts.push(`Original title:\n${input.title}`);
  if (input.bullets && input.bullets.length) parts.push(`Original bullets:\n- ${input.bullets.join("\n- ")}`);
  if (input.description) parts.push(`Original description:\n${input.description}`);

  const user = `Optimize this product listing for Amazon and return JSON only as specified.\n\n${parts.join("\n\n")}`;

  return { system, user };
}

function extractTextFromResponse(resp: any): string {
  try {
    const out = resp?.output ?? resp?.outputs ?? null;
    if (Array.isArray(out) && out.length > 0) {
      const content = out[0]?.content ?? out[0]?.output?.content ?? out[0]?.message?.content;
      if (Array.isArray(content)) {
        const texts = content
          .map((c: any) => {
            if (typeof c === "string") return c;
            if (typeof c?.text === "string") return c.text;
            if (typeof c?.value === "string") return c.value;
            if (Array.isArray(c?.parts)) return c.parts.join("");
            return "";
          })
          .filter(Boolean);
        if (texts.length) return texts.join("\n\n");
      }
      if (typeof out[0]?.text === "string") return out[0].text;
      if (typeof out[0]?.content?.[0]?.text === "string") return out[0].content[0].text;
    }

    if (typeof resp?.output_text === "string") return resp.output_text;
    if (typeof resp?.generated_text === "string") return resp.generated_text;
  } catch (e) {
    console.error("Failed to extract text from response:", e);
  }


  try {
    return JSON.stringify(resp);
  } catch {
    return String(resp ?? "");
  }
}

export async function optimizeProduct(input: {
  title?: string | null;
  bullets?: string[] | null;
  description?: string | null;
}): Promise<OptimizedResult | null> {
  const { system, user } = buildPrompt({
    title: input.title ?? undefined,
    bullets: input.bullets ?? undefined,
    description: input.description ?? undefined,
  });

  const combinedInput = `${system}\n\n${user}`;

  try {
    const resp = await client.responses.create({
      model: "gpt-4o-mini",
      input: combinedInput,
    });

    const raw = extractTextFromResponse(resp);
    let parsed = safeParseJson(raw);

    if (!parsed) {
      // retry: ask for JSON-only explicitly
      const retryResp = await client.responses.create({
        model: "gpt-4o-mini",
        input: `You must only reply with valid JSON following this schema. ${user}`,
      });
      const retryRaw = extractTextFromResponse(retryResp);
      parsed = safeParseJson(retryRaw);
    }

    if (!parsed) {
      throw new Error("Failed to get an AI response");
    }

    const title = typeof parsed.title === "string" ? parsed.title.trim() : (input.title ?? "");
    const bullets = Array.isArray(parsed.bullets) ? parsed.bullets.map((b: any) => String(b).trim()) : [];
    const description = typeof parsed.description === "string" ? parsed.description.trim() : "";
    const keywords = Array.isArray(parsed.keywords) ? parsed.keywords.map((k: any) => String(k).trim()) : [];

    return {
      title,
      bullets,
      description,
      keywords,
    };
  } catch (err) {
    console.error("Responses API error:", err);
    return null;
  }
}
