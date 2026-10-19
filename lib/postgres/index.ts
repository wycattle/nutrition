import { Pool } from "pg";

// Centralized Pool instance for the whole app
// Add SSL or other config here as needed
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Example: add SSL config if needed
  // ssl: { rejectUnauthorized: false },
});
console.log("DB URL host:", process.env.DATABASE_URL?.split("@")[1]?.split("/")[0]);
pool.on("error", (e) => console.error("pg pool error", e));

export default pool;
