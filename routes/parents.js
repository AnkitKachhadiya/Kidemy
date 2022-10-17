require("dotenv").config();
const express = require("express");
const validator = require("../helpers/validator");
const xss = require("xss");
const ErrorCode = require("../helpers/error-code");
const data = require("../data");
const nodemailer = require("nodemailer");

const parentsData = data.parents;
const router = express.Router();

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

const throwError = (code = 500, message = "Error: Internal Server Error") => {
    throw { code, message };
};

module.exports = router;
