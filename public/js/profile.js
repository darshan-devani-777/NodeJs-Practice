$(function () {
  const allowedFileTypes = ["image/jpeg", "image/png", "image/gif"];

  $("#image").on("change", function () {
    const file = this.files[0];
    const errorElement = $("#create_file_error");

    if (file) {
      if (!allowedFileTypes.includes(file.type)) {
        errorElement
          .removeClass("d-none")
          .text("Invalid file type. Only images are allowed.");
        this.value = "";
        $("#create_file_name").text("Choose file");
      } else {
        const reader = new FileReader();

        reader.onload = function (e) {
          const imagePreview = document.getElementById("image_preview");
          imagePreview.src = e.target.result;
          imagePreview.style.display = "block";
        };

        reader.readAsDataURL(file);

        errorElement.addClass("d-none");
        $("#create_file_name").text(file.name);
      }
    }
  });

  $("#profile-form").validate({
    rules: {
      email: {
        required: true,
        email: true,
      },
      first_name: {
        required: true,
      },
      last_name: {
        required: true,
      },
    },
    messages: {
      email: {
        required: "Please enter a email address",
        email: "Please enter a valid email address",
      },
      first_name: {
        required: "Please provide a first name",
      },
      last_name: {
        required: "Please provide a last name",
      },
    },
    submitHandler: function (form, e) {
      e.preventDefault();

      let formData = new FormData(form);
      formData.append("updated_by", user?.user_id);

      $.ajax({
        type: "POST",
        url: `/users/profile`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        enctype: "multipart/form-data",
        data: formData,
        cache: false,
        processData: false,
        contentType: false,
        beforeSend: function () {
          $(".load-gif").show();
        },
        success: function (res) {
          if (res.success === true) {
            toastr.success("Profile updated successfully!");
        
            if (res.user) {
              // ✅ Instantly update navbar without reload
              $("#admin_name").text(`${res.user.first_name} ${res.user.last_name}`);
              $("#admin_image").attr(
                "src",
                res.user.profile_image
                  ? res.user.profile_image
                  : "/public/dist/img/photo1.png"
              );
        
              // ✅ Update global user and localStorage
              user = res.user;
              localStorage.setItem("user", JSON.stringify(res.user));
            }
        
            // ✅ Redirect (navbar will now load updated name)
            setTimeout(() => {
              window.location.replace("/users/admin/dashboard");
            }, 800);
          } else {
            toastr.error(res.message);
          }
        },
        
        error: function (error) {
          const err = JSON.parse(error.responseText).message;
          toastr.error(err);
        },
      });
    },
    errorElement: "span",
    errorPlacement: function (error, element) {
      error.addClass("invalid-feedback");
      element.closest(".form-group").append(error);
    },
    highlight: function (element, errorClass, validClass) {
      $(element).addClass("is-invalid");
    },
    unhighlight: function (element, errorClass, validClass) {
      $(element).removeClass("is-invalid");
    },
  });
});
