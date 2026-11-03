import { createMockResponse } from "../../../test/mocks";
import deleteQuestionService from "../services/delete-question.service";
import deleteQuestionController from "./delete-question.controller";

jest.mock("../services/delete-question.service", () => ({
  __esModule: true,
  default: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

describe("deleteQuestionController", () => {
  it("responds 204 and ends the response without a body", async () => {
    // ARRANGE
    jest.mocked(deleteQuestionService).mockResolvedValue(undefined);
    const res = createMockResponse();

    // ACT
    await deleteQuestionController(
      { validated: { params: { id: 7 } } } as never,
      res as never,
      jest.fn(),
    );

    // ASSERT
    expect(deleteQuestionService).toHaveBeenCalledWith(7);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledWith();
    expect(res.json).not.toHaveBeenCalled();
  });
});
