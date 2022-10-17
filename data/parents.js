const mongoCollections = require("../config/mongoCollection");
const uuid = require("uuid");
const validator = require("../helpers/validator");
const xss = require("xss");
const bcryptjs = require("bcryptjs");
const ErrorCode = require("../helpers/error-code");

const parents = mongoCollections.parents;

const SALT_ROUNDS = 16;

async function create(_firstName, _lastName, _email, _password) {
    try {
        validator.isSignUpTotalFieldsValid(arguments.length);

        const firstName = validator.isFirstNameValid(xss(_firstName));
        const lastName = validator.isLastNameValid(xss(_lastName));
        const email = validator.isEmailValid(xss(_email));
        const password = validator.isPasswordValid(xss(_password));

        const parentsCollection = await parents();

        const parent = await parentsCollection.findOne({ email: email });

        if (parent) {
            throwError(
                ErrorCode.BAD_REQUEST,
                "Error: Already registered with given email id."
            );
        }

        const passwordHash = await bcryptjs.hash(password, SALT_ROUNDS);

        const newParentId = uuid.v4();
        const verificationToken = uuid.v4();

        const newParent = {
            _id: newParentId,
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: passwordHash,
            isVerified: false,
            verificationToken: verificationToken,
            children: [],
        };

        const insertedInfo = await parentsCollection.insertOne(newParent);

        if (!insertedInfo.insertedId) {
            throwError(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "Error: Couldn't add parent."
            );
        }

        return await get(newParentId);
    } catch (error) {
        throwCatchError(error);
    }
}

async function get(_newParentId) {
    try {
        validator.isGetParentTotalFieldsValid(arguments.length);

        const parentId = validator.isParentIdValid(xss(_newParentId));

        const parentsCollection = await parents();

        const parent = await parentsCollection.findOne(
            { _id: parentId },
            {
                projection: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    isVerified: 1,
                    verificationToken: 1,
                },
            }
        );

        if (!parent) {
            throwError(ErrorCode.NOT_FOUND, "Error: Parent not found.");
        }

        return parent;
    } catch (error) {
        throwCatchError(error);
    }
}

module.exports = {
    create,
    get,
};
