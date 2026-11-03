import { prisma } from "../../../db";
import {
  countQuestions,
  findQuestionById,
  findQuestions,
} from "./question-read.repository";

jest.mock("../../../db", () => ({
  prisma: {
    question: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirstOrThrow: jest.fn(),
    },
  },
}));

const paging = { skip: 10, take: 5 };
const noFilter = { tags: [], match: "any" as const };

beforeEach(() => jest.clearAllMocks());

describe("findQuestions", () => {
  it("applies pagination, ordering and the tags include without a filter", async () => {
    // ARRANGE
    jest.mocked(prisma.question.findMany).mockResolvedValue([] as never);

    // ACT
    await findQuestions({ ...paging, filter: noFilter });

    // ASSERT
    expect(prisma.question.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 10,
      take: 5,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: expect.objectContaining({ questionTags: expect.anything() }),
    });
  });

  it("matches any of the tags with a single in-filter", async () => {
    // ARRANGE
    jest.mocked(prisma.question.findMany).mockResolvedValue([] as never);

    // ACT
    await findQuestions({
      ...paging,
      filter: { tags: ["js", "react"], match: "any" },
    });

    // ASSERT
    expect(prisma.question.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          questionTags: { some: { tag: { slug: { in: ["js", "react"] } } } },
        },
      }),
    );
  });

  it("requires every tag with one condition per slug when matching all", async () => {
    // ARRANGE
    jest.mocked(prisma.question.findMany).mockResolvedValue([] as never);

    // ACT
    await findQuestions({
      ...paging,
      filter: { tags: ["js", "react"], match: "all" },
    });

    // ASSERT
    expect(prisma.question.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            { questionTags: { some: { tag: { slug: "js" } } } },
            { questionTags: { some: { tag: { slug: "react" } } } },
          ],
        },
      }),
    );
  });
});

describe("countQuestions", () => {
  it("counts with the same where as the list", async () => {
    // ARRANGE
    jest.mocked(prisma.question.count).mockResolvedValue(3);

    // ACT
    const total = await countQuestions({ tags: ["js"], match: "any" });

    // ASSERT
    expect(total).toBe(3);
    expect(prisma.question.count).toHaveBeenCalledWith({
      where: { questionTags: { some: { tag: { slug: { in: ["js"] } } } } },
    });
  });

  it("counts everything without a filter", async () => {
    // ARRANGE
    jest.mocked(prisma.question.count).mockResolvedValue(9);

    // ACT
    await countQuestions(noFilter);

    // ASSERT
    expect(prisma.question.count).toHaveBeenCalledWith({ where: {} });
  });
});

describe("findQuestionById", () => {
  it("looks the question up by id with its tags", async () => {
    // ARRANGE
    const row = { id: 7 };
    jest
      .mocked(prisma.question.findFirstOrThrow)
      .mockResolvedValue(row as never);

    // ACT
    const result = await findQuestionById(7);

    // ASSERT
    expect(result).toBe(row);
    expect(prisma.question.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: 7 },
      include: expect.objectContaining({ questionTags: expect.anything() }),
    });
  });
});
