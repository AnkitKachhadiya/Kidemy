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

async function verifyEmail(_parentId, _verificationToken) {
  try {
    const parentId = validator.isParentIdValid(xss(_parentId));
    const verificationToken = validator.isVerificationTokenValid(
      xss(_verificationToken)
    );

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

    if (parent.verificationToken !== verificationToken) {
      throwError(ErrorCode.NOT_FOUND, "Error: Invalid verification token");
    }

    if (parent.isVerified) {
      return { parentVerified: true };
    }

    const toBeUpdated = {
      isVerified: true,
    };

    const updatedInfo = await parentsCollection.updateOne(
      { _id: parentId },
      { $set: toBeUpdated }
    );

    if (updatedInfo.modifiedCount !== 1) {
      throwError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "Error: Could not verify parent."
      );
    }

    return { parentVerified: true };
  } catch (error) {
    throwCatchError(error);
  }
}

async function checkParent(_email, _password) {
  try {
    validator.isCheckParentTotalFieldsValid(arguments.length);

    const email = validator.isEmailValid(xss(_email));
    const password = validator.isPasswordValid(xss(_password));

    const parentsCollection = await parents();

    const parent = await parentsCollection.findOne(
      { email: email },
      {
        projection: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          password: 1,
          isVerified: 1,
          verificationToken: 1,
        },
      }
    );

    if (!parent) {
      throwError(ErrorCode.BAD_REQUEST, "Error: Incorrect email or password.");
    }

    const isPasswordCorrect = await bcryptjs.compare(password, parent.password);

    if (!isPasswordCorrect) {
      throwError(ErrorCode.BAD_REQUEST, "Error: Incorrect email or password.");
    }

    delete parent.password;

    return parent;
  } catch (error) {
    throwCatchError(error);
  }
}

module.exports = {
  create,
  get,
  verifyEmail,
  checkParent,
};
