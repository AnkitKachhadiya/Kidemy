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

test("Create account invalid first name: Just space", () => {
    return expect(
        parents.create("  ", "shah", "demo@de.com", "12345678")
    ).rejects.toEqual({
        code: 400,
        message:
            "Error: Empty string passed for First Name.",
    });
});

test("Create account invalid first name: Number", () => {
    return expect(
        parents.create(2345, "shah", "demo@de.com", "12345678")
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

test("Create account invalid last name: Just space", async () => {
    return expect(
        parents.create("john", "   ", "demo@de.com", "12345678")
    ).rejects.toEqual({
        code: 400,
        message:
            "Error: Empty string passed for Last Name.",
    });
});

test("Create account invalid last name: Number", async () => {
    return expect(
        parents.create("john", 213456, "demo@de.com", "12345678")
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

test("Create account invalid email: Just space", () => {
    return expect(
        parents.create("john", "doe", "   ", "12345678")
    ).rejects.toEqual({
        code: 400,
        message: "Error: Empty string passed for email.",
    });
});

test("Create account invalid email: Number", () => {
    return expect(
        parents.create("john", "doe", 1234, "12345678")
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

test("Create account invalid password: Just space", () => {
    return expect(
        parents.create("john", "doe", "demo@de.com", "    ")
    ).rejects.toEqual({
        code: 400,
        message:
            "Error: Empty string passed for password.",
    });
});

test("Create account invalid password: Number", () => {
    return expect(
        parents.create("john", "doe", "demo@de.com", 1236)
    ).rejects.toEqual({
        code: 400,
        message:
            "Error: Password should be of at least 8 characters long.",
    });
});

test("Create account invalid number of arguments", () => {
    return expect(parents.create()).rejects.toEqual({
        code: 400,
        message: "Error: You must supply all fields.",
    });
});


// ===================================== PARENT GET =====================================================================


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

test("Get parent account invalid input type: Only space", () => {
    return expect(parents.get("      ")).rejects.toEqual({
        code: 400,
        message: "Error: Empty string passed for parent id.",
    });
});

test("Get parent account invalid id: Special character", () => {
    return expect(parents.get("$%^&^%")).rejects.toEqual({
        code: 400,
        message: "Error: Invalid id.",
    });
});

test("Get parent account invalid id: Numbers", () => {
    return expect(parents.get(1234567)).rejects.toEqual({
        code: 400,
        message: "Error: Invalid id.",
    });
});

test("Get parent account invalid id: Object", () => {
    return expect(parents.get({"id":"esrydj34y354ygr"})).rejects.toEqual({
        code: 400,
        message: "Error: Invalid id.",
    });
});

test("Get parent account invalid number of arguments", () => {
    return expect(parents.get()).rejects.toEqual({
        code: 400,
        message: "Error: You must supply all fields.",
    });
});

//=============================================== CHECK PARENT =================================================

test("Check parent credentials for login invalid email", () => {
    return expect(
        parents.checkParent("defe.Ece.com", "1234556677")
    ).rejects.toEqual({
        code: 400,
        message: "Error: Email not valid.",
    });
});

test("Create account invalid email: Just space", () => {
    return expect(
        parents.checkParent("  ", "1234556677")
    ).rejects.toEqual({
        code: 400,
        message: "Error: Empty string passed for email.",
    });
});

test("Create account invalid email: Number", () => {
    return expect(
        parents.checkParent(12345, "1234556677")
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

test("Check parent credentials for login invalid password: Number", () => {
    return expect(
        parents.checkParent("demo@demo.com", 12312)
    ).rejects.toEqual({
        code: 400,
        message:
            "Error: Password should be of at least 8 characters long.",
    });
});

test("Check parent credentials for login invalid password: Just Space", () => {
    return expect(
        parents.checkParent("demo@demo.com", "  ")
    ).rejects.toEqual({
        code: 400,
        message:
            "Error: Empty string passed for password.",
    });
});

//================================================ Add Child =================================================


test("Get parent account invalid id", () => {
    return expect(parents.addChild("1241-2414153-","john", "shahvre", "demo@de.com", "12345678")).rejects.toEqual({
        code: 400,
        message: "Error: Invalid id.",
    });
});

test("Get parent account invalid input type", () => {
    return expect(parents.addChild([],"john", "shahvre", "demo@de.com", "12345678")).rejects.toEqual({
        code: 400,
        message: "Error: Empty string passed for parent id.",
    });
});

test("Get parent account invalid input type: Only space", () => {
    return expect(parents.addChild("      ","john", "shahvre", "demo@de.com", "12345678")).rejects.toEqual({
        code: 400,
        message: "Error: Empty string passed for parent id.",
    });
});

test("Get parent account invalid id: Special character", () => {
    return expect(parents.addChild("$%^&^%","john", "shahvre", "demo@de.com", "12345678")).rejects.toEqual({
        code: 400,
        message: "Error: Invalid id.",
    });
});

test("Get parent account invalid id: Numbers", () => {
    return expect(parents.addChild(1234567,"john", "shahvre", "demo@de.com", "12345678")).rejects.toEqual({
        code: 400,
        message: "Error: Invalid id.",
    });
});

test("Get parent account invalid id: Object", () => {
    return expect(parents.addChild({"id":"esrydj34y354ygr"},"john", "shahvre", "demo@de.com", "12345678")).rejects.toEqual({
        code: 400,
        message: "Error: Invalid id.",
    });
});

test("Get parent account invalid number of arguments", () => {
    return expect(parents.addChild()).rejects.toEqual({
        code: 400,
        message: "Error: Empty string passed for parent id.",
    });
});



