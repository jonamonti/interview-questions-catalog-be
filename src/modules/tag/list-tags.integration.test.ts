import request from "supertest";
import app from "../../app";
import { prisma } from "../../db";
import { seedQuestion } from "../../test/factories";
import { resetDatabase } from "../../test/reset-database";

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

describe("GET /api/tags", () => {
  it("returns an empty list when there are no tags", async () => {
    // ACT
    const response = await request(app).get("/api/tags");

    // ASSERT
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({ list: [] });
  });

  it("returns tags with question counts, sorted by name", async () => {
    // ARRANGE
    await seedQuestion({ tags: ["sql", "javascript"] });
    await seedQuestion({ tags: ["javascript"] });

    // ACT
    const response = await request(app).get("/api/tags");

    // ASSERT
    expect(response.status).toBe(200);
    expect(response.body.data.list).toEqual([
      expect.objectContaining({ slug: "javascript", questionCount: 2 }),
      expect.objectContaining({ slug: "sql", questionCount: 1 }),
    ]);
  });

  it("leaves out tags that no question uses", async () => {
    // ARRANGE
    const question = await seedQuestion({ tags: ["orphan"] });
    await seedQuestion({ tags: ["javascript"] });
    await prisma.question.delete({ where: { id: question.id } });

    // ACT
    const response = await request(app).get("/api/tags");

    // ASSERT
    expect(await prisma.tag.count()).toBe(2);
    expect(
      response.body.data.list.map((tag: { slug: string }) => tag.slug),
    ).toEqual(["javascript"]);
  });
});
