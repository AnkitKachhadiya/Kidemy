const mongoCollections = require("../config/mongoCollection");
const uuid = require("uuid");
const validator = require("../helpers/validator");
const xss = require("xss");
const ErrorCode = require("../helpers/error-code");

const courses = mongoCollections.courses;
const parents = mongoCollections.parents;

async function getAllCourses() {
    try {
        const coursesCollection = await courses();

        const allCourses = await coursesCollection.find({}).toArray();

        return allCourses;
    } catch (error) {
        throwCatchError(error);
    }
}

async function get(_courseId) {
    try {
        const courseId = xss(_courseId);

        const coursesCollection = await courses();

        const course = await coursesCollection.findOne({ _id: courseId });

        return course;
    } catch (error) {
        throwCatchError(error);
    }
}

async function getProgress(_childId, _courseId) {
    try {
        const courseId = xss(_courseId);
        const childId = xss(_childId);

        const parentsCollection = await parents();

        const childData = await parentsCollection.findOne(
            { "children._id": childId },
            {
                projection: {
                    _id: 0,
                    "children.$": 1,
                },
            }
        );

        const [child] = childData.children;

        for (const currentCourse of child.courses) {
            if (currentCourse._id === courseId) {
                return currentCourse;
            }
        }

        throwError(ErrorCode.NOT_FOUND, "Error: Course not found.");
    } catch (error) {
        throwCatchError(error);
    }
}

async function searchCourses(_searchQuery) {
    try {
        const searchQuery = xss(_searchQuery);

        const coursesCollection = await courses();

        const searchedCourses = await coursesCollection
            .find(
                {
                    $or: [
                        { name: new RegExp(searchQuery, "i") },
                        { description: new RegExp(searchQuery, "i") },
                    ],
                },
                { projection: { _id: 1, name: 1, imageUrl: 1 } }
            )
            .toArray();

        if (searchedCourses.length < 1) {
            throwError(ErrorCode.NOT_FOUND, "Error: Courses not found.");
        }

        return searchedCourses;
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
    getAllCourses,
    get,
    getProgress,
    searchCourses,
};
