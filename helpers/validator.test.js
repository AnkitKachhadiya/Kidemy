const validator = require("./validator");

test("First name validation with white spaces both sides", () => {
    expect(validator.isFirstNameValid(" Yash Suhas ")).toBe("Yash Suhas");
});

test("First name validation with white spaces at end", () => {
    expect(validator.isFirstNameValid("Jethalal ")).toBe("Jethalal");
});

test("First name validation with invalid characters", () => {
    expect(() => validator.isFirstNameValid("ASAwe3425")).toThrowError(
        Error(
            "Error: First Name should have only alphabetical characters and/or spaces."
        )
    );
});

test("Last name validation with white spaces at end", () => {
    expect(validator.isLastNameValid("Shah   ")).toBe("Shah");
});

test("Last name validation with white spaces at front", () => {
    expect(validator.isLastNameValid("  Lal")).toBe("Lal");
});

test("Last name validation with invalid characters", () => {
    expect(() => validator.isLastNameValid("esvr#@F# 32f23")).toThrowError(
        Error(
            "Error: Last Name should have only alphabetical characters and/or spaces."
        )
    );
});

test("Email id validation with white spaces at end", () => {
    expect(validator.isEmailValid("asfasf@efweg.wegw ")).toBe(
        "asfasf@efweg.wegw"
    );
});

test("Email id validation with white spaces at front", () => {
    expect(validator.isEmailValid(" nice@gmail.com")).toBe("nice@gmail.com");
});

test("Email id validation with invalid characters", () => {
    expect(() => validator.isEmailValid("nice@gma#$il.com")).toThrowError(
        Error("Error: Email not valid.")
    );
});

test("Password validation with valid password", () => {
    expect(validator.isPasswordValid("12345678")).toBe("12345678");
});

test("Password validation with invalid length", () => {
    expect(() => validator.isPasswordValid("1234567")).toThrowError(
        Error("Error: Password should be of at least 8 characters long.")
    );
});

test("Password validation with spaces", () => {
    expect(() => validator.isPasswordValid("1234 sd567")).toThrowError(
        Error(
            "Error: Password should have only alphanumeric or special characters and no spaces."
        )
    );
});

test("Parent Id with empty string", () => {
    expect(() => validator.isParentIdValid(" ")).toThrowError(
        Error("Error: Empty string passed for parent id.")
    );
});

test("Child Id with invalid input type", () => {
    expect(() => validator.isChildIdValid([])).toThrowError(
        Error("Error: Invalid argument passed for child id. Expected string.")
    );
});

test("Child Id with invalid uuid", () => {
    expect(() => validator.isChildIdValid("2352-2352efw")).toThrowError(
        Error("Error: Invalid id.")
    );
});
