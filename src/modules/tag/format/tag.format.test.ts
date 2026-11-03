import { formatTagWithCount } from "./tag.format";

describe("formatTagWithCount", () => {
  it("renames the Prisma count to questionCount", () => {
    // ACT & ASSERT
    expect(
      formatTagWithCount({
        id: 1,
        name: "javascript",
        slug: "javascript",
        _count: { questionTags: 4 },
      }),
    ).toEqual({
      id: 1,
      name: "javascript",
      slug: "javascript",
      questionCount: 4,
    });
  });
});
