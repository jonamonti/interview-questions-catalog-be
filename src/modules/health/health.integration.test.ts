import request from "supertest";
import app from "../../app";
import { prisma } from "../../db";

afterAll(() => prisma.$disconnect());

describe("GET /api/health", () => {
  it("returns 200 when the database is reachable", async () => {
    // ACT
    const response = await request(app).get("/api/health");

    // ASSERT
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Service is healthy",
      data: { status: "ok", database: "connected" },
    });
  });
});
