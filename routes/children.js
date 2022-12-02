require("dotenv").config();
const express = require("express");
const validator = require("../helpers/validator");
const xss = require("xss");
const ErrorCode = require("../helpers/error-code");
const data = require("../data");
const nodemailer = require("nodemailer");

const childrenData = data.children;
const parentsData = data.parents;
const coursesData = data.courses;
const router = express.Router();

router.get("/", async (request, response) => {
    if (request.session.child) {
        return response.redirect("/children/dashboard");
    }

    response.render("children/login", { layout: false, pageTitle: "Login" });
});

router.post("/login", async (request, response) => {
    if (request.session.child) {
        return response.redirect("/children/dashboard");
    }

    try {
        const requestPostData = request.body;

        const email = validator.isEmailValid(xss(requestPostData.email));
        const password = validator.isPasswordValid(
            xss(requestPostData.password)
        );

        const child = await childrenData.checkChild(email, password);

        if (!child) {
            throwError(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "Internal Server Error"
            );
        }

        request.session.child = child;

        request.app.locals.isChildAuthenticated = true;
        request.app.locals.firstName = child.firstName;
        request.app.locals.lastName = child.lastName;

        response.json({ isError: false });
    } catch (error) {
        response.status(error.code || ErrorCode.INTERNAL_SERVER_ERROR).json({
            isError: true,
            error: error.message || "Error: Internal server error.",
        });
    }
});

router.get("/logout", async (request, response) => {
    const child = request.session.child;

    if (child) {
        delete request.session.child;
        request.app.locals.isChildAuthenticated = false;
        request.app.locals.firstName = undefined;
        request.app.locals.lastName = undefined;
    }

    response.redirect("/children");
});

router.get("/dashboard", async (request, response) => {
    if (!request.session.child) {
        return response.redirect("/children");
    }

    const courses = await parentsData.getCoursesBy(
        request.session.child.parentId,
        request.session.child._id
    );

    response.render("children/dashboard", {
        layout: false,
        pageTitle: "Dashboard",
        courses: courses,
    });
});

router.get("/myCourse/:id", async (request, response) => {
    if (!request.session.child) {
        return response.redirect("/children");
    }

    const courseId = xss(request.params.id);
    const childId = request.session.child._id;
    const course = await coursesData.getProgress(childId, courseId);

    const courseAnalytics = {
        totalVideos: 0,
        totalQuizzes: 0,
        totalCompleted: 0,
        progress: 0,
    };

    for (const currentModule of course.modules) {
        if (currentModule.type === "Video") {
            courseAnalytics.totalVideos++;
        }

        if (currentModule.type === "Quiz") {
            courseAnalytics.totalQuizzes++;
        }

        if (currentModule.isModuleCompleted === true) {
            courseAnalytics.totalCompleted++;
        }
    }

    courseAnalytics.totalModules = course.modules.length;

    courseAnalytics.progress = Math.round(
        (100 * courseAnalytics.totalCompleted) / courseAnalytics.totalModules
    );

    response.render("children/my-course", {
        layout: false,
        pageTitle: "Course",
        course: course,
        courseAnalytics: courseAnalytics,
    });
});

const throwError = (code = 500, message = "Error: Internal Server Error") => {
    throw { code, message };
};

module.exports = router;
