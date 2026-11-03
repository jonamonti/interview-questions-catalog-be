import { prisma } from "../../../db";
import {
  createQuestion,
  deleteQuestion,
  updateQuestion,
} from "./question-write.repository";

jest.mock("../../../db", () => ({
  prisma: {
    question: { create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  },
}));

const connectOrCreate = (name: string, slug: string) => ({
  tag: { connectOrCreate: { where: { slug }, create: { name, slug } } },
});

const makeTx = () => ({
  question: { create: jest.fn(), update: jest.fn() },
});

beforeEach(() => jest.clearAllMocks());

describe("createQuestion", () => {
  it("creates the question with connectOrCreate links per tag", async () => {
    // ARRANGE
    const input = {
      title: "T",
      answer: "A",
      difficulty: "EASY" as const,
      tags: ["c++", "javascript"],
    };

    // ACT
    await createQuestion(input);

    // ASSERT
    expect(prisma.question.create).toHaveBeenCalledWith({
      data: {
        title: "T",
        answer: "A",
        difficulty: "EASY",
        questionTags: {
          create: [
            connectOrCreate("c++", "c-plus-plus"),
            connectOrCreate("javascript", "javascript"),
          ],
        },
      },
      include: expect.anything(),
    });
  });

  it("uses the transaction client when one is given", async () => {
    // ARRANGE
    const tx = makeTx();

    // ACT
    await createQuestion(
      { title: "T", answer: "A", difficulty: "EASY", tags: [] },
      tx as never,
    );

    // ASSERT
    expect(tx.question.create).toHaveBeenCalledTimes(1);
    expect(prisma.question.create).not.toHaveBeenCalled();
  });
});

describe("updateQuestion", () => {
  it("sends only the provided fields and leaves the tags alone without tags", async () => {
    // ACT
    await updateQuestion(3, { title: "New" });

    // ASSERT
    const { data, where } = jest.mocked(prisma.question.update).mock
      .calls[0][0];
    expect(where).toEqual({ id: 3 });
    expect(data).toMatchObject({ title: "New" });
    expect(data).not.toHaveProperty("questionTags");
  });

  it("replaces the tag links when tags are provided", async () => {
    // ACT
    await updateQuestion(3, { tags: ["react"] });

    // ASSERT
    const { data } = jest.mocked(prisma.question.update).mock.calls[0][0];
    expect(data.questionTags).toEqual({
      deleteMany: {},
      create: [connectOrCreate("react", "react")],
    });
  });

  it("clears the tag links for an empty list", async () => {
    // ACT
    await updateQuestion(3, { tags: [] });

    // ASSERT
    const { data } = jest.mocked(prisma.question.update).mock.calls[0][0];
    expect(data.questionTags).toEqual({ deleteMany: {}, create: [] });
  });

  it("bumps updatedAt so a tags-only change is visible", async () => {
    // ACT
    await updateQuestion(3, { tags: [] });

    // ASSERT
    const { data } = jest.mocked(prisma.question.update).mock.calls[0][0];
    expect(data.updatedAt).toBeInstanceOf(Date);
  });

  it("uses the transaction client when one is given", async () => {
    // ARRANGE
    const tx = makeTx();

    // ACT
    await updateQuestion(3, { title: "x" }, tx as never);

    // ASSERT
    expect(tx.question.update).toHaveBeenCalledTimes(1);
    expect(prisma.question.update).not.toHaveBeenCalled();
  });
});

describe("deleteQuestion", () => {
  it("deletes by id", async () => {
    // ACT
    await deleteQuestion(9);

    // ASSERT
    expect(prisma.question.delete).toHaveBeenCalledWith({ where: { id: 9 } });
  });
});
