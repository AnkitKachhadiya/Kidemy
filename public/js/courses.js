(function ($) {
  scrollTo();

  function scrollTo() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const scrollTo = urlParams.get("scrollTo");

    if (scrollTo) {
      goToNextModule(scrollTo);
    }
  }

  $(document).on("click", "button#assign-course", function () {
    $("#assign-course-modal-body").html(" ");
    $("#assign-course-modal").modal("show");

    getNonAssignedChildren();
  });

  function getNonAssignedChildren() {
    const courseId = $("#course-id").val();

    $.ajax({
      url: `/parents/getNonAssignedChildren/${courseId}`,
      method: "GET",
      beforeSend: function () {
        $("#loader-container").removeClass("d-none");
      },
      complete: function (data) {
        addChildrenOptions(data.responseJSON.children);
        $("#loader-container").addClass("d-none");
      },
      error: function (data) {
        $("#error-message").html(data.responseJSON.error);
        $("#error-message").removeClass("d-none");
      },
    });
  }

  function addChildrenOptions(children) {
    let radioHtml = "";

    for (child of children) {
      radioHtml += `
            <div class="form-check">
                <input
                    class="form-check-input"
                    type="radio"
                    name="child"
                    value="${child._id}"
                    id="child-${child._id}"
                />
                <label class="form-check-label" for="child-${child._id}">
                    ${child.firstName} ${child.lastName}
                </label>
            </div>
            `;
    }

    $("#assign-course-modal-body").html(radioHtml);
  }

  $(document).on("click", "button#assign-child", function () {
    const child = $("input[name='child']:checked").val();
    const courseId = $("#course-id").val();

    $.ajax({
      url: `/parents/assignCourse`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        childId: child,
        courseId: courseId,
      }),
      beforeSend: function () {
        $("#loader-container").removeClass("d-none");
      },
      success: function () {
        location.reload();
      },
      complete: function (data) {
        addChildrenOptions(data.responseJSON.children);
        $("#loader-container").addClass("d-none");
      },
      error: function (data) {
        $("#error-message").html(data.responseJSON.error);
        $("#error-message").removeClass("d-none");
      },
    });
  });

  $(document).on("click", "button.next-module-btn", function () {
    const moduleId = $(this).data("module-id");
    const moduleType = $(this).data("module-type");
    const courseId = $("#course-id").val();
    let quizUserAnswer = "";
    let correctAnswer = "";

    if (moduleType === "quiz") {
      quizUserAnswer = $(`input[name='quiz-${moduleId}']:checked`).val();
      correctAnswer = $(this).data("module-a");

      if (!quizUserAnswer) {
        return;
      }
    }

    completeModule(
      moduleId,
      courseId,
      moduleType,
      quizUserAnswer,
      correctAnswer
    );
  });

  function completeModule(
    moduleId,
    courseId,
    moduleType,
    quizUserAnswer,
    correctAnswer
  ) {
    $.ajax({
      url: `/courses/completeModule/`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        moduleId,
        courseId,
        moduleType,
        quizUserAnswer,
      }),
      beforeSend: function () {
        $("#loader-container").removeClass("d-none");
      },
      complete: function () {
        let goToModuleId = moduleId + 1;

        if (moduleType === "quiz" && quizUserAnswer !== correctAnswer) {
          goToModuleId--;
        }

        let newUrl = `${window.location.origin}${window.location.pathname}?scrollTo=module-${goToModuleId}`;

        window.location.href = newUrl;
      },
      error: function (data) {
        $("#error-message").html(data.responseJSON.error);
        $("#error-message").removeClass("d-none");
      },
    });
  }

  function goToNextModule(elementId) {
    const nextModuleElement = document.querySelector(`#${elementId}`);

    if (nextModuleElement) {
      nextModuleElement.scrollIntoView({
        behavior: "smooth",
      });
    }
  }

  $(document).on("click", "button#search-courses-btn", function () {
    const searchQuery = $("#search-input").val().trim();

    $("#all-courses-wrapper").html(" ");

    searchCourses(searchQuery);
  });

  function searchCourses(searchQuery) {
    $.ajax({
      url: `/courses/search`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ searchQuery }),
      beforeSend: function () {
        $("#loader-container").removeClass("d-none");
        $("#error-message").addClass("d-none");
      },
      complete: function (data) {
        formulateCourses(data.responseJSON.courses);
        $("#loader-container").addClass("d-none");
      },
      error: function (data) {
        $("#error-message").html(data.responseJSON.error);
        $("#error-message").removeClass("d-none");
        $("#loader-container").addClass("d-none");
      },
    });
  }

  function formulateCourses(courses) {
    let html = "";

    for (const currentCourse of courses) {
      html += `
            <div class="col">
                <div class="card h-100">
                    <img
                        width="415"
                        height="250"
                        src="${currentCourse.imageUrl}"
                        class="card-img-top"
                        alt="${currentCourse.name}"
                    />
                    <div class="card-body">
                        <h5 class="card-title"><a
                                href="/courses/${currentCourse._id}"
                                class="text-decoration-none"
                            >${currentCourse.name}</a></h5>
                    </div>
                </div>
            </div>
            `;
    }

    $("#all-courses-wrapper").html(html);
  }
})(jQuery);
