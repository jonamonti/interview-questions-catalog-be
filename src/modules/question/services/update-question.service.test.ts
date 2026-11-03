import { prisma } from "../../../db";
import {
  buildFormattedQuestion,
  buildQuestionRow,
} from "../../../test/factories";
import { updateQuestion } from "../repositories/question-write.repository";
import updateQuestionService from "./update-question.service";

jest.mock("../../../db", () => ({ prisma: { $transaction: jest.fn() } }));
jest.mock("../repositories/question-write.repository", () => ({
  updateQuestion: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

describe("updateQuestionService", () => {
  it("updates inside a transaction and formats the result", async () => {
    // ARRANGE
    const tx = {};
    (prisma.$transaction as jest.Mock).mockImplementation(
      (callback: (client: object) => unknown) => callback(tx),
    );
    jest.mocked(updateQuestion).mockResolvedValue(buildQuestionRow() as never);

    // ACT
    const result = await updateQuestionService(1, { title: "New" });

    // ASSERT
    expect(updateQuestion).toHaveBeenCalledWith(1, { title: "New" }, tx);
    expect(result).toEqual(buildFormattedQuestion());
  });

  it("propagates not-found errors from the repository", async () => {
    // ARRANGE
    (prisma.$transaction as jest.Mock).mockRejectedValue(new Error("P2025"));

    // ACT & ASSERT
    await expect(updateQuestionService(1, { title: "x" })).rejects.toThrow(
      "P2025",
    );
  });
});
