import { buildFormattedQuestion } from "../../../test/factories";
import { createMockResponse } from "../../../test/mocks";
import getQuestionService from "../services/get-question.service";
import getQuestionController from "./get-question.controller";

jest.mock("../services/get-question.service", () => ({
  __esModule: true,
  default: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

describe("getQuestionController", () => {
  it("responds 200 with the question", async () => {
    // ARRANGE
    const data = buildFormattedQuestion();
    jest.mocked(getQuestionService).mockResolvedValue(data);
    const res = createMockResponse();

    // ACT
    await getQuestionController(
      { validated: { params: { id: 7 } } } as never,
      res as never,
      jest.fn(),
    );

    // ASSERT
    expect(getQuestionService).toHaveBeenCalledWith(7);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Question retrieved successfully",
      data,
    });
  });
});
