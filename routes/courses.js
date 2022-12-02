require("dotenv").config();
const express = require("express");
const validator = require("../helpers/validator");
const xss = require("xss");
const ErrorCode = require("../helpers/error-code");
const data = require("../data");
const nodemailer = require("nodemailer");
const { assignCourse } = require("../data/parents");

const coursesData = data.courses;
const parentsData = data.parents;
const router = express.Router();

router.get("/", async (request, response) => {
    if (!request.session.parent) {
        return response.redirect("/parents");
    }

    if (!request.session.parent.isVerified) {
        return response.redirect("/parents/dashboard");
    }

    const courses = await coursesData.getAllCourses();

    response.render("courses/all", {
        pageTitle: "All Courses",
        courses: courses,
    });
});

router.get("/:id", async (request, response) => {
    if (!request.session.parent) {
        return response.redirect("/parents");
    }

    if (!request.session.parent.isVerified) {
        return response.redirect("/parents/dashboard");
    }

    const course = await coursesData.get(xss(request.params.id));

    const children = await parentsData.getChildren(request.session.parent._id);

    const nonAssignedChildren = getNonAssignedChildren(
        course._id,
        children.children
    );

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

    const assignCourse = request.app.locals.assignCourse;
    request.app.locals.assignCourse = undefined;

    response.render("courses/details", {
        pageTitle: "Course",
        course: course,
        courseAnalytics: courseAnalytics,
        assignCourse: assignCourse,
        isAssigneeAvailable: nonAssignedChildren.length > 0,
    });
});

function getNonAssignedChildren(courseId, children) {
    if (children.length < 1) {
        return [];
    }

    const nonAssignedChildren = [];

    for (currentChild of children) {
        const assignedCourse = currentChild.courses.find(
            (course) => course._id === courseId
        );

        if (assignedCourse) {
            continue;
        }

        const child = {
            _id: currentChild._id,
            firstName: currentChild.firstName,
            lastName: currentChild.lastName,
        };

        nonAssignedChildren.push(child);
    }

    return nonAssignedChildren;
}

router.post("/completeModule", async (request, response) => {
    try {
        if (!request.session.child) {
            return response.redirect("/children");
        }

        const requestPostData = request.body;

        const moduleId = requestPostData.moduleId;
        const courseId = xss(requestPostData.courseId);
        const moduleType = xss(requestPostData.moduleType);
        const quizUserAnswer = xss(requestPostData.quizUserAnswer);
        const childId = request.session.child._id;

        const module = await parentsData.updateCourseModule(
            childId,
            moduleId,
            courseId,
            moduleType,
            quizUserAnswer
        );

        const course = await coursesData.getProgress(childId, courseId);

        if (course.isCourseCompleted) {
            return response.json({ isError: false });
        }

        let isCourseCompleted = true;

        for (const currentModule of course.modules) {
            if (currentModule.isModuleCompleted) {
                continue;
            }

            isCourseCompleted = false;
        }

        if (isCourseCompleted) {
            await sendCourseCompletionEmail(
                request.session.child.parentFirstName,
                request.session.child.parentLastName,
                request.session.child.parentEmail,
                request.session.child.firstName,
                request.session.child.lastName,
                course.name
            );

            await parentsData.updateCourse(childId, courseId);
        }

        response.json({ isError: false });
    } catch (error) {
        response.status(error.code || ErrorCode.INTERNAL_SERVER_ERROR).json({
            isError: true,
            error: error.message || "Error: Internal server error.",
        });
    }
});

async function sendCourseCompletionEmail(
    parentFirstName,
    parentLastName,
    parentEmail,
    childFirstName,
    childLastName,
    courseName
) {
    const emailTemplate = `
    Hello <strong>${parentFirstName} ${parentLastName}</strong>,
    <br>
    <p>Congratulations!!! your child ${childFirstName} ${childLastName} has completed course ${courseName}.</p>
    <p>Team Kidemy</p>
    `;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.USER_GMAIL,
            pass: process.env.PASSWORD_GMAIL,
        },
    });

    const mailOptions = {
        from: process.env.USER_GMAIL,
        to: parentEmail,
        subject: "Kidemy: Course Completion",
        html: emailTemplate,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email Sent");
        }
    });
}

router.post("/search", async (request, response) => {
    if (!request.session.parent) {
        return response.redirect("/parents");
    }

    try {
        const requestPostData = request.body;

        const searchQuery = xss(requestPostData.searchQuery);

        const courses = await coursesData.searchCourses(searchQuery);

        response.json({ courses: courses });
    } catch (error) {
        response.status(error.code || ErrorCode.INTERNAL_SERVER_ERROR).json({
            isError: true,
            error: error.message || "Error: Internal server error.",
        });
    }
});

const throwError = (code = 500, message = "Error: Internal Server Error") => {
    throw { code, message };
};

module.exports = router;
