import request from "supertest";
import app from "../../app";
import { prisma } from "../../db";
import { API_KEY, seedQuestion } from "../../test/factories";
import { resetDatabase } from "../../test/reset-database";

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

const remove = (id: number | string) =>
  request(app).delete(`/api/questions/${id}`).set("x-api-key", API_KEY);

describe("DELETE /api/questions/:id", () => {
  it("returns 204 and removes the question and its tag links", async () => {
    // ARRANGE
    const question = await seedQuestion({ tags: ["javascript", "react"] });

    // ACT
    const response = await remove(question.id);

    // ASSERT
    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
    expect(await prisma.question.count()).toBe(0);
    expect(await prisma.questionTag.count()).toBe(0);
  });

  it("keeps the tags themselves", async () => {
    // ARRANGE
    const question = await seedQuestion({ tags: ["javascript"] });

    // ACT
    await remove(question.id);

    // ASSERT
    expect(await prisma.tag.count()).toBe(1);
  });

  it("returns 404 when the question does not exist", async () => {
    // ACT
    const response = await remove(999999);

    // ASSERT
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });

  it("returns 404 the second time", async () => {
    // ARRANGE
    const question = await seedQuestion();
    await remove(question.id);

    // ACT
    const response = await remove(question.id);

    // ASSERT
    expect(response.status).toBe(404);
  });

  it("returns 400 for an invalid id", async () => {
    // ACT
    const response = await remove("abc");

    // ASSERT
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 401 without an API key and deletes nothing", async () => {
    // ARRANGE
    const question = await seedQuestion();

    // ACT
    const response = await request(app).delete(`/api/questions/${question.id}`);

    // ASSERT
    expect(response.status).toBe(401);
    expect(await prisma.question.count()).toBe(1);
  });
});
