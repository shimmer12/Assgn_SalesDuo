// src/services/scrape.service.ts
import axios from "axios";
import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";

export type ScrapedProduct = {
    asin: string;
    title?: string | null;
    bullets?: string[];
    description?: string | null;
    source_url?: string | null;
};

function norm(text?: string | null) {
    if (!text) return undefined;
    return text.replace(/\s+/g, " ").trim();
}

function parseAplusDescription($: CheerioAPI) {
    const selectors = [
        ".aplus-v2 .description",
        ".aplus-module .aplus-card-description",
        ".aplus .description",
        "#aplus .aplus-content",
        "#aplus",
    ];
    for (const sel of selectors) {
        const el = $(sel).first();
        if (el.length) {
            const text = norm(el.text());
            if (text) return text;
        }
    }
    return undefined;
}

function parseProductOverview($: CheerioAPI) {
    const overview = $("#productOverview_feature_div, #prodDetails, #productDetails_feature_div, #detailBullets_feature_div");
    if (overview.length) {
        const txt = norm(overview.text());
        if (txt) return txt;
    }
    return undefined;
}

function cleanText(str?: string | null): string | null {
  if (!str) return null;
  const raw = String(str).replace(/\r/g, "").trim();
  if (!raw) return null;

  const text = raw.replace(/\s+/g, " ").trim();
  if (!text) return null;

  const lower = text.toLowerCase();

  if (
    /p\.when\(|a\.on\(|window\.ue\b|window\.csa\b|csa\(|execute\(function|\bfunction\s*\(|var\s+\w+\s*=|<\/?script\b/i.test(
      lower
    )
  ) {
    return null;
  }

  if (
    lower.includes("page not found") ||
    lower.includes("the web address you entered is not a functioning page") ||
    lower.includes("looking for something")
  ) {
    return null;
  }

  const specKeywords = [
    "asin",
    "manufacturer",
    "item model",
    "model number",
    "product dimensions",
    "item dimensions",
    "included components",
    "country of origin",
    "item weight",
    "net quantity",
    "part number",
    "material",
    "fabric",
    "care instructions",
    "size",
    "colour",
    "color",
    "wash",
    "battery",
    "ram",
    "storage",
    "processor",
    "voltage",
    "watt",
    "capacity",
    "power",
    "waterproof",
    "warranty",
    "ean",
    "upc",
    "sku",
    "brand",
    "importer",
    "packer",
  ];
  const specRegex = new RegExp(`\\b(${specKeywords.join("|")})\\b`, "i");

  let specMatchCount = 0;
  for (const kw of specKeywords) {
    if (lower.includes(kw)) specMatchCount++;
  }

  const colonCount = (text.match(/:/g) || []).length;

  const labelValueLines = text.split(/\n|\.{2,}|;|—|–/).filter(Boolean).filter((line) => {
    const c = line.indexOf(":");
    if (c > 0 && c < 40) {
      return /\w/.test(line.slice(0, c)) && /\w/.test(line.slice(c + 1));
    }
    return false;
  }).length;

  if (colonCount >= 3 || specMatchCount >= 3 || labelValueLines >= 3) {
    const isShort = text.length < 200 && colonCount <= 1 && specMatchCount <= 1;
    if (!isShort) return null;
  }

  const half = Math.floor(text.length / 2);
  if (half > 50) {
    const first = text.slice(0, half).trim();
    const second = text.slice(half).trim();
    const common = first.split(" ").filter((w) => second.includes(w)).length;
    if (common / Math.max(1, first.split(" ").length) > 0.5) {
      return null;
    }
  }

  if (/<\/?script\b|<\/?div\b|<\/?table\b|<meta\b|<\/?style\b|<img\b/i.test(text)) {
    return null;
  }

  if (text.length < 20) return null;

  const sentenceLike = /[a-z][\.\?!]\s+[A-Z0-9]/.test(raw) || raw.includes(". ");
  const numericRatio =
    (text.match(/\d+/g) || []).join("").length / Math.max(1, text.replace(/\s+/g, "").length);
  if (!sentenceLike && numericRatio > 0.2 && text.length > 120) {
    return null;
  }

  const normalized = text.replace(/\s+/g, " ").trim();

  const finalSpecHits = specKeywords.reduce((acc, k) => acc + (normalized.toLowerCase().includes(k) ? 1 : 0), 0);
  if (finalSpecHits >= 5 && normalized.length > 100) return null;

  return normalized || null;
}


function cleanBullets(raw?: string | null, opts?: { maxBullets?: number }): string[] {
  if (!raw) return [];
  const maxBullets = opts?.maxBullets ?? 8;

  let text = String(raw).replace(/\r/g, " ").replace(/<\/?br\s*\/?>/gi, "\n");

  text = text.replace(/<img[^>]*>/gi, " ");

  text = text.replace(/<\/li>/gi, "\n").replace(/<li[^>]*>/gi, "\n");

  text = text.replace(/[ \t]+/g, " ");

  const rawParts = text
    .split(/\n|•|\u2022|·|;|—|–|•|<\/li>|<li>|<\/p>|<p>|<div class="a-section">|<\/div>| - /i)
    .map((s) => s.trim())
    .filter(Boolean);

  const junkPatterns: RegExp[] = [
    /\b(page not found|looking for something|to view this video|download flash player)\b/i,
    /\b(customer reviews|out of 5 stars|ratings|verified purchase|helpful report)\b/i,
    /\b(best sellers rank|best sellers|see top 100|rank in)\b/i,
    /\b(asin|item model|manufacturer|importer|packer|country of origin|item weight|item dimensions|net quantity)\b/i,
    /<script\b|<\/script>|window\.ue\b|P\.when\(|dpAcrHasRegisteredArcLinkClickAction|ue\.count\(/i,
    /\b(Size|Colour|Color|Fabric|Material|Sleeve|Pattern|Department)\b[:\s]/i,
    /https?:\/\/\S+/i,
    /img src=|amazon-avatars|m\.media-amazon/i,
    /\b(reviews?|reviewed in)\b/i,
    /^\s*[\d.,%\-#]+\s*$/i,
    /^[\W_]+$/,
  ];

  const allowedSpecIfShort = /\b(Sleeve|Pattern|Fabric|Fabric Type|Colour|Color|Size|Material|Fit|Style)\b/i;

  const cleaned: string[] = [];

  for (let part of rawParts) {
    part = part.replace(/&nbsp;|&amp;|&quot;|&#39;/gi, " ").replace(/\s+/g, " ").trim();
    if (!part) continue;

    const lower = part.toLowerCase();

    if (/\bout of 5 stars\b|\bverified purchase\b|\brated\b/i.test(lower)) continue;

    if (/(function\(|window\.ue\b|P\.when\(|dpAcrHasRegisteredArcLinkClickAction|ue\.count\()/i.test(part)) continue;

    if (/amazon-avatars|m\.media-amazon|img src=/i.test(part)) continue;

    const colonCount = (part.match(/:/g) || []).length;
    if (colonCount >= 2) {
      if (colonCount > 1) continue;
      if (part.length > 200) continue;
    }

    let isJunk = junkPatterns.some((re) => re.test(part));
    if (isJunk) {
      if (allowedSpecIfShort.test(part) && part.length < 120) {
        isJunk = false;
      } else {
        continue;
      }
    }

    if (/^\s*(xs|s|m|l|xl|xxl|2xl|3xl|4xl|size|sizes)\b|(\bxs\b|\bs\b|\bm\b|\bl\b|\bxl\b|\bxxl\b)/i.test(part) && /^[A-Za-z0-9\s\-,]+$/.test(part) && part.split(/\s+/).length <= 10) {

      const words = part.split(/\s+/);
      const sizesOnly = words.every(w => /^[A-Za-z0-9]+$/.test(w) && w.length <= 4);
      if (sizesOnly) continue;
    }

    if (/^\s*(best sellers rank|customer reviews|customer rating|ratings|best sellers)\b/i.test(part)) continue;

    let candidate = part.replace(/\s+/g, " ").trim();

    if (candidate.length < 8 && !/[A-Za-z]/.test(candidate)) continue;

    if (/\b(reviewed in|read more|helpful report|verified purchase)\b/i.test(candidate)) continue;

    if (candidate.length > 300) {
      const partsSplit = candidate.split(/[.؛;]\s+/).map(s => s.trim()).filter(Boolean);
      for (const s of partsSplit) {
        if (s.length >= 20 && /[A-Za-z]/.test(s)) {
          cleaned.push(s.replace(/\s+/g, " ").trim());
          if (cleaned.length >= maxBullets) break;
        }
      }
      if (cleaned.length >= maxBullets) break;
      continue;
    }

    if (!/[A-Za-z]/.test(candidate)) continue;
    if (candidate.split(/\s+/).length < 2) continue;

    candidate = candidate.replace(/[ \t]+/g, " ").replace(/^[\-\u2022]+/, "").trim();
    candidate = candidate.replace(/[\s\-\|]+$/g, "").trim();

    const lc = candidate.toLowerCase();
    if (!cleaned.some((c) => c.toLowerCase() === lc)) {
      cleaned.push(candidate);
    }

    if (cleaned.length >= maxBullets) break;
  }

  if (cleaned.length === 0) {
    for (const part of rawParts) {
      const p = part.replace(/\s+/g, " ").trim();
      if (p.length >= 12 && p.length <= 180 && /[A-Za-z]/.test(p) && !/review|rating|best sellers|asin|item model/i.test(p)) {
        if (!cleaned.includes(p)) cleaned.push(p);
        if (cleaned.length >= Math.min(4, maxBullets)) break;
      }
    }
  }

  const normalizedBullets = cleaned.map((b) => {
    const t = b.trim();
    if (/[a-zA-Z]$/.test(t) && t.length > 40 && !/[.?!]$/.test(t)) return t + ".";
    return t;
  });

  return normalizedBullets.slice(0, maxBullets);
}

export async function scrapeAmazonProduct(
    asin: string,
): Promise<ScrapedProduct | null> {
    const url = `https://www.amazon.in/dp/${asin}`;

    try {
        let html: string;
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
                Accept: "text/html,application/xhtml+xml",
            },
            timeout: 12_000,
            maxRedirects: 5,
        });
        html = data;

        const $ = cheerio.load(html);

        // title
        let title =
            norm($("#productTitle").text()) ||
            norm($("#title").text()) ||
            norm($("h1#title").text()) ||
            norm($("span#title").text()) ||
            norm($("meta[property='og:title']").attr("content")) ||
            norm($("meta[name='title']").attr("content"));

        // Bullets/features
        const rawBullets = $("#feature-bullets ul li, #feature-bullets li").text();
        
        let bullets: string[] = cleanBullets(rawBullets);
        
        if (bullets.length === 0) {
            const temp = $("div#detailBullets_feature_div li, ul.a-unordered-list.a-vertical li, .a-list-item").text();
            bullets = cleanBullets(temp);
        }
        if (bullets.length === 0) {
            const temp = $("#productOverview_feature_div table tr, #prodDetails table tr, #productDetails_feature_div li").text();
            bullets = cleanBullets(temp);
        }
        const uniqBullets = Array.from(new Set(bullets.map((b) => b.trim()))).filter(Boolean);

        // description
        let description =
            norm($("#productDescription").text()) ||
            norm($("#productDescription_feature_div").text()) ||
            parseAplusDescription($) ||
            parseProductOverview($) ||
            undefined;

        // fallback from scripts if no title
        if (!title) {
            $("script[type='text/javascript'], script").each((_, s) => {
                const scriptText = $(s).html() ?? "";
                if (!title) {
                    const m1 = scriptText.match(/"title"\s*:\s*"([^"]{10,300})"/i);
                    const m2 = scriptText.match(/"productTitle"\s*:\s*"([^"]{10,300})"/i);
                    if (m1) title = norm(m1[1]);
                    if (m2) title = norm(m2[1]);
                }
            });
        }

        const result: ScrapedProduct = {
            asin,
            title: title ?? null,
            bullets: uniqBullets.length ? uniqBullets : [],
            description: cleanText(description),
            source_url: url,
        };

        return result;
    } catch (err) {
        console.warn("Scrape failed for ASIN", asin, err);
        return null;
    }
}
