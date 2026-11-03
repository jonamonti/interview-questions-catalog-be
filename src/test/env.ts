import { assertTestDatabase, TEST_DATABASE_URL } from "./test-database";

assertTestDatabase(TEST_DATABASE_URL);
process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.API_KEY = "test-api-key";
process.env.NODE_ENV = "test";
