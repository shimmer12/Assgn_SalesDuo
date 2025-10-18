// import { mysqlTable, mysqlSchema, AnyMySqlColumn } from "drizzle-orm/mysql-core";
// import { drizzle } from "drizzle-orm/mysql2";
// import mysql from "mysql2/promise";

// const pool = mysql.createPool({
//   host: "127.0.0.1",
//   port: 3307,
//   user: "user",
//   password: "password",
//   database: "salesduo",
// });

// export const db = drizzle(pool);

// import { drizzle } from "drizzle-orm/mysql2";
// import mysql from "mysql2/promise";

// // Create a connection pool using environment variables.
// // This allows the connection details to be configured externally,
// // which is essential for running in Docker.
// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   port: 3306, // Inside the Docker network, the port is always the standard 3306.
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// export const db = drizzle(pool);

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  // This 'dialect' property is required by Drizzle Kit to know
  // what type of SQL to generate.
  dialect: 'mysql',
  dbCredentials: {
    // This tells Drizzle Kit how to connect to the database
    // to push schema changes. It reads the same environment
    // variable your application uses.
    url: process.env.DATABASE_URL!,
  },
});
