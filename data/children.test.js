const children = require("./children");

test("child login empty password and email", () => {
    return expect(children.checkChild("", "")).rejects.toEqual({
        code: 400,
        message: "Error: Empty string passed for email.",
    });
});

test("child login invalid email", () => {
    return expect(
        children.checkChild("asda@sdfsdf", "1231241414")
    ).rejects.toEqual({
        code: 400,
        message: "Error: Email not valid.",
    });
});

test("child login invalid email argument", () => {
    return expect(children.checkChild(141124, "1231241414")).rejects.toEqual({
        code: 400,
        message: "Error: Email not valid.",
    });
});

test("child login invalid email argument", () => {
    return expect(children.checkChild([], "1231241414")).rejects.toEqual({
        code: 400,
        message: "Error: Empty string passed for email.",
    });
});

test("child login invalid password", () => {
    return expect(
        children.checkChild("demo@demo.com", "23 234")
    ).rejects.toEqual({
        code: 400,
        message:
            "Error: Password should have only alphanumeric or special characters and no spaces.",
    });
});

test("child login invalid password length", () => {
    return expect(
        children.checkChild("demo@demo.com", "23234")
    ).rejects.toEqual({
        code: 400,
        message: "Error: Password should be of at least 8 characters long.",
    });
});

test("child login invalid password argument", () => {
    return expect(children.checkChild("demo@demo.com", {})).rejects.toEqual({
        code: 400,
        message:
            "Error: Password should have only alphanumeric or special characters and no spaces.",
    });
});
