import {
  buildFormattedQuestion,
  buildQuestionRow,
} from "../../../test/factories";
import {
  countQuestions,
  findQuestions,
} from "../repositories/question-read.repository";
import listQuestionsService from "./list-questions.service";

jest.mock("../repositories/question-read.repository", () => ({
  findQuestions: jest.fn(),
  countQuestions: jest.fn(),
}));

const query = { page: 3, limit: 5, tags: ["js"], match: "all" as const };

beforeEach(() => jest.clearAllMocks());

describe("listQuestionsService", () => {
  it("passes pagination and the same filter to the list and the count", async () => {
    // ARRANGE
    jest.mocked(findQuestions).mockResolvedValue([] as never);
    jest.mocked(countQuestions).mockResolvedValue(0);

    // ACT
    await listQuestionsService(query);

    // ASSERT
    const filter = { tags: ["js"], match: "all" };
    expect(findQuestions).toHaveBeenCalledWith({ skip: 10, take: 5, filter });
    expect(countQuestions).toHaveBeenCalledWith(filter);
  });

  it("builds the pagination meta from the filtered total", async () => {
    // ARRANGE
    jest.mocked(findQuestions).mockResolvedValue([buildQuestionRow()] as never);
    jest.mocked(countQuestions).mockResolvedValue(11);

    // ACT
    const result = await listQuestionsService(query);

    // ASSERT
    expect(result).toEqual({
      pagination: { page: 3, limit: 5, total: 11, totalPages: 3 },
      list: [buildFormattedQuestion()],
    });
  });

  it("reports zero pages for an empty result", async () => {
    // ARRANGE
    jest.mocked(findQuestions).mockResolvedValue([] as never);
    jest.mocked(countQuestions).mockResolvedValue(0);

    // ACT
    const result = await listQuestionsService(query);

    // ASSERT
    expect(result.pagination.totalPages).toBe(0);
    expect(result.list).toEqual([]);
  });
});
