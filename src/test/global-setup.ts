import { Client } from "pg";
import { assertTestDatabase, TEST_DATABASE_URL } from "./test-database";
import { execSync } from "node:child_process";

const globalSetup = async () => {
  assertTestDatabase(TEST_DATABASE_URL);
  const url = new URL(TEST_DATABASE_URL);
  const databaseName = url.pathname.slice(1);
  url.pathname = "/postgres";

  const client = new Client({ connectionString: url.toString() });
  await client.connect();
  const { rowCount } = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [databaseName],
  );
  if (!rowCount) await client.query(`CREATE DATABASE "${databaseName}"`);
  await client.end();

  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: "inherit",
  });
};

export default globalSetup;
