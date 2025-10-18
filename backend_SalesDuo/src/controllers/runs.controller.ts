// runs.controller.ts
import { Request, Response } from "express";
import * as originalService from "../services/original.service.js";
import * as scrapeService from "../services/scrape.service.js";
import * as aiService from "../services/ai.service.js";
import { db } from "../db/index.js";
import { runs, optimizedData, originalData } from "../db/schema.js";
import { desc, eq } from "drizzle-orm";


type Body = { asin?: string };

export async function postRun(req: Request<{}, {}, Body>, res: Response) {
    const { asin } = req.body;

    if (!asin || typeof asin !== "string") {
        return res.status(400).json({ error: "asin is required" });
    }

    // find existing original_data by ASIN
    let original = await originalService.findOriginalByAsin(asin);

    // If not found, scrape and insert original_data
    if (!original) {
        const scraped = await scrapeService.scrapeAmazonProduct(asin);

        if (!scraped) {
            return res.status(404).json({ error: "ASIN not found on Amazon" });
        }

        

        await db.insert(originalData).values({
            asin: scraped.asin,
            title: scraped.title ?? null,
            bullets: scraped.bullets ?? [],
            description: scraped.description ?? null,
            source_url: scraped.source_url ?? null,
        }).execute();

        original = await originalService.findOriginalByAsin(asin);
    }

    if (!original) {
        return res.status(500).json({ error: "Failed to create original_data record" });
    }

    await db.insert(runs).values({
        asin: asin,
    }).execute();

    const createdRun = await db.select().from(runs).orderBy(desc(runs.created_at)).limit(1);
    const run = createdRun[0] ?? null;

    if (!run) {
        return res.status(500).json({ error: "Failed to create run record" });
    }

    let optimized: any;
    try {
        optimized = await aiService.optimizeProduct({
            title: original.title,
            bullets: original.bullets,
            description: original.description,
        });


    } catch (error) {
        console.error("AI optimization error:", error);
        return res.status(500).json({ error: "AI optimization failed" });
    }

    if (!optimized) {
        return res.status(500).json({ error: "AI optimization failed" });
    }

    await db.insert(optimizedData).values({
        title: optimized.title,
        bullets: optimized.bullets,
        description: optimized.description,
        keywords: optimized.keywords,
        run_id: run.id,
    }).execute();

    const get_row_opt = await db.select().from(optimizedData).where(eq(optimizedData.run_id, run.id)).limit(1);

    const optimizedRow = get_row_opt[0] ?? null;

    if (!optimizedRow) {
        return res.status(500).json({ error: "Failed to fetch optimized_data record" });
    }

    return res.status(201).json({
        run,
        original,
        optimized: optimizedRow,
    });
}

export async function getRuns(req: Request, res: Response) {
  try {
    const limit = Math.min(100, Number(req.query.limit ?? 50));
    const offset = Math.max(0, Number(req.query.offset ?? 0));

    const rows = await db
      .select({
        run_id: runs.id,
        asin: runs.asin,
        run_created_at: runs.created_at,
        optimized_id: optimizedData.id,
        optimized_title: optimizedData.title,
        optimized_bullets: optimizedData.bullets,
        optimized_description: optimizedData.description,
        optimized_keywords: optimizedData.keywords,
        optimized_created_at: optimizedData.created_at,
        original_id: originalData.id,
        original_title: originalData.title,
        original_bullets: originalData.bullets,
        original_description: originalData.description,
        original_fetched_at: originalData.fetched_at,
      })
      .from(runs)
      .leftJoin(optimizedData, eq(runs.id, optimizedData.run_id))
      .leftJoin(originalData, eq(runs.asin, originalData.asin))
      .orderBy(desc(runs.created_at))
      .limit(limit)
      .offset(offset);

    const completed = rows.filter((r) => r.optimized_id != null);

    const result = completed.map((r) => ({
      id: r.run_id,
      asin: r.asin,
      created_at: r.run_created_at,
      optimized: r.optimized_id
        ? {
            id: r.optimized_id,
            title: r.optimized_title ?? null,
            bullets: (r.optimized_bullets as any) ?? [],
            description: r.optimized_description ?? null,
            keywords: (r.optimized_keywords as any) ?? [],
            created_at: r.optimized_created_at ?? null,
          }
        : null,
      original: r.original_id
        ? {
            id: r.original_id,
            title: r.original_title ?? null,
            bullets: (r.original_bullets as any) ?? [],
            description: r.original_description ?? null,
            fetched_at: r.original_fetched_at ?? null,
          }
        : null,
    }));

    return res.json({ ok: true, count: result.length, results: result });
  } catch (err) {
    console.error("getRuns error:", err);
    return res.status(500).json({ error: "Failed to fetch runs" });
  }
}

export async function getRun(req: Request, res: Response) {
  try {
    const asin = String(req.params.asin ?? "").trim();
    if (!asin) return res.status(400).json({ error: "asin is required" });

    const rows = await db
      .select({
        run_id: runs.id,
        run_created_at: runs.created_at,
        optimized_id: optimizedData.id,
        optimized_title: optimizedData.title,
        optimized_bullets: optimizedData.bullets,
        optimized_description: optimizedData.description,
        optimized_keywords: optimizedData.keywords,
        optimized_created_at: optimizedData.created_at,
        original_id: originalData.id,
        original_title: originalData.title,
        original_bullets: originalData.bullets,
        original_description: originalData.description,
        original_fetched_at: originalData.fetched_at,
        original_source_url: originalData.source_url,
      })
      .from(runs)
      .leftJoin(optimizedData, eq(runs.id, optimizedData.run_id))
      .leftJoin(originalData, eq(runs.asin, originalData.asin))
      .where(eq(runs.asin, asin))
      .orderBy(desc(runs.created_at));

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "No runs found for this ASIN" });
    }

    const completedRuns = rows
      .filter((r) => r.optimized_id != null)
      .map((r) => ({
        id: r.run_id,
        created_at: r.run_created_at,
        optimized: r.optimized_id
          ? {
              id: r.optimized_id,
              title: r.optimized_title ?? null,
              bullets: (r.optimized_bullets as any) ?? [],
              description: r.optimized_description ?? null,
              keywords: (r.optimized_keywords as any) ?? [],
              created_at: r.optimized_created_at ?? null,
            }
          : null,
        original: r.original_id
          ? {
              id: r.original_id,
              title: r.original_title ?? null,
              bullets: (r.original_bullets as any) ?? [],
              description: r.original_description ?? null,
              fetched_at: r.original_fetched_at ?? null,
              source_url: r.original_source_url ?? null,
            }
          : null,
      }));

    return res.json({ ok: true, asin, count: completedRuns.length, runs: completedRuns });
  } catch (err) {
    console.error("getRun error:", err);
    return res.status(500).json({ error: "Failed to fetch runs for asin" });
  }
}

