require("dotenv").config();
const express = require("express");
const validator = require("../helpers/validator");
const xss = require("xss");
const ErrorCode = require("../helpers/error-code");
const data = require("../data");
const nodemailer = require("nodemailer");

const parentsData = data.parents;
const router = express.Router();

//login form
router.get("/", async (request, response) => {
    if (request.session.parent) {
        return response.redirect("/");
    }

    const signedUpFlashMessage = request.app.locals.isSignedUp
        ? request.app.locals.signedUpFlashMessage
        : false;

    request.app.locals.isSignedUp = undefined;
    request.app.locals.signedUpFlashMessage = undefined;

    response.render("parents/login", {
        pageTitle: "Login",
        signedUpFlashMessage: signedUpFlashMessage,
    });
});

//signup form
router.get("/signup", async (request, response) => {
    if (request.session.parent) {
        return response.redirect("/");
    }

    response.render("parents/sign-up", { pageTitle: "Sign-up" });
});

//signup submit
router.post("/signup", async (request, response) => {
    if (request.session.parent) {
        return response.redirect("/");
    }

    try {
        const requestPostData = request.body;

        validator.isSignUpTotalFieldsValid(Object.keys(requestPostData).length);

        const firstName = validator.isFirstNameValid(
            xss(requestPostData.firstName)
        );
        const lastName = validator.isLastNameValid(
            xss(requestPostData.lastName)
        );
        const email = validator.isEmailValid(xss(requestPostData.email));
        const password = validator.isPasswordValid(
            xss(requestPostData.password)
        );

        const parent = await parentsData.create(
            firstName,
            lastName,
            email,
            password
        );

        if (!parent) {
            throwError(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "Internal Server Error"
            );
        }

        request.app.locals.isSignedUp = true;
        request.app.locals.signedUpFlashMessage =
            "Signed up successfully. Login to start using Kidemy.";

        response.json({ isError: false });
    } catch (error) {
        response.status(error.code || ErrorCode.INTERNAL_SERVER_ERROR).json({
            isError: true,
            error: error.message || "Error: Internal server error.",
        });
    }
});

//login submit
router.post("/login", async (request, response) => {
    if (request.session.parent) {
        return response.redirect("/");
    }

    try {
        const requestPostData = request.body;

        validator.isLoginTotalFieldsValid(Object.keys(requestPostData).length);

        const email = validator.isEmailValid(xss(requestPostData.email));
        const password = validator.isPasswordValid(
            xss(requestPostData.password)
        );

        const parent = await parentsData.checkParent(email, password);

        if (!parent) {
            throwError(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "Internal Server Error"
            );
        }

        request.session.parent = parent;

        request.app.locals.isParentAuthenticated = true;

        response.json({ isError: false });
    } catch (error) {
        response.status(error.code || ErrorCode.INTERNAL_SERVER_ERROR).json({
            isError: true,
            error: error.message || "Error: Internal server error.",
        });
    }
});

//logout
router.get("/logout", async (request, response) => {
    const parent = request.session.parent;

    if (parent) {
        delete request.session.parent;
        request.app.locals.isParentAuthenticated = false;
    }

    response.redirect("/parents");
});

//dashboard view
router.get("/dashboard", async (request, response) => {
    if (!request.session.parent) {
        return response.redirect("/parents");
    }

    const parent = await parentsData.get(request.session.parent._id);

    const addChildFlashMessage = request.app.locals.addChildFlashMessage;
    const editChildFlashMessage = request.app.locals.editChildFlashMessage;
    const editChildError = request.app.locals.editChildError;

    request.app.locals.addChildFlashMessage = undefined;
    request.app.locals.editChildFlashMessage = undefined;
    request.app.locals.editChildError = undefined;

    response.render("parents/dashboard", {
        pageTitle: "Dashboard",
        parentEmail: parent.email,
        isVerified: parent.isVerified,
        children: parent.children,
        addChildFlashMessage: addChildFlashMessage,
        editChildFlashMessage: editChildFlashMessage,
        editChildError: editChildError,
    });
});

router.get(
    "/verifyEmail/:parentId&:verificationToken",
    async (request, response) => {
        try {
            const parentId = validator.isParentIdValid(
                xss(request.params.parentId)
            );
            const verificationToken = validator.isVerificationTokenValid(
                xss(request.params.verificationToken)
            );

            const verification = await parentsData.verifyEmail(
                parentId,
                verificationToken
            );

            if (!verification.parentVerified) {
                throwError(
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    "Internal Server Error"
                );
            }

            if (request.session.parent) {
                request.session.parent.isVerified = true;
            }

            response.render("parents/email-verification", {
                pageTitle: "Email Verification",
                isError: false,
            });
        } catch (error) {
            response
                .status(error.code || ErrorCode.INTERNAL_SERVER_ERROR)
                .render("parents/email-verification", {
                    pageTitle: "Email Verification",
                    isError: true,
                    error: error.message || "Internal Server Error",
                });
        }
    }
);

//sending verification email
router.post("/sendVerificationEmail", async (request, response) => {
    if (!request.session.parent) {
        return response.redirect("/");
    }

    try {
        const parent = await parentsData.get(request.session.parent._id);

        if (!parent) {
            throwError(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "Internal Server Error"
            );
        }

        if (parent.isVerified) {
            return response.redirect("/");
        }

        const emailTemplate = `
        Hello <strong>${parent.firstName} ${parent.lastName}</strong>,
        <br>
        <p>We're happy you signed up for Kidemy. To start exploring the Kidemy, please confirm your email address.</p>
        <a href="http://localhost:3000/parents/verifyEmail/${parent._id}&${parent.verificationToken}" target="_blank">Verify Email</a>
        <p>Welcome to Kidemy! <br> The Kidemy Team</p>
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
            to: parent.email,
            subject: "Kidemy account verification email",
            html: emailTemplate,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email Sent");
            }
        });

        response.json({ isError: false });
    } catch (error) {
        response.status(error.code || ErrorCode.INTERNAL_SERVER_ERROR).json({
            isError: true,
            error: error.message || "Error: Internal server error.",
        });
    }
});

router.get("/addChild", async (request, response) => {
    if (!request.session.parent) {
        return response.redirect("/");
    }

    if (!request.session.parent.isVerified) {
        return response.redirect("/parents/dashboard");
    }

    response.render("parents/addChild", {
        pageTitle: "Add Child",
    });
});

router.post("/addChild", async (request, response) => {
    if (!request.session.parent) {
        return response.redirect("/");
    }

    if (!request.session.parent.isVerified) {
        return response.redirect("/parents/dashboard");
    }

    try {
        const requestPostData = request.body;

        const firstName = validator.isFirstNameValid(
            xss(requestPostData.firstName)
        );
        const lastName = validator.isLastNameValid(
            xss(requestPostData.lastName)
        );
        const email = validator.isEmailValid(xss(requestPostData.email));
        const password = validator.isPasswordValid(
            xss(requestPostData.password)
        );

        const child = await parentsData.addChild(
            request.session.parent._id,
            firstName,
            lastName,
            email,
            password
        );

        if (!child) {
            throwError(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "Internal Server Error"
            );
        }

        request.app.locals.addChildFlashMessage =
            "Child account created successfully.";

        if (!child.accountCreated) {
            throwError(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "Internal Server Error"
            );
        }

        response.json({ isError: false });
    } catch (error) {
        response.status(error.code || ErrorCode.INTERNAL_SERVER_ERROR).json({
            isError: true,
            error: error.message || "Error: Internal server error.",
        });
    }
});

//profile page
router.get("/profile", async (request, response) => {
    if (!request.session.parent) {
        return response.redirect("/");
    }

    try {
        const parent = await parentsData.get(request.session.parent._id);

        response.render("parents/profile", {
            pageTitle: "Profile",
            parent: parent,
        });
    } catch (error) {
        response
            .status(error.code || ErrorCode.INTERNAL_SERVER_ERROR)
            .render("parents/profile", {
                pageTitle: "Profile",
                error: error.message || "Internal Server Error",
            });
    }
});

//update profile page view
router.get("/update-profile", async (request, response) => {
    if (!request.session.parent) {
        return response.redirect("/");
    }

    try {
        const parent = await parentsData.get(request.session.parent._id);

        response.render("parents/update-profile", {
            pageTitle: "Update Profile",
            parent: parent,
        });
    } catch (error) {
        response
            .status(error.code || ErrorCode.INTERNAL_SERVER_ERROR)
            .render("parents/update-profile", {
                pageTitle: "Update profile",
                error: error.message || "Internal Server Error",
            });
    }
});

//submit update profile page
router.put("/profile", async (request, response) => {
    if (!request.session.parent) {
        return response.redirect("/");
    }

    try {
        const requestPostData = request.body;

        const firstName = validator.isFirstNameValid(
            xss(requestPostData.firstName)
        );
        const lastName = validator.isLastNameValid(
            xss(requestPostData.lastName)
        );

        const parentDetails = request.session.parent;

        if (
            firstName === parentDetails.firstName &&
            lastName === parentDetails.lastName
        ) {
            throwError(
                ErrorCode.BAD_REQUEST,
                "No fields have been changed from their original values, so no update has occurred!"
            );
        }

        const parent = await parentsData.updateProfile(
            request.session.parent._id,
            firstName,
            lastName
        );

        request.session.parent.firstName = firstName;
        request.session.parent.lastName = lastName;

        if (!parent.profileUpdated) {
            throwError(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "Internal Server Error"
            );
        }

        response.json({ isError: false });
    } catch (error) {
        response.status(error.code || ErrorCode.INTERNAL_SERVER_ERROR).json({
            isError: true,
            error: error.message || "Internal server error",
        });
    }
});

router.get("/editChild/:childId", async (request, response) => {
    if (!request.session.parent) {
        return response.redirect("/");
    }

    try {
        const childId = validator.isChildIdValid(xss(request.params.childId));

        const child = await parentsData.getChild(
            request.session.parent._id,
            childId
        );

        if (!child) {
            request.app.locals.editChildError = "Child not found.";
            return response.redirect("/parents/dashboard");
        }

        response.render("parents/editChild", {
            pageTitle: "Edit Child",
            child: {
                email: child.email,
                firstName: child.firstName,
                lastName: child.lastName,
                childId: childId,
            },
        });
    } catch (error) {
        request.app.locals.editChildError =
            error.message || "Internal server error";

        return response.redirect("/parents/dashboard");
    }
});

router.post("/editChild", async (request, response) => {
    if (!request.session.parent) {
        return response.redirect("/");
    }

    try {
        const requestPostData = request.body;

        const firstName = validator.isFirstNameValid(
            xss(requestPostData.firstName)
        );
        const lastName = validator.isLastNameValid(
            xss(requestPostData.lastName)
        );
        const childId = validator.isChildIdValid(xss(requestPostData.childId));

        const child = await parentsData.getChild(
            request.session.parent._id,
            childId
        );

        if (!child) {
            throwError(ErrorCode.NOT_FOUND, "Child not found.");
        }

        if (firstName === child.firstName && lastName === child.lastName) {
            throwError(
                ErrorCode.BAD_REQUEST,
                "No fields have been changed from their original values, so no update has occurred!"
            );
        }

        const currentChild = await parentsData.updateChild(
            request.session.parent._id,
            childId,
            firstName,
            lastName
        );

        if (!currentChild.profileUpdated) {
            throwError(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "Internal Server Error"
            );
        }

        request.app.locals.editChildFlashMessage =
            "Child account updated successfully.";

        response.json({ isError: false });
    } catch (error) {
        response.status(error.code || ErrorCode.INTERNAL_SERVER_ERROR).json({
            isError: true,
            error: error.message || "Error: Internal server error.",
        });
    }
});

router.post("/assignCourse", async (request, response) => {
    if (!request.session.parent) {
        return response.redirect("/parents");
    }

    const requestPostData = request.body;

    const childId = requestPostData.childId;
    const courseId = requestPostData.courseId;

    const parentId = request.session.parent._id;

    const assignedCourse = await parentsData.assignCourse(
        parentId,
        childId,
        courseId
    );

    response.json({ isError: false });

    request.app.locals.assignCourse = "Course has been assigned successfully.";
});

router.get("/getNonAssignedChildren/:courseId", async (request, response) => {
    if (!request.session.parent) {
        return response.redirect("/parents");
    }

    const courseId = xss(request.params.courseId);

    const parentId = request.session.parent._id;

    const children = await parentsData.getChildren(parentId);

    const nonAssignedChildren = getNonAssignedChildren(
        courseId,
        children.children
    );

    response.json({ children: nonAssignedChildren });
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

router.get("/childProgress/:childId", async (request, response) => {
    if (!request.session.parent) {
        return response.redirect("/parents");
    }

    try {
        const childId = validator.isChildIdValid(xss(request.params.childId));

        const child = await parentsData.getChild(
            request.session.parent._id,
            childId
        );

        if (!child) {
            request.app.locals.editChildError = "Child not found.";
            return response.redirect("/parents/dashboard");
        }

        const coursesAnalytics = getCourseAnalytics(child.courses);

        response.render("parents/child-progress", {
            pageTitle: "Child Progress",
            child: {
                email: child.email,
                firstName: child.firstName,
                lastName: child.lastName,
            },
            courses: coursesAnalytics,
        });
    } catch (error) {
        request.app.locals.editChildError =
            error.message || "Internal server error";

        return response.redirect("/parents/dashboard");
    }
});

function getCourseAnalytics(courses) {
    if (courses.length < 1) {
        return [];
    }

    const coursesAnalytics = [];

    for (const currentCourse of courses) {
        const course = {
            name: currentCourse.name,
            imageUrl: currentCourse.imageUrl,
            totalVideos: 0,
            totalQuizzes: 0,
            totalCompleted: 0,
            progress: 0,
            totalModules: currentCourse.modules.length,
            isCourseCompleted: currentCourse.isCourseCompleted,
        };

        for (const currentModule of currentCourse.modules) {
            if (currentModule.type === "Video") {
                course.totalVideos++;
            }

            if (currentModule.type === "Quiz") {
                course.totalQuizzes++;
            }

            if (currentModule.isModuleCompleted === true) {
                course.totalCompleted++;
            }
        }

        course.progress = Math.round(
            (100 * course.totalCompleted) / course.totalModules
        );

        coursesAnalytics.push(course);
    }

    return coursesAnalytics;
}

const throwError = (code = 500, message = "Error: Internal Server Error") => {
    throw { code, message };
};

module.exports = router;
