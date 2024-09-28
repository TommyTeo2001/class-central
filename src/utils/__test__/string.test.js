const camelize = require("../string").camelize;

describe("Camelize string", () => {
  it("should return camelized string", () => {
    const str = "hello world";
    const expected = "helloWorld";
    const result = camelize(str);
    expect(result).toEqual(expected);
  });
});
