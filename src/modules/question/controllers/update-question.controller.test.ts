import { buildFormattedQuestion } from "../../../test/factories";
import { createMockResponse } from "../../../test/mocks";
import updateQuestionService from "../services/update-question.service";
import updateQuestionController from "./update-question.controller";

jest.mock("../services/update-question.service", () => ({
  __esModule: true,
  default: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

describe("updateQuestionController", () => {
  it("responds 200 with the updated question", async () => {
    // ARRANGE
    const data = buildFormattedQuestion();
    jest.mocked(updateQuestionService).mockResolvedValue(data);
    const res = createMockResponse();

    // ACT
    await updateQuestionController(
      { validated: { params: { id: 7 }, body: { title: "New" } } } as never,
      res as never,
      jest.fn(),
    );

    // ASSERT
    expect(updateQuestionService).toHaveBeenCalledWith(7, { title: "New" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Question updated successfully",
      data,
    });
  });
});
