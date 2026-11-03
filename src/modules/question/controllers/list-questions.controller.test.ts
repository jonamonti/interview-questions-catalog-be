import { createMockResponse } from "../../../test/mocks";
import listQuestionsService from "../services/list-questions.service";
import listQuestionsController from "./list-questions.controller";

jest.mock("../services/list-questions.service", () => ({
  __esModule: true,
  default: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

describe("listQuestionsController", () => {
  it("responds 200 with the page of questions", async () => {
    // ARRANGE
    const query = { page: 1, limit: 10, tags: [], match: "any" };
    const data = {
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      list: [],
    };
    jest.mocked(listQuestionsService).mockResolvedValue(data);
    const res = createMockResponse();

    // ACT
    await listQuestionsController(
      { validated: { query } } as never,
      res as never,
      jest.fn(),
    );

    // ASSERT
    expect(listQuestionsService).toHaveBeenCalledWith(query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Questions retrieved successfully",
      data,
    });
  });
});
