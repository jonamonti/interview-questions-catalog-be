import request from "supertest";
import app from "../../app";
import { prisma } from "../../db";
import { API_KEY, seedQuestion, slugsOf } from "../../test/factories";
import { resetDatabase } from "../../test/reset-database";

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

const patch = (id: number | string, body: object) =>
  request(app)
    .patch(`/api/questions/${id}`)
    .set("x-api-key", API_KEY)
    .send(body);

describe("PATCH /api/questions/:id", () => {
  it("updates one field and leaves the others unchanged", async () => {
    // ARRANGE
    const question = await seedQuestion({
      title: "Old title",
      answer: "Old answer",
      difficulty: "EASY",
      tags: ["javascript"],
    });

    // ACT
    const response = await patch(question.id, { title: "New title" });

    // ASSERT
    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      title: "New title",
      answer: "Old answer",
      difficulty: "EASY",
    });
    expect(slugsOf(response.body.data.tags)).toEqual(["javascript"]);
  });

  it("replaces the tags when tags are sent", async () => {
    // ARRANGE
    const question = await seedQuestion({ tags: ["javascript", "react"] });

    // ACT
    const response = await patch(question.id, { tags: ["SQL"] });

    // ASSERT
    expect(response.status).toBe(200);
    expect(slugsOf(response.body.data.tags)).toEqual(["sql"]);
    expect(await prisma.questionTag.count()).toBe(1);
    expect(await prisma.tag.count()).toBe(3);
  });

  it("clears the tags when an empty list is sent", async () => {
    // ARRANGE
    const question = await seedQuestion({ tags: ["javascript"] });

    // ACT
    const response = await patch(question.id, { tags: [] });

    // ASSERT
    expect(response.status).toBe(200);
    expect(response.body.data.tags).toEqual([]);
  });

  it("changes updatedAt even when only the tags change", async () => {
    // ARRANGE
    const question = await seedQuestion({ tags: ["javascript"] });
    await new Promise((resolve) => setTimeout(resolve, 10));

    // ACT
    const response = await patch(question.id, { tags: ["react"] });

    // ASSERT
    expect(new Date(response.body.data.updatedAt).getTime()).toBeGreaterThan(
      question.updatedAt.getTime(),
    );
  });

  it("returns 400 for an empty body", async () => {
    // ARRANGE
    const question = await seedQuestion();

    // ACT
    const response = await patch(question.id, {});

    // ASSERT
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for an unknown key", async () => {
    // ARRANGE
    const question = await seedQuestion();

    // ACT
    const response = await patch(question.id, { foo: 1 });

    // ASSERT
    expect(response.status).toBe(400);
  });

  it("returns 400 for an invalid field value", async () => {
    // ARRANGE
    const question = await seedQuestion();

    // ACT
    const response = await patch(question.id, { difficulty: "IMPOSSIBLE" });

    // ASSERT
    expect(response.status).toBe(400);
    expect(response.body.error.details[0].path).toBe("difficulty");
  });

  it("returns 404 when the question does not exist", async () => {
    // ACT
    const response = await patch(999999, { title: "x" });

    // ASSERT
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });

  it("returns 400 for an invalid id", async () => {
    // ACT
    const response = await patch("abc", { title: "x" });

    // ASSERT
    expect(response.status).toBe(400);
  });

  it("returns 401 without an API key and changes nothing", async () => {
    // ARRANGE
    const question = await seedQuestion({ title: "Original" });

    // ACT
    const response = await request(app)
      .patch(`/api/questions/${question.id}`)
      .send({ title: "Hacked" });

    // ASSERT
    expect(response.status).toBe(401);
    const stored = await prisma.question.findUniqueOrThrow({
      where: { id: question.id },
    });
    expect(stored.title).toBe("Original");
  });
});
