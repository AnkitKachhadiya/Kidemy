const mongoCollections = require("../config/mongoCollection");
const uuid = require("uuid");
const validator = require("../helpers/validator");
const xss = require("xss");
const ErrorCode = require("../helpers/error-code");

const courses = mongoCollections.courses;

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

const throwError = (code = 500, message = "Error: Internal Server Error") => {
  throw { code, message };
};

const throwCatchError = (error) => {
  if (error.code && error.message) {
    throwError(error.code, error.message);
  }

  throwError(ErrorCode.INTERNAL_SERVER_ERROR, "Error: Internal server error.");
};

module.exports = {
  getAllCourses,
  get,
};
