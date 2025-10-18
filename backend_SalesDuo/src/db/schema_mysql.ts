import {
  mysqlTable,
  varchar,
  text,
  json,
  timestamp,
  int
} from "drizzle-orm/mysql-core";

// each optimization run for an ASIN
export const runs = mysqlTable("runs", {
  id: int("id").primaryKey().autoincrement(),
  asin: varchar("asin", { length: 20 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// scraped info from Amazon
export const originalData = mysqlTable("original_data", {
  id: int("id").primaryKey().autoincrement(),
  asin: varchar("asin", { length: 20 }).notNull().unique(),
  title: text("title"),
  bullets: json("bullets").$type<string[]>(),
  description: text("description"),
  fetched_at: timestamp("fetched_at").defaultNow(),
  source_url: varchar("source_url", { length: 1024 }),
});

// AI optimized content for each run
export const optimizedData = mysqlTable("optimized_data", {
  id: int("id").primaryKey().autoincrement(),
  run_id: int("run_id").notNull()
    .references(() => runs.id, { onDelete: "cascade" }),
  title: text("title"),
  bullets: json("bullets").$type<string[]>(),
  description: text("description"),
  keywords: json("keywords").$type<string[]>(),
  created_at: timestamp("created_at").defaultNow(),
});