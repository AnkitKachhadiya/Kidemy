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

test("Parent Id with valid uuid", () => {
    expect(
        validator.isParentIdValid("1831d360-5a82-455f-949c-4262cd908258")
    ).toBe("1831d360-5a82-455f-949c-4262cd908258");
});

test("Parent Id with valid uuid and spaces", () => {
    expect(
        validator.isParentIdValid("  339227aa-5c02-4bdc-8b2c-de975b2f2795   ")
    ).toBe("339227aa-5c02-4bdc-8b2c-de975b2f2795");
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

test("Child Id with valid uuid", () => {
    expect(
        validator.isChildIdValid("008036e8-755f-4c22-bc85-594d4922d1b9")
    ).toBe("008036e8-755f-4c22-bc85-594d4922d1b9");
});

test("verification token with invalid argument", () => {
    expect(() => validator.isVerificationTokenValid({})).toThrowError(
        Error(
            "Error: Invalid argument passed for verification token. Expected string."
        )
    );
});

test("verification token with invalid argument", () => {
    expect(() => validator.isVerificationTokenValid(12412414124)).toThrowError(
        Error(
            "Error: Invalid argument passed for verification token. Expected string."
        )
    );
});

test("verification token with empty string", () => {
    expect(() => validator.isVerificationTokenValid("")).toThrowError(
        Error("Error: Empty string passed for verification token.")
    );
});

test("verification token with invalid uuid", () => {
    expect(() => validator.isVerificationTokenValid("12412412")).toThrowError(
        Error("Error: Invalid id.")
    );
});

test("verification token with no argument", () => {
    expect(() => validator.isVerificationTokenValid()).toThrowError(
        Error(
            "Error: Invalid argument passed for verification token. Expected string."
        )
    );
});

test("verification token with valid uuid", () => {
    expect(
        validator.isVerificationTokenValid(
            "7a8bd861-6f51-47fb-bf1f-e32fb8153b72"
        )
    ).toBe("7a8bd861-6f51-47fb-bf1f-e32fb8153b72");
});

test("verification token with valid uuid and spaces", () => {
    expect(
        validator.isVerificationTokenValid(
            "   eb920b3e-0b91-44d0-8767-5211d34c8f2e  "
        )
    ).toBe("eb920b3e-0b91-44d0-8767-5211d34c8f2e");
});
