import { Pool } from "pg";

// Centralized Pool instance for the whole app
// Add SSL or other config here as needed
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Example: add SSL config if needed
  // ssl: { rejectUnauthorized: false },
});

export default pool;
