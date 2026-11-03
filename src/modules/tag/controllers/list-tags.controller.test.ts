import { createMockResponse } from "../../../test/mocks";
import listTagsService from "../services/list-tags.service";
import listTagsController from "./list-tags.controller";

jest.mock("../services/list-tags.service", () => ({
  __esModule: true,
  default: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

describe("listTagsController", () => {
  it("responds 200 with the tag list", async () => {
    // ARRANGE
    const data = {
      list: [{ id: 1, name: "js", slug: "js", questionCount: 2 }],
    };
    jest.mocked(listTagsService).mockResolvedValue(data);
    const res = createMockResponse();

    // ACT
    await listTagsController({} as never, res as never, jest.fn());

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Tags retrieved successfully",
      data,
    });
  });
});
