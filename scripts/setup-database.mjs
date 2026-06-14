import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(rootDir, ".env");

dotenv.config({ path: envPath });

const user = process.env.MYSQL_USER ?? "root";
const password = process.env.MYSQL_PASSWORD ?? "";
const host = process.env.MYSQL_HOST ?? "127.0.0.1";
const isTiDBCloud = process.env.TIDB_CLOUD === "true";
const port = Number(process.env.MYSQL_PORT ?? (isTiDBCloud ? 4000 : 3306));
const database = process.env.MYSQL_DATABASE ?? "credit_coop";

if (!password) {
  console.error(
    "MYSQL_PASSWORD is empty in .env.\n" +
      "Set your database password in .env, then run: npm run db:setup",
  );
  process.exit(1);
}

const encodedPassword = encodeURIComponent(password);
const sslParams = isTiDBCloud ? "?sslaccept=strict" : "";
const databaseUrl = `mysql://${user}:${encodedPassword}@${host}:${port}/${database}${sslParams}`;

const updateEnvFile = () => {
  if (!existsSync(envPath)) {
    writeFileSync(envPath, `DATABASE_URL="${databaseUrl}"\n`, "utf8");
    return;
  }

  const envContent = readFileSync(envPath, "utf8");
  const databaseUrlLine = `DATABASE_URL="${databaseUrl}"`;

  if (/^DATABASE_URL=.*$/m.test(envContent)) {
    writeFileSync(
      envPath,
      envContent.replace(/^DATABASE_URL=.*$/m, databaseUrlLine),
      "utf8",
    );
  } else {
    writeFileSync(envPath, `${envContent.trimEnd()}\n${databaseUrlLine}\n`, "utf8");
  }
};

const createDatabase = async () => {
  if (isTiDBCloud) {
    console.log("TiDB Cloud: ensure database exists in TiDB console, then continuing...");
    return;
  }

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await connection.end();
};

const pushSchema = () => {
  execSync("npx prisma db push", {
    cwd: rootDir,
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
};

try {
  console.log(`Creating database "${database}" on ${host}:${port}...`);
  await createDatabase();
  updateEnvFile();
  process.env.DATABASE_URL = databaseUrl;

  console.log("Syncing Prisma schema to database...");
  pushSchema();

  console.log("Database setup complete.");
} catch (error) {
  console.error("Database setup failed:", error instanceof Error ? error.message : error);
  process.exit(1);
}
