const parents = require("./parents");

test("Create account invalid first name", () => {
  return expect(
    parents.create("sdg4tr4t4", "shah", "demo@de.com", "12345678")
  ).rejects.toEqual({
    code: 400,
    message:
      "Error: First Name should have only alphabetical characters and/or spaces.",
  });
});

test("Create account invalid last name", async () => {
  return expect(
    parents.create("john", "shahvre3434%$", "demo@de.com", "12345678")
  ).rejects.toEqual({
    code: 400,
    message:
      "Error: Last Name should have only alphabetical characters and/or spaces.",
  });
});

test("Create account invalid email", () => {
  return expect(
    parents.create("john", "doe", "demo@de#$#.com", "12345678")
  ).rejects.toEqual({
    code: 400,
    message: "Error: Email not valid.",
  });
});

test("Create account invalid password", () => {
  return expect(
    parents.create("john", "doe", "demo@de.com", "1236 78")
  ).rejects.toEqual({
    code: 400,
    message:
      "Error: Password should have only alphanumeric or special characters and no spaces.",
  });
});

test("Get parent account invalid id", () => {
  return expect(parents.get("1241-2414153-")).rejects.toEqual({
    code: 400,
    message: "Error: Invalid id.",
  });
});

test("Get parent account invalid input type", () => {
  return expect(parents.get([])).rejects.toEqual({
    code: 400,
    message: "Error: Empty string passed for parent id.",
  });
});

test("Check parent credentials for login invalid email", () => {
  return expect(
    parents.checkParent("defe.Ece.com", "1234556677")
  ).rejects.toEqual({
    code: 400,
    message: "Error: Email not valid.",
  });
});

test("Check parent credentials for login invalid password", () => {
  return expect(
    parents.checkParent("demo@demo.com", "12312 2536")
  ).rejects.toEqual({
    code: 400,
    message:
      "Error: Password should have only alphanumeric or special characters and no spaces.",
  });
});
