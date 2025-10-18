import {
  pgTable,
  serial,
  text,
  jsonb,
  timestamp,
  varchar,
  integer,
} from "drizzle-orm/pg-core";

// each optimization run for an ASIN
export const runs = pgTable("runs", {
  id: serial("id").primaryKey(),
  asin: varchar("asin", { length: 20 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// scraped info from Amazon
export const originalData = pgTable("original_data", {
  id: serial("id").primaryKey(),
  asin: varchar("asin", { length: 20 }).notNull().unique(),
  title: text("title"),
  bullets: jsonb("bullets").$type<string[]>(),
  description: text("description"),
  fetched_at: timestamp("fetched_at").defaultNow(),
  source_url: varchar("source_url", { length: 1024 }),
});

// AI optimized content for each run
export const optimizedData = pgTable("optimized_data", {
  id: serial("id").primaryKey(),
  run_id: integer("run_id")
    .notNull()
    .references(() => runs.id, { onDelete: "cascade" }),
  title: text("title"),
  bullets: jsonb("bullets").$type<string[]>(),
  description: text("description"),
  keywords: jsonb("keywords").$type<string[]>(),
  created_at: timestamp("created_at").defaultNow(),
});
