import { prisma } from "../../../db";
import {
  buildFormattedQuestion,
  buildQuestionRow,
} from "../../../test/factories";
import { createQuestion } from "../repositories/question-write.repository";
import createQuestionService from "./create-question.service";

jest.mock("../../../db", () => ({ prisma: { $transaction: jest.fn() } }));
jest.mock("../repositories/question-write.repository", () => ({
  createQuestion: jest.fn(),
}));

const input = {
  title: "T",
  answer: "A",
  difficulty: "EASY" as const,
  tags: [],
};

beforeEach(() => jest.clearAllMocks());

describe("createQuestionService", () => {
  it("creates the question inside a transaction and formats it", async () => {
    // ARRANGE
    const tx = {};
    (prisma.$transaction as jest.Mock).mockImplementation(
      (callback: (client: object) => unknown) => callback(tx),
    );
    jest.mocked(createQuestion).mockResolvedValue(buildQuestionRow() as never);

    // ACT
    const result = await createQuestionService(input);

    // ASSERT
    expect(createQuestion).toHaveBeenCalledWith(input, tx);
    expect(result).toEqual(buildFormattedQuestion());
  });

  it("propagates repository errors", async () => {
    // ARRANGE
    (prisma.$transaction as jest.Mock).mockRejectedValue(new Error("db down"));

    // ACT & ASSERT
    await expect(createQuestionService(input)).rejects.toThrow("db down");
  });
});
