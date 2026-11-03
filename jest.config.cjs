module.exports = {
  transform: {
    // 151002: ts-jest warns about the node16 module kind, but compiles to CommonJS anyway
    "^.+\\.ts$": ["ts-jest", { diagnostics: { ignoreCodes: [151002] } }],
  },
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  setupFiles: ["<rootDir>/src/test/env.ts"],
  globalSetup: "<rootDir>/src/test/global-setup.ts",
  moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" },
  maxWorkers: 1,
};
