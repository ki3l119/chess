import "dotenv/config";
import { Pool } from "pg";
import { defineConfig } from "kysely-ctl";

export default defineConfig({
  dialect: "pg",
  dialectConfig: {
    pool: new Pool({
      connectionString: process.env.DB_URI,
    }),
  },
});
