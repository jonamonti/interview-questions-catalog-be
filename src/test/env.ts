import { assertTestDatabase, TEST_DATABASE_URL } from "./test-database";

assertTestDatabase(TEST_DATABASE_URL);
process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.API_KEY = "test-api-key";
process.env.NODE_ENV = "test";
// The suite makes many requests from one address; the rate limit has its own
// tests with small limits (rate-limit.integration.test.ts).
process.env.RATE_LIMIT_MAX = "100000";
process.env.RATE_LIMIT_WRITE_MAX = "100000";
process.env.RATE_LIMIT_AUTH_FAIL_MAX = "100000";
