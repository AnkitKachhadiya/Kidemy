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
        request.session.destroy();
        request.app.locals.isParentAuthenticated = false;
    }

    response.redirect("/parents");
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
        Hi <strong>${parent.firstName} ${parent.lastName}</strong>,
        <br>
        <p>We're happy you signed up for Kidemy. To start exploring the Kidemy, please confirm your email address.</p>
        <a href="http://localhost:3000/parents/verifyEmail/${parent._id}&${parent.verificationToken}" target="_blank">Verify Email</a>
        <p>Welcome to Kidemy! <br> The Kidemy Team</p>
        `;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.USER,
                pass: process.env.PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.USER,
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

router.get("/dashboard", async (request, response) => {
    if (!request.session.parent) {
        return response.redirect("/");
    }

    const parent = await parentsData.get(request.session.parent._id);

    response.render("parents/dashboard", {
        pageTitle: "Dashboard",
        parentEmail: parent.email,
        isVerified: parent.isVerified,
        children: parent.children,
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

router.get("/addChild", async (request, response) => {
    if (!request.session.parent) {
        return response.redirect("/");
    }

    response.render("parents/addChild", {
        pageTitle: "Add Child",
    });
});

router.post("/addChild", async (request, response) => {
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

const throwError = (code = 500, message = "Error: Internal Server Error") => {
    throw { code, message };
};

module.exports = router;
