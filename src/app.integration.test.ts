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
