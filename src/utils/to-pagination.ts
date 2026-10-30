import type { PaginationQuery } from "../common/schemas/pagination.schema";

const toPagination = ({ page, limit }: PaginationQuery) => ({
  skip: (page - 1) * limit,
  take: limit,
});

export default toPagination;
