import {
  buildFormattedQuestion,
  buildQuestionRow,
} from "../../../test/factories";
import { findQuestionById } from "../repositories/question-read.repository";
import getQuestionService from "./get-question.service";

jest.mock("../repositories/question-read.repository", () => ({
  findQuestionById: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

describe("getQuestionService", () => {
  it("returns the formatted question", async () => {
    // ARRANGE
    jest
      .mocked(findQuestionById)
      .mockResolvedValue(buildQuestionRow() as never);

    // ACT
    const result = await getQuestionService(1);

    // ASSERT
    expect(findQuestionById).toHaveBeenCalledWith(1);
    expect(result).toEqual(buildFormattedQuestion());
  });

  it("propagates not-found errors", async () => {
    // ARRANGE
    jest.mocked(findQuestionById).mockRejectedValue(new Error("P2025"));

    // ACT & ASSERT
    await expect(getQuestionService(1)).rejects.toThrow("P2025");
  });
});
