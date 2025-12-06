import { Pool } from "pg";
import { config } from "../config/environment";

export const pool = new Pool({
  user: config.db_user || "admin",
  host: config.db_host || "localhost",
  database: config.db_name || "app_db",
  password: config.db_pass || "adminpassword",
  port: Number(config.db_port),
});
