import request from "supertest";

type App = Parameters<typeof request>[0];

const ENV_KEYS = [
  "TRUST_PROXY",
  "RATE_LIMIT_MAX",
  "RATE_LIMIT_WRITE_MAX",
  "RATE_LIMIT_AUTH_FAIL_MAX",
] as const;

const saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
});

// The limits are read when the app is imported, so each test loads a fresh app
// (and fresh counters) with its own small limits.
const loadApp = async (
  limits: Partial<Record<(typeof ENV_KEYS)[number], string>>,
) => {
  Object.assign(process.env, limits);
  let app: App | undefined;
  await jest.isolateModulesAsync(async () => {
    // TypeScript types the default export of a CommonJS module as the whole
    // module; at runtime, ts-jest gives the Express app.
    app = (await import("../app.js")).default as unknown as App;
  });
  return app as App;
};

describe("rate limit - all requests", () => {
  it("returns 429 in the envelope with Retry-After after the limit", async () => {
    // ARRANGE
    const app = await loadApp({ RATE_LIMIT_MAX: "3" });

    // ACT
    for (let i = 0; i < 3; i++) await request(app).get("/api/nope");
    const response = await request(app).get("/api/nope");

    // ASSERT
    expect(response.status).toBe(429);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: "RATE_LIMITED" },
    });
    expect(Number(response.headers["retry-after"])).toBeGreaterThan(0);
    expect(response.headers["ratelimit-limit"]).toBe("3");
  });

  it("keeps a separate count for each client behind a trusted proxy", async () => {
    // ARRANGE
    const app = await loadApp({ RATE_LIMIT_MAX: "1", TRUST_PROXY: "1" });
    const from = (ip: string) =>
      request(app).get("/api/nope").set("X-Forwarded-For", ip);

    // ACT
    await from("203.0.113.1");
    const sameClient = await from("203.0.113.1");
    const otherClient = await from("203.0.113.2");

    // ASSERT
    expect(sameClient.status).toBe(429);
    expect(otherClient.status).toBe(404);
  });

  it("ignores X-Forwarded-For when no proxy is trusted", async () => {
    // ARRANGE
    const app = await loadApp({ RATE_LIMIT_MAX: "1", TRUST_PROXY: "0" });

    // ACT
    await request(app).get("/api/nope").set("X-Forwarded-For", "203.0.113.1");
    const response = await request(app)
      .get("/api/nope")
      .set("X-Forwarded-For", "203.0.113.2");

    // ASSERT
    expect(response.status).toBe(429);
  });
});

describe("rate limit - write requests", () => {
  it("limits POST, PATCH and DELETE but not reads", async () => {
    // ARRANGE
    const app = await loadApp({ RATE_LIMIT_WRITE_MAX: "2" });

    // ACT
    await request(app).post("/api/questions");
    await request(app).patch("/api/questions/1");
    const write = await request(app).delete("/api/questions/1");
    const read = await request(app).get("/api/nope");

    // ASSERT
    expect(write.status).toBe(429);
    expect(write.body.error.code).toBe("RATE_LIMITED");
    expect(read.status).toBe(404);
  });
});

describe("rate limit - wrong API key", () => {
  it("blocks the client after too many 401 responses, even with the right key", async () => {
    // ARRANGE
    const app = await loadApp({ RATE_LIMIT_AUTH_FAIL_MAX: "2" });

    // ACT
    await request(app).post("/api/questions").set("x-api-key", "wrong-1");
    await request(app).post("/api/questions").set("x-api-key", "wrong-2");
    const blocked = await request(app)
      .post("/api/questions")
      .set("x-api-key", "test-api-key");

    // ASSERT
    expect(blocked.status).toBe(429);
  });

  it("does not count writes that pass the key check", async () => {
    // ARRANGE
    const app = await loadApp({ RATE_LIMIT_AUTH_FAIL_MAX: "2" });

    // ACT: with the right key and an empty body, validation answers 400
    const statuses: number[] = [];
    for (let i = 0; i < 5; i++) {
      const response = await request(app)
        .post("/api/questions")
        .set("x-api-key", "test-api-key")
        .send({});
      statuses.push(response.status);
    }

    // ASSERT
    expect(statuses).toEqual([400, 400, 400, 400, 400]);
  });

  it("does not block reads after failed writes", async () => {
    // ARRANGE
    const app = await loadApp({ RATE_LIMIT_AUTH_FAIL_MAX: "1" });

    // ACT
    await request(app).post("/api/questions").set("x-api-key", "wrong");
    const read = await request(app).get("/api/nope");

    // ASSERT
    expect(read.status).toBe(404);
  });
});
