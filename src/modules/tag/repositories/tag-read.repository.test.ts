import { prisma } from "../../../db";
import { findTagsWithQuestionCount } from "./tag-read.repository";

jest.mock("../../../db", () => ({
  prisma: { tag: { findMany: jest.fn() } },
}));

beforeEach(() => jest.clearAllMocks());

describe("findTagsWithQuestionCount", () => {
  it("selects tags in use, sorted by name, with the question count", async () => {
    // ARRANGE
    const rows = [{ id: 1 }];
    jest.mocked(prisma.tag.findMany).mockResolvedValue(rows as never);

    // ACT
    const result = await findTagsWithQuestionCount();

    // ASSERT
    expect(result).toBe(rows);
    expect(prisma.tag.findMany).toHaveBeenCalledWith({
      where: { questionTags: { some: {} } },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { questionTags: true } },
      },
    });
  });
});
