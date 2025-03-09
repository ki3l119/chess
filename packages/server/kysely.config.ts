import dotenv from "dotenv";
dotenv.config();
import { Pool } from "pg";
import { defineConfig } from "kysely-ctl";
import { loadDatabaseConfig } from "./src/config";

export default defineConfig({
  dialect: "pg",
  dialectConfig: {
    pool: new Pool(loadDatabaseConfig()),
  },
});
