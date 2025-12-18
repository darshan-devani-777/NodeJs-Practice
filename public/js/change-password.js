$(function () {
  // Toggle password visibility
  $(".toggle-password").on("click", function () {
    const targetId = $(this).data("target");
    const targetInput = $("#" + targetId);
    const icon = $(this);

    if (targetInput.attr("type") === "password") {
      targetInput.attr("type", "text");
      icon.removeClass("fa-eye").addClass("fa-eye-slash");
    } else {
      targetInput.attr("type", "password");
      icon.removeClass("fa-eye-slash").addClass("fa-eye");
    }
  });

  // Form validation and submission
  $("#change-password-form").validate({
    rules: {
      oldPassword: {
        required: true,
        minlength: 3,
      },
      newPassword: {
        required: true,
        minlength: 8,
      },
      confirmNewPassword: {
        required: true,
        minlength: 8,
        equalTo: "#newPassword",
      },
    },
    messages: {
      oldPassword: {
        required: "Please enter your current password",
        minlength: "Password must be at least 3 characters long",
      },
      newPassword: {
        required: "Please enter a new password",
        minlength: "Password must be at least 8 characters long",
      },
      confirmNewPassword: {
        required: "Please confirm your new password",
        minlength: "Password must be at least 8 characters long",
        equalTo: "Passwords do not match",
      },
    },
    submitHandler: function (form, e) {
      e.preventDefault();

      // Get form data
      const formData = {
        oldPassword: $("#oldPassword").val(),
        newPassword: $("#newPassword").val(),
        confirmNewPassword: $("#confirmNewPassword").val(),
      };

      // Disable submit button to prevent multiple submissions
      const submitBtn = $("#change-password-form button[type='submit']");
      const originalBtnText = submitBtn.html();
      submitBtn.prop("disabled", true);
      submitBtn.html(
        '<i class="fas fa-spinner fa-spin"></i> Changing Password...'
      );

      $.ajax({
        type: "POST",
        url: "/users/changePassword",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: JSON.stringify(formData),
        success: function (res) {
          if (res.success === true) {
            toastr.success(res.message || "Password changed successfully!");

            // Reset form
            $("#change-password-form")[0].reset();

            // Optional: Redirect to dashboard after a short delay
            setTimeout(() => {
              window.location.replace("/users/admin/dashboard");
            }, 1500);
          } else {
            toastr.error(res.message || "Failed to change password");
            submitBtn.prop("disabled", false);
            submitBtn.html(originalBtnText);
          }
        },
        error: function (error) {
          let errMessage = "An error occurred while changing password";
          
          if (error.responseJSON && error.responseJSON.message) {
            errMessage = error.responseJSON.message;
          } else if (error.responseText) {
            try {
              const err = JSON.parse(error.responseText);
              errMessage = err.message || errMessage;
            } catch (e) {
              console.error("Error parsing response:", e);
            }
          }
          
          toastr.error(errMessage);
          submitBtn.prop("disabled", false);
          submitBtn.html(originalBtnText);
        },
      });
    },
    errorElement: "span",
    errorPlacement: function (error, element) {
      error.addClass("invalid-feedback");
      element.closest(".form-group").append(error);
    },
    highlight: function (element) {
      $(element).addClass("is-invalid");
    },
    unhighlight: function (element) {
      $(element).removeClass("is-invalid");
    },
  });

  // Clear form validation on page load
  $("#change-password-form").each(function () {
    this.reset();
  });
});

