import request from "supertest";
import app from "../../app";
import { prisma } from "../../db";
import { seedQuestion } from "../../test/factories";
import { resetDatabase } from "../../test/reset-database";

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

const titlesOf = (body: { data: { list: { title: string }[] } }) =>
  body.data.list.map((question) => question.title);

describe("GET /api/questions", () => {
  it("returns an empty page when there are no questions", async () => {
    // ACT
    const response = await request(app).get("/api/questions");

    // ASSERT
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      list: [],
    });
  });

  it("lists questions newest first with their tags", async () => {
    // ARRANGE
    await seedQuestion({ title: "Old", tags: ["javascript"] });
    await seedQuestion({ title: "New" });

    // ACT
    const response = await request(app).get("/api/questions");

    // ASSERT
    expect(response.status).toBe(200);
    expect(titlesOf(response.body)).toEqual(["New", "Old"]);
    expect(response.body.data.list[1].tags[0].slug).toBe("javascript");
  });

  it("paginates and reports the totals", async () => {
    // ARRANGE
    for (const title of ["Q1", "Q2", "Q3", "Q4", "Q5"]) {
      await seedQuestion({ title });
    }

    // ACT
    const response = await request(app)
      .get("/api/questions")
      .query({ page: 2, limit: 2 });

    // ASSERT
    expect(response.status).toBe(200);
    expect(response.body.data.pagination).toEqual({
      page: 2,
      limit: 2,
      total: 5,
      totalPages: 3,
    });
    expect(titlesOf(response.body)).toEqual(["Q3", "Q2"]);
  });

  it("returns an empty list for a page past the end", async () => {
    // ARRANGE
    await seedQuestion();

    // ACT
    const response = await request(app)
      .get("/api/questions")
      .query({ page: 5 });

    // ASSERT
    expect(response.status).toBe(200);
    expect(response.body.data.list).toEqual([]);
    expect(response.body.data.pagination.total).toBe(1);
  });

  it.each([
    { page: 0 },
    { limit: 0 },
    { limit: 101 },
    { page: "abc" },
    { foo: "bar" },
  ])("returns 400 for invalid query %j", async (query) => {
    // ACT
    const response = await request(app).get("/api/questions").query(query);

    // ASSERT
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/questions - tag filtering", () => {
  beforeEach(async () => {
    await seedQuestion({ title: "A", tags: ["javascript", "react"] });
    await seedQuestion({ title: "B", tags: ["javascript"] });
    await seedQuestion({ title: "C", tags: ["react", "sql"] });
    await seedQuestion({ title: "D" });
  });

  it("filters by a single tag", async () => {
    // ACT
    const response = await request(app)
      .get("/api/questions")
      .query({ tags: "javascript" });

    // ASSERT
    expect(titlesOf(response.body)).toEqual(["B", "A"]);
    expect(response.body.data.pagination.total).toBe(2);
  });

  it("match=any returns questions with at least one of the tags", async () => {
    // ACT
    const response = await request(app)
      .get("/api/questions")
      .query({ tags: "javascript,react", match: "any" });

    // ASSERT
    expect(titlesOf(response.body)).toEqual(["C", "B", "A"]);
    expect(response.body.data.pagination.total).toBe(3);
  });

  it("defaults to match=any", async () => {
    // ACT
    const response = await request(app)
      .get("/api/questions")
      .query({ tags: "javascript,react" });

    // ASSERT
    expect(titlesOf(response.body)).toEqual(["C", "B", "A"]);
  });

  it("match=all returns only questions with every tag", async () => {
    // ACT
    const response = await request(app)
      .get("/api/questions")
      .query({ tags: "javascript,react", match: "all" });

    // ASSERT
    expect(titlesOf(response.body)).toEqual(["A"]);
    expect(response.body.data.pagination.total).toBe(1);
  });

  it("match=any ignores unknown tags", async () => {
    // ACT
    const response = await request(app)
      .get("/api/questions")
      .query({ tags: "javascript,nope", match: "any" });

    // ASSERT
    expect(titlesOf(response.body)).toEqual(["B", "A"]);
  });

  it("match=all returns an empty list when a tag is unknown", async () => {
    // ACT
    const response = await request(app)
      .get("/api/questions")
      .query({ tags: "javascript,nope", match: "all" });

    // ASSERT
    expect(response.status).toBe(200);
    expect(response.body.data.list).toEqual([]);
    expect(response.body.data.pagination).toMatchObject({
      total: 0,
      totalPages: 0,
    });
  });

  it("normalizes case, spaces and duplicates in tags", async () => {
    // ACT
    const response = await request(app)
      .get("/api/questions")
      .query({ tags: " JavaScript, javascript,," });

    // ASSERT
    expect(titlesOf(response.body)).toEqual(["B", "A"]);
  });

  it("does not filter when tags is empty", async () => {
    // ACT
    const response = await request(app)
      .get("/api/questions")
      .query({ tags: "" });

    // ASSERT
    expect(response.body.data.pagination.total).toBe(4);
  });

  it("paginates the filtered set", async () => {
    // ACT
    const response = await request(app)
      .get("/api/questions")
      .query({ tags: "javascript,react", limit: 1, page: 2 });

    // ASSERT
    expect(titlesOf(response.body)).toEqual(["B"]);
    expect(response.body.data.pagination).toEqual({
      page: 2,
      limit: 1,
      total: 3,
      totalPages: 3,
    });
  });

  it("returns 400 for an invalid match value", async () => {
    // ACT
    const response = await request(app)
      .get("/api/questions")
      .query({ match: "bogus" });

    // ASSERT
    expect(response.status).toBe(400);
    expect(response.body.error.details[0].path).toBe("match");
  });

  it("returns 400 for more than 10 tags", async () => {
    // ARRANGE
    const tags = Array.from({ length: 11 }, (_, index) => `t${index}`).join(
      ",",
    );

    // ACT
    const response = await request(app).get("/api/questions").query({ tags });

    // ASSERT
    expect(response.status).toBe(400);
    expect(response.body.error.details[0].path).toBe("tags");
  });
});
