import request from "supertest";
import app from "./app";
import { prisma } from "./db";

afterAll(() => prisma.$disconnect());

describe("app - routing and errors", () => {
  it("returns 404 with the envelope for an unknown route", async () => {
    // ACT
    const response = await request(app).get("/api/nope");

    // ASSERT
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: "NOT_FOUND" },
    });
  });

  it("serves the OpenAPI document with every route", async () => {
    // ACT
    const response = await request(app).get("/api/openapi.json");

    // ASSERT
    expect(response.status).toBe(200);
    expect(Object.keys(response.body.paths)).toEqual(
      expect.arrayContaining([
        "/api/health",
        "/api/questions",
        "/api/questions/{id}",
        "/api/tags",
      ]),
    );
  });
});

describe("app - CORS", () => {
  it("allows the configured origin and the x-api-key header in preflight", async () => {
    // ACT
    const response = await request(app)
      .options("/api/questions")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "x-api-key,content-type");

    // ASSERT
    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
    expect(response.headers["access-control-allow-headers"]).toContain(
      "x-api-key",
    );
  });

  it("sends no allow-origin header to other origins", async () => {
    // ACT
    const response = await request(app)
      .get("/api/health")
      .set("Origin", "https://evil.example");

    // ASSERT
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });
});

describe("app - security headers", () => {
  it("sets security headers and hides the framework", async () => {
    // ACT
    const response = await request(app).get("/api/health");

    // ASSERT
    expect(response.headers["x-powered-by"]).toBeUndefined();
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["strict-transport-security"]).toBeDefined();
    expect(response.headers["referrer-policy"]).toBe("no-referrer");
  });

  it("sets the headers on error responses too", async () => {
    // ACT
    const response = await request(app).get("/api/nope");

    // ASSERT
    expect(response.status).toBe(404);
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("still serves the Swagger UI page", async () => {
    // ACT
    const response = await request(app).get("/api/docs/");

    // ASSERT
    expect(response.status).toBe(200);
    expect(response.text).toContain("Swagger UI");
  });
});
