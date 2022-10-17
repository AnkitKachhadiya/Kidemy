(function ($) {
    let hasErrors = false;

    $(document).on("submit", "form#signup-form", function (event) {
        event.preventDefault();

        hasErrors = false;

        $("#error-message").addClass("d-none");

        const firstName = $("#firstName");
        const lastName = $("#lastName");
        const email = $("#email");
        const password = $("#password");

        const user = {
            firstName: firstName.val().trim(),
            lastName: lastName.val().trim(),
            email: email.val().trim(),
            password: password.val(),
        };

        $("input, select").removeClass("is-invalid is-valid");

        validUserIdentity(user.firstName)
            ? firstName.addClass("is-valid")
            : firstName.addClass("is-invalid");

        validUserIdentity(user.lastName)
            ? lastName.addClass("is-valid")
            : lastName.addClass("is-invalid");

        validEmail(user.email)
            ? email.addClass("is-valid")
            : email.addClass("is-invalid");

        validPassword(user.password)
            ? password.addClass("is-valid")
            : password.addClass("is-invalid");

        if (hasErrors) {
            return;
        }

        submitSignUpForm(user);
    });

    function submitSignUpForm(user) {
        $.ajax({
            url: "/parents/signup",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(user),
            beforeSend: function () {
                $("#loader-container").removeClass("d-none");
            },
            success: function () {
                window.location.href = "/parents";
            },
            complete: function () {
                $("#loader-container").addClass("d-none");
            },
            error: function (data) {
                $("#error-message").html(data.responseJSON.error);
                $("#error-message").removeClass("d-none");
            },
        });
    }

    $(document).on("submit", "form#login-form", function (event) {
        event.preventDefault();

        hasErrors = false;

        $("#error-message").addClass("d-none");

        const email = $("#email");
        const password = $("#password");

        const user = {
            email: email.val().trim(),
            password: password.val(),
        };

        $("input").removeClass("is-invalid is-valid");

        validEmail(user.email)
            ? email.addClass("is-valid")
            : email.addClass("is-invalid");

        validPassword(user.password)
            ? password.addClass("is-valid")
            : password.addClass("is-invalid");

        if (hasErrors) {
            return;
        }

        submitLoginForm(user);
    });

    function submitLoginForm(user) {
        $.ajax({
            url: "/parents/login",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(user),
            beforeSend: function () {
                $("#loader-container").removeClass("d-none");
            },
            success: function () {
                window.location.href = "/";
            },
            complete: function () {
                $("#loader-container").addClass("d-none");
            },
            error: function (data) {
                $("#error-message").html(data.responseJSON.error);
                $("#error-message").removeClass("d-none");
            },
        });
    }

    function validUserIdentity(name) {
        if (validator.isEmpty(name)) {
            hasErrors = true;
            return false;
        }

        //should match alphabetical characters and spaces
        const nameRegex = /[^a-zA-Z ]/;

        if (nameRegex.test(name)) {
            hasErrors = true;
            return false;
        }

        return true;
    }

    function validEmail(email) {
        if (validator.isEmpty(email)) {
            hasErrors = true;
            return false;
        }

        if (!validator.isEmail(email)) {
            hasErrors = true;
            return false;
        }

        return true;
    }

    function validPassword(password) {
        if (validator.isEmpty(password)) {
            hasErrors = true;
            return false;
        }

        const MINIMUM_PASSWORD_LENGTH = 8;

        if (password.length < MINIMUM_PASSWORD_LENGTH) {
            hasErrors = true;
            return false;
        }

        //should match alphanumeric characters, special characters and no spaces
        const passwordRegex = /[^\S]/;

        if (passwordRegex.test(password)) {
            hasErrors = true;
            return false;
        }

        return true;
    }

    $(document).on("click", "button.show-password", function () {
        const passwordInput = $(this).prev("input");

        $(passwordInput).attr(
            "type",
            $(passwordInput).attr("type") === "password" ? "text" : "password"
        );

        $(this).html($(this).html() === "Show" ? "Hide" : "Show");
    });

    $(document).on("submit", "form#change-password-form", function (event) {
        event.preventDefault();

        hasErrors = false;

        $("#error-message").addClass("d-none");

        const currentPassword = $("#currentPassword");
        const newPassword = $("#newPassword");
        const confirmPassword = $("#confirmPassword");

        const user = {
            currentPassword: currentPassword.val().trim(),
            newPassword: newPassword.val().trim(),
            confirmPassword: confirmPassword.val().trim(),
        };

        $("input").removeClass("is-invalid is-valid");

        validPassword(user.currentPassword)
            ? currentPassword.addClass("is-valid")
            : currentPassword.addClass("is-invalid");

        validPassword(user.newPassword)
            ? newPassword.addClass("is-valid")
            : newPassword.addClass("is-invalid");

        validPassword(user.confirmPassword)
            ? confirmPassword.addClass("is-valid")
            : confirmPassword.addClass("is-invalid");

        if (user.newPassword !== user.confirmPassword) {
            hasErrors = true;
            $("#error-message").html(
                "Error: Confirm password does not match new password."
            );
            $("#error-message").removeClass("d-none");
        } else {
            $("#error-message").html("");
            $("#error-message").addClass("d-none");
        }

        if (hasErrors) {
            return;
        }

        submitChangePasswordForm(user);
    });

    function submitChangePasswordForm(user) {
        $.ajax({
            url: "/parents/password",
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify(user),
            beforeSend: function () {
                $("#loader-container").removeClass("d-none");
            },
            success: function () {
                window.location.href = "/users/changePassword";
            },
            complete: function () {
                $("#loader-container").addClass("d-none");
            },
            error: function (data) {
                $("#error-message").html(data.responseJSON.error);
                $("#error-message").removeClass("d-none");
            },
        });
    }

    $(document).on("submit", "form#edit-user-profile", function (event) {
        event.preventDefault();

        hasErrors = false;

        $("#error-message").addClass("d-none");

        const firstName = $("#first-name");
        const lastName = $("#last-name");
        const dateOfBirth = $("#date-of-birth");
        const gender = $("#gender");

        const user = {
            firstName: firstName.val().trim(),
            lastName: lastName.val().trim(),
            dateOfBirth: dateOfBirth.val().trim(),
            gender: gender.val().trim(),
        };

        $("input").removeClass("is-invalid is-valid");

        validUserIdentity(user.firstName)
            ? firstName.addClass("is-valid")
            : firstName.addClass("is-invalid");

        validUserIdentity(user.lastName)
            ? lastName.addClass("is-valid")
            : lastName.addClass("is-invalid");

        validDateOfBirth(user.dateOfBirth)
            ? dateOfBirth.addClass("is-valid")
            : dateOfBirth.addClass("is-invalid");

        validGender(user.gender)
            ? gender.addClass("is-valid")
            : gender.addClass("is-invalid");

        if (hasErrors) {
            return;
        }

        user.dateOfBirth = moment(user.dateOfBirth).format("MM/DD/YYYY");

        submitUpdateProfileForm(user);
    });

    function submitUpdateProfileForm(user) {
        $.ajax({
            url: "/parents/profile",
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify(user),
            beforeSend: function () {
                $("#loader-container").removeClass("d-none");
            },
            success: function () {
                window.location.href = "/users/profile";
            },
            complete: function () {
                $("#loader-container").addClass("d-none");
            },
            error: function (data) {
                $("#error-message").html(data.responseJSON.error);
                $("#error-message").removeClass("d-none");
            },
        });
    }

    $(document).on("click", "button#send-verification-email", function (event) {
        event.preventDefault();

        $.ajax({
            url: "/parents/sendVerificationEmail",
            method: "POST",
            contentType: "application/json",
            beforeSend: function () {
                $("#loader-container").removeClass("d-none");
            },
            success: function () {
                $("#success-alert").removeClass("d-none");
                $("#send-verification-email").prop("disabled", true);
            },
            complete: function () {
                $("#loader-container").addClass("d-none");
            },
            error: function (data) {
                $("#error-message").html(data.responseJSON.error);
                $("#error-message").removeClass("d-none");
            },
        });
    });
})(jQuery);
