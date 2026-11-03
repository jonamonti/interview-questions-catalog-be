import { buildFormattedQuestion } from "../../../test/factories";
import { createMockResponse } from "../../../test/mocks";
import createQuestionService from "../services/create-question.service";
import createQuestionController from "./create-question.controller";

jest.mock("../services/create-question.service", () => ({
  __esModule: true,
  default: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

describe("createQuestionController", () => {
  it("responds 201 with the created question", async () => {
    // ARRANGE
    const input = { title: "T" };
    const data = buildFormattedQuestion();
    jest.mocked(createQuestionService).mockResolvedValue(data as never);
    const res = createMockResponse();

    // ACT
    await createQuestionController(
      { validated: { body: input } } as never,
      res as never,
      jest.fn(),
    );

    // ASSERT
    expect(createQuestionService).toHaveBeenCalledWith(input);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Question created successfully",
      data,
    });
  });

  it("rejects when the service fails, so Express can forward the error", async () => {
    // ARRANGE
    jest.mocked(createQuestionService).mockRejectedValue(new Error("boom"));

    // ACT & ASSERT
    await expect(
      createQuestionController(
        { validated: { body: {} } } as never,
        createMockResponse() as never,
        jest.fn(),
      ),
    ).rejects.toThrow("boom");
  });
});
