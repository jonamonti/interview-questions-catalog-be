import { gzipSync } from "node:zlib";
import request from "supertest";
import app from "../../app";
import { prisma } from "../../db";
import { API_KEY, seedQuestion, slugsOf } from "../../test/factories";
import { resetDatabase } from "../../test/reset-database";

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

const validBody = {
  title: "What is a closure?",
  answer: "A function that **remembers** its scope.",
  difficulty: "medium",
  tags: ["JavaScript", " javascript", "C++"],
};

describe("POST /api/questions", () => {
  it("creates a question with normalized, de-duplicated tags", async () => {
    // ACT
    const response = await request(app)
      .post("/api/questions")
      .set("x-api-key", API_KEY)
      .send(validBody);

    // ASSERT
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      title: "What is a closure?",
      difficulty: "medium",
    });
    expect(slugsOf(response.body.data.tags)).toEqual([
      "c-plus-plus",
      "javascript",
    ]);
    expect(await prisma.question.count()).toBe(1);
  });

  it("returns the lead and the body and stores the database difficulty", async () => {
    // ACT
    const response = await request(app)
      .post("/api/questions")
      .set("x-api-key", API_KEY)
      .send({
        ...validBody,
        answer: "Lead **paragraph**.\n\nBody paragraph.",
        difficulty: "hard",
      });

    // ASSERT
    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      answer: "Lead **paragraph**.\n\nBody paragraph.",
      lead: "Lead **paragraph**.",
      body: "Body paragraph.",
      preview: "Lead paragraph.",
      difficulty: "hard",
    });
    const stored = await prisma.question.findUniqueOrThrow({
      where: { id: response.body.data.id },
    });
    expect(stored.difficulty).toBe("HARD");
  });

  it("returns 400 for an uppercase difficulty and stores nothing", async () => {
    // ACT
    const response = await request(app)
      .post("/api/questions")
      .set("x-api-key", API_KEY)
      .send({ ...validBody, difficulty: "MEDIUM" });

    // ASSERT
    expect(response.status).toBe(400);
    expect(response.body.error.details[0].path).toBe("difficulty");
    expect(await prisma.question.count()).toBe(0);
  });

  it("creates a question without tags when none are sent", async () => {
    // ACT
    const response = await request(app)
      .post("/api/questions")
      .set("x-api-key", API_KEY)
      .send({ ...validBody, tags: undefined });

    // ASSERT
    expect(response.status).toBe(201);
    expect(response.body.data.tags).toEqual([]);
  });

  it("reuses an existing tag instead of creating a duplicate", async () => {
    // ARRANGE
    await seedQuestion({ tags: ["javascript"] });

    // ACT
    const response = await request(app)
      .post("/api/questions")
      .set("x-api-key", API_KEY)
      .send({ ...validBody, tags: ["javascript"] });

    // ASSERT
    expect(response.status).toBe(201);
    expect(await prisma.tag.count()).toBe(1);
    expect(await prisma.question.count()).toBe(2);
  });

  it("returns 401 without an API key", async () => {
    // ACT
    const response = await request(app).post("/api/questions").send(validBody);

    // ASSERT
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
    expect(await prisma.question.count()).toBe(0);
  });

  it("returns 401 with a wrong API key", async () => {
    // ACT
    const response = await request(app)
      .post("/api/questions")
      .set("x-api-key", "wrong-key")
      .send(validBody);

    // ASSERT
    expect(response.status).toBe(401);
    expect(await prisma.question.count()).toBe(0);
  });

  it("returns 400 when the title is missing", async () => {
    // ACT
    const response = await request(app)
      .post("/api/questions")
      .set("x-api-key", API_KEY)
      .send({ ...validBody, title: undefined });

    // ASSERT
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.error.details[0].path).toBe("title");
    expect(await prisma.question.count()).toBe(0);
  });

  it("returns 400 for an unknown key", async () => {
    // ACT
    const response = await request(app)
      .post("/api/questions")
      .set("x-api-key", API_KEY)
      .send({ ...validBody, foo: 1 });

    // ASSERT
    expect(response.status).toBe(400);
    expect(response.body.error.details[0].path).toBe("foo");
  });

  it("returns 400 for an invalid difficulty", async () => {
    // ACT
    const response = await request(app)
      .post("/api/questions")
      .set("x-api-key", API_KEY)
      .send({ ...validBody, difficulty: "IMPOSSIBLE" });

    // ASSERT
    expect(response.status).toBe(400);
    expect(response.body.error.details[0].path).toBe("difficulty");
  });

  it("returns 400 for more than 10 tags", async () => {
    // ARRANGE
    const tags = Array.from({ length: 11 }, (_, index) => `tag-${index}`);

    // ACT
    const response = await request(app)
      .post("/api/questions")
      .set("x-api-key", API_KEY)
      .send({ ...validBody, tags });

    // ASSERT
    expect(response.status).toBe(400);
    expect(response.body.error.details[0].path).toBe("tags");
    expect(await prisma.question.count()).toBe(0);
  });

  it("returns 400 for malformed JSON", async () => {
    // ACT
    const response = await request(app)
      .post("/api/questions")
      .set("x-api-key", API_KEY)
      .set("content-type", "application/json")
      .send("{ not json");

    // ASSERT
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Malformed JSON body");
  });
});

describe("POST /api/questions - request limits", () => {
  it("returns 400 with the field path for an answer over the maximum", async () => {
    // ACT
    const response = await request(app)
      .post("/api/questions")
      .set("x-api-key", API_KEY)
      .send({ ...validBody, answer: "a".repeat(20001) });

    // ASSERT
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.error.details[0].path).toBe("answer");
    expect(await prisma.question.count()).toBe(0);
  });

  it("returns 413 in the envelope for a body over the limit", async () => {
    // ACT
    const response = await request(app)
      .post("/api/questions")
      .set("x-api-key", API_KEY)
      .send({ ...validBody, answer: "a".repeat(70000) });

    // ASSERT
    expect(response.status).toBe(413);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: "PAYLOAD_TOO_LARGE" },
    });
    expect(response.body.error.details).toBeUndefined();
    expect(await prisma.question.count()).toBe(0);
  });

  it("returns 415 for a compressed body", async () => {
    // ARRANGE
    const compressed = gzipSync(JSON.stringify(validBody));

    // ACT
    const response = await request(app)
      .post("/api/questions")
      .set("x-api-key", API_KEY)
      .set("Content-Type", "application/json")
      .set("Content-Encoding", "gzip")
      .send(compressed);

    // ASSERT
    expect(response.status).toBe(415);
    expect(response.body.error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
    expect(await prisma.question.count()).toBe(0);
  });
});
