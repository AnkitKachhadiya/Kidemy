require("dotenv").config();
const express = require("express");
const validator = require("../helpers/validator");
const xss = require("xss");
const ErrorCode = require("../helpers/error-code");
const data = require("../data");

const coursesData = data.courses;
const parentsData = data.parents;
const router = express.Router();

router.get("/", async (request, response) => {
    const courses = await coursesData.getAllCourses();

    response.render("courses/all", {
        pageTitle: "All Courses",
        courses: courses,
    });
});

router.get("/:id", async (request, response) => {
    const course = await coursesData.get(xss(request.params.id));

    const courseAnalytics = {
        totalVideos: 0,
        totalQuizzes: 0,
    };

    for (const currentModule of course.modules) {
        if (currentModule.type === "Video") {
            courseAnalytics.totalVideos++;
        }

        if (currentModule.type === "Quiz") {
            courseAnalytics.totalQuizzes++;
        }
    }

    courseAnalytics.totalModules = course.modules.length;

    response.render("courses/details", {
        pageTitle: "Course",
        course: course,
        courseAnalytics: courseAnalytics,
    });
});

module.exports = router;
