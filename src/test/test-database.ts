export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/interview_catalog_test";

export const assertTestDatabase = (url: string) => {
  const name = new URL(url).pathname.slice(1);
  if (!name.endsWith("_test")) {
    throw new Error(`Refusing to run tests on database "${name}"`);
  }
};
