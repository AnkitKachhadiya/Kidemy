const common = require("./common");

test("invalid argument for string argument", () => {
    expect(() => common.isArgumentString([])).toThrowError(
        Error(
            "Error: Invalid argument passed for provided variable. Expected string."
        )
    );
});

test("invalid argument for string argument", () => {
    expect(() => common.isArgumentString(1111)).toThrowError(
        Error(
            "Error: Invalid argument passed for provided variable. Expected string."
        )
    );
});

test("invalid argument for string argument", () => {
    expect(() => common.isArgumentString({})).toThrowError(
        Error(
            "Error: Invalid argument passed for provided variable. Expected string."
        )
    );
});

test("empty string", () => {
    expect(() => common.isStringEmpty("")).toThrowError(
        Error("Error: Empty string passed for provided variable.")
    );
});

test("invalid alpha space string", () => {
    expect(() =>
        common.isStringAlphaSpace("123123", "First name")
    ).toThrowError(
        Error(
            "Error: First name should have only alphabetical characters and/or spaces."
        )
    );
});

test("invalid alpha space string", () => {
    expect(() =>
        common.isStringAlphaSpace("wef34z34$#$%", "First name")
    ).toThrowError(
        Error(
            "Error: First name should have only alphabetical characters and/or spaces."
        )
    );
});

test("invalid alpha numeric string", () => {
    expect(() =>
        common.isStringAlphaNumeric("12312 3", "First name")
    ).toThrowError(
        Error("Error: First name should have only alphanumeric characters.")
    );
});

test("invalid alpha numeric string", () => {
    expect(() =>
        common.isStringAlphaNumeric("@#@2345235@#@#", "First name")
    ).toThrowError(
        Error("Error: First name should have only alphanumeric characters.")
    );
});

test("invalid non space string", () => {
    expect(() =>
        common.isNonSpaceString("ewgweg wegw wegwe", "First name")
    ).toThrowError(
        Error(
            "Error: First name should have only alphanumeric or special characters and no spaces."
        )
    );
});

test("invalid number", () => {
    expect(() => common.isNumberPositive(-1)).toThrowError(
        Error("Error: provided variable should be a positive number.")
    );
});
