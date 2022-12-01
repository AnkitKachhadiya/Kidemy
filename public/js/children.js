(function ($) {
  let hasErrors = false;

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
      url: "/children/login",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(user),
      beforeSend: function () {
        $("#loader-container").removeClass("d-none");
      },
      success: function () {
        window.location.href = "/children/dashboard";
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
})(jQuery);
