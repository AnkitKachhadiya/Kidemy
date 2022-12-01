const mongoCollections = require("../config/mongoCollection");
const uuid = require("uuid");
const validator = require("../helpers/validator");
const xss = require("xss");
const bcryptjs = require("bcryptjs");
const ErrorCode = require("../helpers/error-code");

const parents = mongoCollections.parents;

const SALT_ROUNDS = 14;

async function checkChild(_email, _password) {
    try {
        const email = validator.isEmailValid(xss(_email));
        const password = validator.isPasswordValid(xss(_password));

        const parentsCollection = await parents();

        const childData = await parentsCollection.findOne(
            { "children.email": email },
            {
                projection: {
                    _id: 1,
                    email: 1,
                    firstName: 1,
                    lastName: 1,
                    "children.$": 1,
                },
            }
        );

        if (!childData) {
            throwError(
                ErrorCode.BAD_REQUEST,
                "Error: Incorrect email or password."
            );
        }

        const [child] = childData.children;

        child.parentEmail = childData.email;
        child.parentId = childData._id;
        child.parentFirstName = childData.firstName;
        child.parentLastName = childData.lastName;

        const isPasswordCorrect = await bcryptjs.compare(
            password,
            child.password
        );

        if (!isPasswordCorrect) {
            throwError(
                ErrorCode.BAD_REQUEST,
                "Error: Incorrect email or password."
            );
        }

        delete child.password;

        return child;
    } catch (error) {
        throwCatchError(error);
    }
}

const throwError = (code = 500, message = "Error: Internal Server Error") => {
    throw { code, message };
};

const throwCatchError = (error) => {
    if (error.code && error.message) {
        throwError(error.code, error.message);
    }

    throwError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "Error: Internal server error."
    );
};

module.exports = {
    checkChild,
};
