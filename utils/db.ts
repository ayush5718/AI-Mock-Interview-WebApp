import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.NEXT_PUBLIC_DRIZZLE_DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "NEXT_DRIZZLE_DATABASE_URL environment variable is not defined"
  );
}

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
