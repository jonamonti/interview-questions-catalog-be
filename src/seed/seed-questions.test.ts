import seedQuestions from "./seed-questions";
import { dummyQuestions } from "./dummy-questions";
import {
  createQuestionSchema,
  questionTitleSchema,
} from "../modules/question/schemas/create-question.schema";

const baseUrl = "http://localhost:3000";
const apiKey = "test-api-key";
const questions = dummyQuestions.slice(0, 3);

const jsonResponse = (body: unknown, status = 200) =>
  ({ ok: status < 400, status, json: async () => body }) as Response;

const listResponse = (titles: string[], totalPages = 1) =>
  jsonResponse({
    data: {
      pagination: { totalPages },
      list: titles.map((title) => ({ title })),
    },
  });

const fetchMock = jest.spyOn(global, "fetch");

beforeEach(() => jest.resetAllMocks());

describe("seedQuestions", () => {
  it("creates every question when none exist", async () => {
    // ARRANGE
    fetchMock
      .mockResolvedValueOnce(listResponse([]))
      .mockResolvedValue(jsonResponse({}, 201));

    // ACT
    const result = await seedQuestions({ baseUrl, apiKey, questions });

    // ASSERT
    expect(result).toEqual({ created: 3, skipped: 0 });
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock).toHaveBeenLastCalledWith(
      `${baseUrl}/api/questions`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-api-key": apiKey }),
        body: JSON.stringify(questions[2]),
      }),
    );
  });

  it("skips questions whose title already exists, across pages", async () => {
    // ARRANGE
    fetchMock
      .mockResolvedValueOnce(listResponse([questions[0].title], 2))
      .mockResolvedValueOnce(listResponse([questions[1].title], 2))
      .mockResolvedValue(jsonResponse({}, 201));

    // ACT
    const result = await seedQuestions({ baseUrl, apiKey, questions });

    // ASSERT
    expect(result).toEqual({ created: 1, skipped: 2 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("creates nothing when everything already exists", async () => {
    // ARRANGE
    fetchMock.mockResolvedValueOnce(
      listResponse(questions.map(({ title }) => title)),
    );

    // ACT
    const result = await seedQuestions({ baseUrl, apiKey, questions });

    // ASSERT
    expect(result).toEqual({ created: 0, skipped: 3 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws when the list request fails", async () => {
    // ARRANGE
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 500));

    // ACT & ASSERT
    await expect(seedQuestions({ baseUrl, apiKey, questions })).rejects.toThrow(
      "GET /api/questions failed with 500",
    );
  });

  it("throws with the title when a create request is rejected", async () => {
    // ARRANGE
    fetchMock
      .mockResolvedValueOnce(listResponse([]))
      .mockResolvedValueOnce(jsonResponse({}, 401));

    // ACT & ASSERT
    await expect(seedQuestions({ baseUrl, apiKey, questions })).rejects.toThrow(
      `POST /api/questions failed with 401 for "${questions[0].title}"`,
    );
  });
});

describe("dummyQuestions", () => {
  it.each(dummyQuestions.map((question) => [question.title, question]))(
    "is a valid create request: %s",
    (_title, question) => {
      // ACT
      const result = createQuestionSchema.safeParse(question);

      // ASSERT
      expect(result.success).toBe(true);
    },
  );

  it("has unique titles within the schema limit", () => {
    // ASSERT
    const titles = dummyQuestions.map(({ title }) => title);
    expect(new Set(titles).size).toBe(titles.length);
    titles.forEach((title) =>
      expect(questionTitleSchema.safeParse(title).success).toBe(true),
    );
  });
});
