// Helper: get cookie value
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

$(document).ready(function () {
  const token = getCookie("accessToken");

  // --- DataTable ---
  const table = $("#terms_table").DataTable({
    ajax: {
      url: "/termsOfUse/fetch",
      type: "GET",
      headers: { Authorization: "Bearer " + token },
      dataSrc: (json) => json?.data || [],
    },
    columns: [
      { data: "main_heading" },
      {
        data: "sections",
        render: (sections) => {
          if (!sections || !Array.isArray(sections)) return "—";
          const preview = sections
            .slice(0, 2)
            .map(
              (s) =>
                `<b>${s.heading}</b>: ${s.content.substring(0, 60)}...`
            )
            .join("<br>");
          return `<div style="max-width:400px; overflow:hidden; text-overflow:ellipsis;">
            ${preview}
          </div>`;
        },
      },
      {
        data: "created_at",
        render: (d) => new Date(d).toLocaleString(),
      },
      {
        data: "terms_id",
        render: (id) => `
          <button class="btn btn-sm btn-primary edit-btn" data-id="${id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${id}">
            <i class="fas fa-trash"></i>
          </button>`,
      },
    ],
  });

  // --- CREATE ---
  $("#createTermsForm").on("submit", function (e) {
    e.preventDefault();

    const main_heading = this.main_heading.value.trim();
    const sectionsRaw = $("#sections_create").summernote("code").trim();

    if (!sectionsRaw || sectionsRaw === "<p><br></p>") {
      return toastr.error("Please enter some content before creating!");
    }

    const sections = [{ heading: "Section 1", content: sectionsRaw }];

    $.ajax({
      url: "/termsOfUse/create",
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      contentType: "application/json",
      data: JSON.stringify({ main_heading, sections }),
      success: (res) => {
        if (res.success) {
          toastr.success("Terms of Use created successfully!");
          $("#modal-create").modal("hide");
          $("#createTermsForm")[0].reset();
          $("#sections_create").summernote("reset");
          table.ajax.reload();
        } else toastr.error(res.message);
      },
      error: (xhr) =>
        toastr.error(
          xhr.responseJSON?.message || "Error creating Terms of Use."
        ),
    });
  });

  // --- LOAD FOR EDIT ---
  $(document).on("click", ".edit-btn", async function () {
    const id = $(this).data("id");
    try {
      const res = await fetch(`/termsOfUse/fetch/${id}`, {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();

      if (!data.success) return toastr.error("Failed to fetch Terms of Use.");

      const item = data.data;
      $("#editTermsId").val(item.terms_id);
      $("#editMainHeading").val(item.main_heading);

      const combinedSections = item.sections
        .map((s) => `<h5>${s.heading}</h5><p>${s.content}</p>`)
        .join("<br>");
      $("#editSections").summernote("code", combinedSections || "");

      $("#modal-edit").modal("show");
    } catch (err) {
      toastr.error("Error loading Terms of Use.");
    }
  });

  // --- UPDATE ---
  $("#editTermsForm").on("submit", async function (e) {
    e.preventDefault();
    const id = $("#editTermsId").val();
    const main_heading = $("#editMainHeading").val().trim();
    const htmlContent = $("#editSections").summernote("code").trim();

    if (!htmlContent || htmlContent === "<p><br></p>") {
      return toastr.error("Please enter some content before updating!");
    }

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;

    const sections = [];
    let current = null;

    Array.from(tempDiv.children).forEach((el) => {
      if (el.tagName === "H5") {
        if (current) {
          current.content = current.content
            .replace(/<p><br><\/p>/g, "")
            .trim();
          sections.push(current);
        }
        current = { heading: el.innerText.trim(), content: "" };
      } else if (current) {
        current.content += el.outerHTML;
      }
    });

    if (current) {
      current.content = current.content
        .replace(/<p><br><\/p>/g, "")
        .trim();
      sections.push(current);
    }

    sections.forEach((sec) => {
      sec.content = sec.content
        .replace(/^(<br>|<p><br><\/p>)+/, "")
        .replace(/(<br>|<p><br><\/p>)+$/, "")
        .trim();
    });

    $.ajax({
      url: `/termsOfUse/update/${id}`,
      method: "PUT",
      headers: { Authorization: "Bearer " + token },
      contentType: "application/json",
      data: JSON.stringify({ main_heading, sections }),
      success: (res) => {
        if (res.success) {
          toastr.success("Terms of Use updated successfully!");
          $("#modal-edit").modal("hide");
          table.ajax.reload();
        } else toastr.error(res.message);
      },
      error: (xhr) =>
        toastr.error(
          xhr.responseJSON?.message || "Error updating Terms of Use."
        ),
    });
  });

  // --- DELETE ---
  $(document).on("click", ".delete-btn", function () {
    const id = $(this).data("id");
    if (!confirm("Are you sure you want to delete this Terms of Use?")) return;

    $.ajax({
      url: `/termsOfUse/delete/${id}`,
      type: "DELETE",
      headers: { Authorization: "Bearer " + token },
      success: (res) => {
        if (res.success) {
          toastr.success("Deleted successfully!");
          table.ajax.reload();
        } else toastr.error(res.message);
      },
      error: (xhr) =>
        toastr.error(
          xhr.responseJSON?.message || "Error deleting Terms of Use."
        ),
    });
  });
});
