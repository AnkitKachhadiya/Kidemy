const mongoCollections = require("../config/mongoCollection");
const uuid = require("uuid");
const validator = require("../helpers/validator");
const xss = require("xss");
const bcryptjs = require("bcryptjs");
const ErrorCode = require("../helpers/error-code");

const parents = mongoCollections.parents;

const coursesData = require("./courses");

const SALT_ROUNDS = 14;

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
                    children: 1,
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
            throwError(
                ErrorCode.BAD_REQUEST,
                "Error: Incorrect email or password."
            );
        }

        const isPasswordCorrect = await bcryptjs.compare(
            password,
            parent.password
        );

        if (!isPasswordCorrect) {
            throwError(
                ErrorCode.BAD_REQUEST,
                "Error: Incorrect email or password."
            );
        }

        delete parent.password;

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
            throwError(
                ErrorCode.NOT_FOUND,
                "Error: Invalid verification token"
            );
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

async function addChild(_parentId, _firstName, _lastName, _email, _password) {
    try {
        const parentId = validator.isParentIdValid(xss(_parentId));
        const firstName = validator.isFirstNameValid(xss(_firstName));
        const lastName = validator.isLastNameValid(xss(_lastName));
        const email = validator.isEmailValid(xss(_email));
        const password = validator.isPasswordValid(xss(_password));

        const parentsCollection = await parents();

        const user = await parentsCollection.findOne({
            $or: [
                { email: email },
                {
                    "children.email": email,
                },
            ],
        });

        if (user) {
            throwError(
                ErrorCode.BAD_REQUEST,
                "Error: Already registered with given email id."
            );
        }

        const passwordHash = await bcryptjs.hash(password, SALT_ROUNDS);

        const newChild = {
            _id: uuid.v4(),
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: passwordHash,
            courses: [],
        };

        const updatedInfo = await parentsCollection.updateOne(
            { _id: parentId },
            { $push: { children: newChild } }
        );

        if (updatedInfo.modifiedCount !== 1) {
            throwError(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "Error: Could not create child account."
            );
        }

        return { accountCreated: true };
    } catch (error) {
        throwCatchError(error);
    }
}

async function updateProfile(_parentId, _firstName, _lastName) {
    try {
        const parentId = validator.isParentIdValid(xss(_parentId));
        const firstName = validator.isFirstNameValid(xss(_firstName));
        const lastName = validator.isLastNameValid(xss(_lastName));

        const parentsCollection = await parents();

        const parent = await parentsCollection.findOne(
            { _id: parentId },
            {
                projection: {
                    _id: 1,
                },
            }
        );

        if (!parent) {
            throwError(ErrorCode.NOT_FOUND, "Error: Parent not found.");
        }

        const toBeUpdated = {
            firstName: firstName,
            lastName: lastName,
        };

        const updatedInfo = await parentsCollection.updateOne(
            { _id: parentId },
            { $set: toBeUpdated }
        );

        if (updatedInfo.modifiedCount !== 1) {
            throwError(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "Error: Could not update profile."
            );
        }

        return { profileUpdated: true };
    } catch (error) {
        throwCatchError(error);
    }
}

async function getChild(_parentId, _childId) {
    try {
        const parentId = validator.isParentIdValid(xss(_parentId));
        const childId = validator.isChildIdValid(xss(_childId));

        const parentsCollection = await parents();

        const childResult = await parentsCollection.findOne(
            { _id: parentId, "children._id": childId },
            {
                projection: {
                    _id: 0,
                    "children.$": 1,
                },
            }
        );

        if (!childResult) {
            throwError(ErrorCode.NOT_FOUND, "Error: Child not found.");
        }

        const [child] = childResult.children;

        return child;
    } catch (error) {
        throwCatchError(error);
    }
}

async function updateChild(_parentId, _childId, _firstName, _lastName) {
    try {
        const parentId = validator.isParentIdValid(xss(_parentId));
        const childId = validator.isChildIdValid(xss(_childId));
        const firstName = validator.isFirstNameValid(xss(_firstName));
        const lastName = validator.isLastNameValid(xss(_lastName));

        const toBeUpdated = {
            "children.$.firstName": firstName,
            "children.$.lastName": lastName,
        };

        const parentsCollection = await parents();

        const updatedInfo = await parentsCollection.updateOne(
            { _id: parentId, "children._id": childId },
            {
                $set: toBeUpdated,
            }
        );

        if (updatedInfo.modifiedCount !== 1) {
            throwError(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "Error: Could not update child."
            );
        }

        return { profileUpdated: true };
    } catch (error) {
        throwCatchError(error);
    }
}

async function getChildren(_parentId) {
    try {
        const parentId = validator.isParentIdValid(xss(_parentId));

        const parentsCollection = await parents();

        const children = await parentsCollection.findOne(
            { _id: parentId },
            {
                projection: {
                    _id: 1,
                    children: 1,
                },
            }
        );

        return children;
    } catch (error) {
        throwCatchError(error);
    }
}

async function assignCourse(parentId, childId, courseId) {
    const parentsCollection = await parents();

    const course = await coursesData.get(courseId);

    const updatedInfo = await parentsCollection.updateOne(
        { _id: parentId, "children._id": childId },
        { $push: { "children.$.courses": course } }
    );
}

async function getCoursesBy(_parentId, _childId) {
    try {
        const childId = xss(_childId);
        const parentId = xss(_parentId);

        const parentsCollection = await parents();

        const childData = await parentsCollection.findOne(
            { _id: parentId, "children._id": childId },
            {
                projection: {
                    _id: 1,
                    "children.$": 1,
                },
            }
        );

        const [child] = childData.children;

        return child.courses;
    } catch (error) {
        throwCatchError(error);
    }
}

async function updateCourseModule(
    _childId,
    _moduleId,
    _courseId,
    _moduleType,
    _quizUserAnswer
) {
    try {
        const moduleId = _moduleId;
        const courseId = xss(_courseId);
        const moduleType = xss(_moduleType);
        const quizUserAnswer = xss(_quizUserAnswer);
        const childId = xss(_childId);

        const parentsCollection = await parents();

        const toBeUpdated = {
            "children.$[i].courses.$[j].modules.$[k].isModuleCompleted": true,
        };

        if (moduleType === "quiz") {
            toBeUpdated["children.$[i].courses.$[j].modules.$[k].userAnswer"] =
                quizUserAnswer;
        }

        const updatedInfo = await parentsCollection.updateOne(
            {
                "children._id": childId,
                "children.courses._id": courseId,
                "children.courses.modules._id": moduleId,
            },
            {
                $set: toBeUpdated,
            },
            {
                arrayFilters: [
                    { "i._id": childId },
                    { "j._id": courseId },
                    { "k._id": moduleId },
                ],
            }
        );
    } catch (error) {
        throwCatchError(error);
    }
}

async function updateCourse(_childId, _courseId) {
    try {
        const childId = xss(_childId);
        const courseId = xss(_courseId);

        const parentsCollection = await parents();

        const toBeUpdated = {
            "children.$[i].courses.$[j].isCourseCompleted": true,
        };

        const updatedInfo = await parentsCollection.updateOne(
            {
                "children._id": childId,
                "children.courses._id": courseId,
            },
            {
                $set: toBeUpdated,
            },
            {
                arrayFilters: [{ "i._id": childId }, { "j._id": courseId }],
            }
        );
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
    create,
    get,
    checkParent,
    verifyEmail,
    addChild,
    updateProfile,
    getChild,
    updateChild,
    getChildren,
    assignCourse,
    getCoursesBy,
    updateCourseModule,
    updateCourse,
};
