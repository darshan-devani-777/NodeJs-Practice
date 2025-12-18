$(function () {
  // Load tags when tag type is changed
  function loadTags(tagValue, targetSelect, selectedTagId = null) {
    if (!tagValue) {
      $(targetSelect).empty().append('<option value="">Select Tag</option>');
      return;
    }

    $.ajax({
      type: "GET",
      url: `/articleTags?type=${tagValue}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      success: function (tagRes) {
        if (tagRes.success && tagRes.data.length > 0) {
          $(targetSelect)
            .empty()
            .append('<option value="">Select Tag</option>');
          tagRes.data.forEach(function (tag) {
            const selected =
              selectedTagId === tag.article_tag_id ? "selected" : "";
            $(targetSelect).append(
              `<option value="${tag.article_tag_id}" ${selected}>${tag.name}</option>`
            );
          });
        }
      },
      error: function (error) {
        console.error("Error loading tags:", error);
        toastr.error("Error loading tag information");
      },
    });
  }

  // Load topics when tag is changed
  function loadTopics(tagId, targetSelect, selectedTopicId = null) {
    if (!tagId) {
      $(targetSelect).empty().append('<option value="">Select Topic</option>');
      return;
    }

    $.ajax({
      type: "GET",
      url: `/articleTopics/${tagId}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      success: function (topicRes) {
        if (topicRes.success && topicRes.data.length > 0) {
          $(targetSelect)
            .empty()
            .append('<option value="">Select Topic</option>');
          topicRes.data
            ?.filter((topic) => topic.tag.article_tag_id === tagId)
            .forEach(function (topic) {
              const selected =
                selectedTopicId === topic.article_topic_id ? "selected" : "";
              $(targetSelect).append(
                `<option value="${topic.article_topic_id}" ${selected}>${topic.topic}</option>`
              );
            });
        }
      },
      error: function (error) {
        console.error("Error loading topics:", error);
        toastr.error("Error loading topics");
      },
    });
  }

  // Event handlers for CREATE form
  $("#createtype").on("change", function () {
    const selectedType = $(this).val();

    // Reset child dropdowns when parent changes
    $("#createtag").empty().append('<option value="">Select Tag</option>');
    $("#createtopic").empty().append('<option value="">Select Topic</option>');

    // Load tags only if a type is selected
    if (selectedType) {
      loadTags(selectedType, "#createtag");
    }
  });

  $("#createtag").on("change", function () {
    const selectedTag = $(this).val();

    // Reset topic dropdown when tag changes
    $("#createtopic").empty().append('<option value="">Select Topic</option>');

    // Load topics only if a tag is selected
    if (selectedTag) {
      loadTopics(selectedTag, "#createtopic");
    }
  });

  // Event handlers for EDIT form
  $("#article_tag").on("change", function () {
    const selectedType = $(this).val();

    // Reset child dropdowns when parent changes
    $("#article_tag_select")
      .empty()
      .append('<option value="">Select Tag</option>');
    $("#article_topic")
      .empty()
      .append('<option value="">Select Topic</option>');

    // Load tags only if a type is selected
    if (selectedType) {
      loadTags(selectedType, "#article_tag_select");
    }
  });

  $("#article_tag_select").on("change", function () {
    const selectedTag = $(this).val();

    // Reset topic dropdown when tag changes
    $("#article_topic")
      .empty()
      .append('<option value="">Select Topic</option>');

    // Load topics only if a tag is selected
    if (selectedTag) {
      loadTopics(selectedTag, "#article_topic");
    }
  });

  $("#modal-create").on("hidden.bs.modal", function () {
    $("#add-article-form")[0].reset();
    document.getElementById("image_preview").style.display = "none";
    $("#summernote").summernote("code", "");
    $("#createtag").empty().append('<option value="">Select Tag</option>');
    $("#createtopic").empty().append('<option value="">Select Topic</option>');
  });

  const allowedFileTypes = ["image/jpeg", "image/png", "image/gif"];

  $("#updimage").on("change", function () {
    const file = this.files[0];
    const errorElement = $("#file_error");

    if (file) {
      if (!allowedFileTypes.includes(file.type)) {
        errorElement
          .removeClass("d-none")
          .text("Invalid file type. Only images are allowed.");
        this.value = "";
        $("#file_name").text("Choose file");
      } else {
        const reader = new FileReader();

        reader.onload = function (e) {
          const imagePreview = document.getElementById("updimage_preview");
          imagePreview.src = e.target.result;
          imagePreview.style.display = "block";
        };

        reader.readAsDataURL(file);

        errorElement.addClass("d-none");
        $("#file_name").text(file.name);
      }
    }
  });

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

  var articles_table = $("#articles_table").DataTable({
    order: [],
    autoWidth: false,
    processing: true,
    serverSide: true, 
    ajax: {
      url: "/articles/getArticles",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: function (d) {
        // Map DataTables parameters to your API format
        var sortColumn = 'createdAt';
        var sortOrder = 'desc';
        
        // Check if order exists and has items
        if (d.order && d.order.length > 0 && d.columns[d.order[0].column]) {
          sortColumn = d.columns[d.order[0].column].data || 'createdAt';
          sortOrder = d.order[0].dir || 'desc';
        }
        
        return {
          page: (d.start / d.length) + 1,
          limit: d.length,
          search: d.search.value || '',
          sort_column: sortColumn,
          sort_order: sortOrder
        };
      },
      dataSrc: function (json) {
        console.log("DataTables received:", json);
        
        // Handle error response
        if (!json || !json.success) {
          console.error("API Error:", json);
          toastr.error(json?.message || "Failed to load articles");
          return [];
        }
        
        // Map your API response to DataTables format
        json.recordsTotal = json?.data?.pagination?.total_items || 0;
        json.recordsFiltered = json?.data?.pagination?.total_items || 0;
        return json?.data?.articles || [];
      },
      error: function (xhr, error, thrown) {
        console.error("AJAX Error:", error, thrown);
        toastr.error("Failed to load articles. Please check your connection.");
      }
    },
    columns: [
      { data: "article_id", visible: false },
      { data: "title", defaultContent: "-" },
      {
        data: "content",
        render: function (data) {
          if (data) {
            const plainText = data.replace(/<\/?[^>]+(>|$)/g, "");
            return plainText.length > 150
              ? plainText.substring(0, 150) + "..."
              : plainText;
          }
          return "-";
        },
      },
      {
        data: "image",
        render: function (data, type, row) {
          return data
            ? `<a href="${data}" data-toggle="lightbox" data-title="${row.title}">
                <img src="${data}" height="50" width="50" style="border-radius:6px;object-fit:cover;" />
              </a>`
            : `<img src="${row.image || '/public/dist/img/no_image.png'}" 
             alt="Course Thumbnail" 
             style="width:50px;height:50px;object-fit:cover;border-radius:4px;">`;
        },
      },
      {
        data: "topic.tag.type",
        render: function (data, type, row) {
          const typeValue = row?.topic?.tag?.type;
          return typeValue
            ? typeValue.charAt(0).toUpperCase() + typeValue.slice(1)
            : "-";
        },
      },  
      {
        data: "topic.tag.name",
        render: function (data, type, row) {
          const tagValue = row?.topic?.tag?.name;
          return tagValue
            ? tagValue.charAt(0).toUpperCase() + tagValue.slice(1)
            : "-";
        },
      },
      {
        data: "topic.topic",
        render: function (data) {
          return data || "-";
        },
      },
      {
        data: "user",
        render: function (data) {
          return data
            ? [data.first_name, data.last_name].filter(Boolean).join(" ")
            : "-";
        },
      },
      {
        data: "article_id",
        render: function (data) {
          return `
            <a id="${data}" class="editlink btn btn-info btn-sm" data-toggle="modal" data-target="#modal-update">
              <i class="fas fa-pencil-alt"></i> Edit
            </a>
            <a id="${data}" class="deletelink btn btn-danger btn-sm" data-toggle="modal" data-target="#modal-delete">
              <i class="fas fa-trash"></i> Delete
            </a>`;
        },
      },
    ],
  });     

  // Initial load - page is set automatically by serverSide processing
  let article_id = 0;

  $(document).on("click", ".deletelink", function (e) {
    if (e.target.id == "") {
      e.target.id = e.currentTarget.id;
    }
    article_id = e.target.id;
  });

  $(document).on("click", ".editlink", async function (e) {
    if (e.target.id == "") {
      e.target.id = e.currentTarget.id;
    }
    if (e.target.id != "") {
      $("#upd_summernote").summernote("code", "");
      $("#article-form")[0].reset();

      // Clear existing options
      $("#article_tag_select")
        .empty()
        .append('<option value="">Select Tag</option>');
      $("#article_topic")
        .empty()
        .append('<option value="">Select Topic</option>');

      $.ajax({
        type: "GET",
        url: `/articles/edit/${e.target.id}`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: false,
        processData: false,
        contentType: false,
        success: function (res) {
          if (res.success == false) {
            toastr.error(res.message);
          } else {
            const data = res.data;
            document.getElementById("title").value = data.title;
            document.getElementById("txtId").value = data.article_id;

            // Set tag type and load tags, then load topics
            if (data.topic && data.topic.tag) {
              // Set the tag type
              document.getElementById("article_tag").value =
                data.topic.tag.type;

              // Load tags for the selected type, then load topics
              loadTags(
                data.topic.tag.type,
                "#article_tag_select",
                data.topic.tag.article_tag_id
              );

              // After a short delay, load topics for the selected tag
              setTimeout(() => {
                loadTopics(
                  data.topic.tag.article_tag_id,
                  "#article_topic",
                  data.article_topic_id
                );
              }, 500);
            }

            if (data.image && data.image != "") {
              document.getElementById("updimage_preview").src = data.image;
              document.getElementById("updimage_preview").style.display =
                "block";
            }

            $("#upd_summernote").summernote(
              "code",
              data.content ? data.content : ""
            );
          }
        },
        error: function (error) {
          console.log("error",error);
          var err = JSON.parse(error.responseText).message;
          toastr.error(err);
        },
      });
    } else {
      toastr.error("Invalid article ID!");
    }
  });

  $("#btnDelete").click(function () {
    $.ajax({
      type: "delete",
      url: `/articles/delete/${article_id}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: false,
      processData: false,
      contentType: false,
      success: function (res) {
        if (res.success == false) {
          toastr.error(res.message);
        }
        $("#modal-delete").modal("hide");
        articles_table.ajax.reload(null, false); // Stay on current page
      },
      error: function (error) {
        var err = JSON.parse(error.responseText).message;
        toastr.error(err);
      },
    });
  });

  $("#article-form").validate({
    rules: {
      title: {
        required: true,
      },
      content: {
        required: true,
      },
      tag: {
        required: true,
      },
      article_topic_id: {
        required: true,
      },
    },
    messages: {
      title: {
        required: "Please enter title",
      },
      content: {
        required: "Please provide content",
      },
      tag: {
        required: "Please select tag",
      },
      article_topic_id: {
        required: "Please select topic",
      },
    },
    submitHandler: function (form, e) {
      e.preventDefault();

      let formData = new FormData(form);

      $.ajax({
        type: "POST",
        url: `/articles/edit/${$("#txtId").val()}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: formData,
        processData: false,
        contentType: false,
        enctype: "multipart/form-data",
        beforeSend: function () {},
        success: function (res) {
          $("#article-form")[0].reset();
          if (res.success === true) {
            $("#modal-update").modal("hide");
            toastr.success("Article updated successfully!");
            articles_table.ajax.reload(null, false); // Stay on current page
          } else {
            toastr.error(res.message);
          }
        },
        error: function (error) {
          const errMessage = error.responseJSON?.error || "An error occurred";
          toastr.error(errMessage);
        },
        complete: function () {},
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

  $("#add-article-form").validate({
    rules: {
      title: {
        required: true,
      },
      content: {
        required: true,
      },
      tag: {
        required: true,
      },
      article_topic_id: {
        required: true,
      },
    },
    messages: {
      title: {
        required: "Please enter title",
      },
      content: {
        required: "Please provide content",
      },
      tag: {
        required: "Please select tag",
      },
      article_topic_id: {
        required: "Please select topic",
      },
    },
    submitHandler: function (form, e) {
      e.preventDefault();

      let formData = new FormData(form);

      $.ajax({
        type: "POST",
        url: "/articles/create/",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: formData,
        processData: false,
        contentType: false,
        enctype: "multipart/form-data",
        beforeSend: function () {},
        success: function (res) {
          if (res.success === true) {
            $("#modal-create").modal("hide");
            articles_table.ajax.reload(null, true); // Go to first page on create
            toastr.success("Article created successfully!");
          } else {
            toastr.error(res.message);
          }
        },
        error: function (error) {
          const errMessage = error.responseJSON?.error || "An error occurred";
          toastr.error(errMessage);
        },
        complete: function () {},
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
});
