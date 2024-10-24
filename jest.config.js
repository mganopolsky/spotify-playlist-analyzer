module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/test"], // Add this to specify the test folder
  testMatch: ["**/?(*.)+(spec|test).[tj]s?(x)"], // This will match any .test.ts or .spec.ts files
};
