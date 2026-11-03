import { prisma } from "../../db";
import { createMockResponse } from "../../test/mocks";
import healthController from "./health.controller";

jest.mock("../../db", () => ({ prisma: { $queryRaw: jest.fn() } }));

beforeEach(() => jest.clearAllMocks());

describe("healthController", () => {
  it("responds 200 when the database answers", async () => {
    // ARRANGE
    jest.mocked(prisma.$queryRaw).mockResolvedValue([{ "?column?": 1 }]);
    const res = createMockResponse();

    // ACT
    await healthController({} as never, res as never, jest.fn());

    // ASSERT
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Service is healthy",
      data: { status: "ok", database: "connected" },
    });
  });

  it("responds 503 and stops when the database is unreachable", async () => {
    // ARRANGE
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    jest.mocked(prisma.$queryRaw).mockRejectedValue(new Error("down"));
    const res = createMockResponse();

    // ACT
    await healthController({} as never, res as never, jest.fn());

    // ASSERT
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Database is unreachable",
      error: { code: "SERVICE_UNAVAILABLE" },
    });
    consoleError.mockRestore();
  });
});
