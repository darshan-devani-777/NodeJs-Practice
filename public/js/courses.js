function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

$(document).ready(function () {
  // Initialize DataTable
  const table = $("#courses_table").DataTable({
    processing: true,
    serverSide: false,
    ajax: {
      url: "/courses/fetch?limit=100",
      type: "GET",
      headers: {
        Authorization: "Bearer " + getCookie("accessToken"),
      },
      dataSrc: function (json) {
        console.log("📦 API Response:", json);
        return json?.data?.courses || [];
      },
    },
    columns: [
      { data: "title", title: "Title" },
      {
        data: "description",
        title: "Description",
        render: (data) =>
          data && data.length > 60 ? data.substring(0, 60) + "..." : data,
      },
      {
        data: "thumbnail",
        title: "Image",
        render: (data) =>
          data
            ? `<img src="${data}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;">`
            : `<span style="color:#999;">No Image</span>`,
      },
      {
        data: "price",
        title: "Price (₹)",
        render: (data) => (data ? `₹${parseFloat(data).toFixed(2)}` : "-"),
      },
      {
        data: "content",
        title: "Content",
        render: (data) => (data ? "Has Content" : "Empty"),
      },
      {
        data: "is_published",
        title: "Status",
        render: (data) =>
          data
            ? `<span class="badge badge-success">Published</span>`
            : `<span class="badge badge-secondary">Draft</span>`,
      },
      {
        data: "course_id",
        title: "Action",
        render: (id) => `
          <div class="d-flex" style="gap: 8px;">
            <button class="btn btn-sm btn-primary edit-btn" data-id="${id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-btn" data-id="${id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `,
      },
    ],
  });

  // DELETE COURSE
  $(document).on("click", ".delete-btn", function () {
    const id = $(this).data("id");
    if (!confirm("Are you sure you want to delete this course?")) return;

    $.ajax({
      url: `/courses/delete/${id}`,
      type: "DELETE",
      headers: {
        Authorization: "Bearer " + getCookie("accessToken"),
      },
      success: (res) => {
        if (res.success) {
          toastr.success("Course deleted successfully!");
          table.ajax.reload();
        } else {
          toastr.error(res.message || "Failed to delete course");
        }
      },
      error: (xhr) => {
        toastr.error(xhr.responseJSON?.message || "Error deleting course");
      },
    });
  });

  // EDIT BUTTON → LOAD COURSE
  $(document).on("click", ".edit-btn", async function () {
    const id = $(this).data("id");

    try {
      const res = await fetch(`/courses/fetch/${id}`, {
        headers: {
          Authorization: "Bearer " + getCookie("accessToken"),
        },
      });
      const data = await res.json();
      console.log("📥 Edit Data:", data);

      if (!res.ok || !data.success) {
        toastr.error(data.message || "Failed to load course details");
        return;
      }

      const course = data.data;

      $("#editCourseId").val(course.course_id);
      $("#editTitle").val(course.title);
      $("#editDescription").val(course.description);
      $("#editPrice").val(course.price);
      $("#editContent").summernote("code", course.content || "");
      $("#editContent").data("original-content", course.content || "");
      $("#editIsPublished").prop("checked", !!course.is_published);
      $("#editImagePreview").html(
        course.thumbnail
          ? `<img src="${course.thumbnail}" style="width:150px;height:100px;object-fit:cover;border-radius:5px;">`
          : "<span>No image</span>"
      );

      $("#modal-edit").modal("show");
    } catch (err) {
      console.error(err);
      toastr.error("Error loading course data");
    }
  });

  // CREATE COURSE
  $("#createCourseForm").on("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(this);

    $.ajax({
      url: "/courses/create",
      type: "POST",
      headers: {
        Authorization: "Bearer " + getCookie("accessToken"),
      },
      data: formData,
      processData: false,
      contentType: false,
      success: (res) => {
        if (res.success) {
          toastr.success("Course created successfully!");
          $("#modal-create").modal("hide");
          table.ajax.reload();
        } else {
          toastr.error(res.message || "Failed to create course");
        }
      },
      error: (xhr) => {
        toastr.error(xhr.responseJSON?.message || "Error creating course");
      },
    });
  });

  // UPDATE COURSE
  $(document).on("submit", "#editCourseForm", async function (e) {
    e.preventDefault();

    const id = $("#editCourseId").val();
    const formData = new FormData(this);

    let newContent = ($("#editContent").summernote("code") || "").trim();
    const originalContent = (
      $("#editContent").data("original-content") || ""
    ).trim();

    const isEmpty = ["", "<p><br></p>", "<br>", "<p></p>"].includes(newContent);

    if (isEmpty && originalContent) {
      newContent = originalContent;
    }

    if (!isEmpty || originalContent) {
      formData.set("content", newContent);
    }

    formData.set("is_published", $("#editIsPublished").is(":checked"));

    try {
      console.log("📡 Updating course:", id);

      const res = await fetch(`/courses/update/${id}`, {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + getCookie("accessToken"),
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toastr.success("Course updated successfully!");
        $("#modal-edit").modal("hide");
        $("#courses_table").DataTable().ajax.reload();
      } else {
        toastr.error(data.message || "Failed to update course");
      }
    } catch (err) {
      console.error("Error:", err);
      toastr.error("Error updating course");
    }
  });
});
