import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./utils/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://aimockinterview_owner:w2efOmHrQ0DJ@ep-holy-mouse-a5rdj31c.us-east-2.aws.neon.tech/aimockinterview?sslmode=require",
  },
  verbose: true,
  strict: true,
});
