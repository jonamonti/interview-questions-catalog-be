import request from "supertest";
import app from "../../app";
import { prisma } from "../../db";
import { seedQuestion, slugsOf } from "../../test/factories";
import { resetDatabase } from "../../test/reset-database";

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

describe("GET /api/questions/:id", () => {
  it("returns the question with its answer and tags", async () => {
    // ARRANGE
    const question = await seedQuestion({
      title: "What is a closure?",
      answer: "**md** answer",
      tags: ["react", "javascript"],
    });

    // ACT
    const response = await request(app).get(`/api/questions/${question.id}`);

    // ASSERT
    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      id: question.id,
      title: "What is a closure?",
      answer: "**md** answer",
      difficulty: "MEDIUM",
    });
    expect(slugsOf(response.body.data.tags)).toEqual(["javascript", "react"]);
  });

  it("returns 404 when the question does not exist", async () => {
    // ACT
    const response = await request(app).get("/api/questions/999999");

    // ASSERT
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });

  it.each(["abc", "1.5", "-3", "0"])(
    "returns 400 for the invalid id %s",
    async (id) => {
      // ACT
      const response = await request(app).get(`/api/questions/${id}`);

      // ASSERT
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    },
  );
});
