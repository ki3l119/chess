import dotenv from "dotenv";
dotenv.config();
import { Pool } from "pg";
import { defineConfig } from "kysely-ctl";

export default defineConfig({
  dialect: "pg",
  dialectConfig: {
    pool: new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    }),
  },
});
