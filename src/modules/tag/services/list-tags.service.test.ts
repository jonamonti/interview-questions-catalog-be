import { findTagsWithQuestionCount } from "../repositories/tag-read.repository";
import listTagsService from "./list-tags.service";

jest.mock("../repositories/tag-read.repository", () => ({
  findTagsWithQuestionCount: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

describe("listTagsService", () => {
  it("wraps the formatted tags in a list", async () => {
    // ARRANGE
    jest
      .mocked(findTagsWithQuestionCount)
      .mockResolvedValue([
        { id: 1, name: "js", slug: "js", _count: { questionTags: 2 } },
      ] as never);

    // ACT
    const result = await listTagsService();

    // ASSERT
    expect(result).toEqual({
      list: [{ id: 1, name: "js", slug: "js", questionCount: 2 }],
    });
  });

  it("returns an empty list when there are no tags", async () => {
    // ARRANGE
    jest.mocked(findTagsWithQuestionCount).mockResolvedValue([]);

    // ACT & ASSERT
    expect(await listTagsService()).toEqual({ list: [] });
  });
});
