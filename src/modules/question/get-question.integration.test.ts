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
      difficulty: "medium",
    });
    expect(slugsOf(response.body.data.tags)).toEqual(["javascript", "react"]);
  });

  it("returns the lead and the body of a multi-paragraph answer", async () => {
    // ARRANGE
    const question = await seedQuestion({
      answer:
        "The lead.\n\nThe body.\n\n```js\nconst a = 1;\n\nconst b = 2;\n```",
    });

    // ACT
    const response = await request(app).get(`/api/questions/${question.id}`);

    // ASSERT
    expect(response.body.data.lead).toBe("The lead.");
    expect(response.body.data.body).toBe(
      "The body.\n\n```js\nconst a = 1;\n\nconst b = 2;\n```",
    );
  });

  it("returns a plain-text preview without Markdown or code blocks", async () => {
    // ARRANGE
    const question = await seedQuestion({
      answer:
        "A **closure** keeps [its scope](https://x.dev) alive.\n```js\nconst a = 1;\n```\nSecond line.\n\nBody text.",
    });

    // ACT
    const response = await request(app).get(`/api/questions/${question.id}`);

    // ASSERT
    expect(response.body.data.preview).toBe(
      "A closure keeps its scope alive. Second line.",
    );
    expect(response.body.data.answer).toContain("**closure**");
  });

  it("returns an empty body for a single-paragraph answer", async () => {
    // ARRANGE
    const question = await seedQuestion({ answer: "Just one paragraph." });

    // ACT
    const response = await request(app).get(`/api/questions/${question.id}`);

    // ASSERT
    expect(response.body.data.lead).toBe("Just one paragraph.");
    expect(response.body.data.body).toBe("");
  });

  it("returns every difficulty in lowercase", async () => {
    // ARRANGE
    const easy = await seedQuestion({ difficulty: "easy" });
    const hard = await seedQuestion({ difficulty: "hard" });

    // ACT
    const easyResponse = await request(app).get(`/api/questions/${easy.id}`);
    const hardResponse = await request(app).get(`/api/questions/${hard.id}`);

    // ASSERT
    expect(easyResponse.body.data.difficulty).toBe("easy");
    expect(hardResponse.body.data.difficulty).toBe("hard");
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
