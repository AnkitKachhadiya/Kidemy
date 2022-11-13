(function ($) {
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
})(jQuery);
