import { deleteQuestion } from "../repositories/question-write.repository";
import deleteQuestionService from "./delete-question.service";

jest.mock("../repositories/question-write.repository", () => ({
  deleteQuestion: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

describe("deleteQuestionService", () => {
  it("deletes the question by id and returns nothing", async () => {
    // ARRANGE
    jest.mocked(deleteQuestion).mockResolvedValue({} as never);

    // ACT
    const result = await deleteQuestionService(4);

    // ASSERT
    expect(deleteQuestion).toHaveBeenCalledWith(4);
    expect(result).toBeUndefined();
  });

  it("propagates repository errors", async () => {
    // ARRANGE
    jest.mocked(deleteQuestion).mockRejectedValue(new Error("P2025"));

    // ACT & ASSERT
    await expect(deleteQuestionService(4)).rejects.toThrow("P2025");
  });
});
