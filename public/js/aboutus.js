// Helper: get cookie value
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

$(document).ready(function () {
  // Initialize DataTable
  const table = $('#about_table').DataTable({
    ajax: {
      url: '/aboutUs/fetch',
      type: 'GET',
      headers: { Authorization: 'Bearer ' + getCookie('accessToken') },
      dataSrc: (json) => json?.data || [],
    },
    columns: [
      { data: 'main_heading' },
      {
        data: 'main_content',
        render: (data) =>
          data && data.length > 100 ? data.substring(0, 100) + '...' : data,
      },
      {
        data: 'hero_image',
        render: (data) =>
          data
            ? `<img src="${data}" class="rounded" style="width:80px;height:50px;object-fit:cover;">`
            : `<span class="text-muted">No Image</span>`,
      },
      {
        data: 'testimonial_quote',
        render: (data, _, row) =>
          data
            ? `"${data}"<br><small>- ${row.testimonial_author || ''}</small>`
            : '—',
      },
      {
        data: 'creator',
        render: (c) =>
          c ? `${c.first_name} ${c.last_name}<br><small>${c.email}</small>` : '-',
      },
      {
        data: 'createdAt',
        render: (d) => new Date(d).toLocaleString(),
      },
      {
        data: 'about_id',
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

  // CREATE 
  $('#createAboutForm').on('submit', function (e) {
    e.preventDefault();
    const mainContent = $('#main_content').summernote('code').trim();

    if (!mainContent || mainContent === '<p><br></p>') {
      toastr.error('Please enter some content before creating!');
      return;
    }

    const formData = new FormData(this);
    formData.set('main_content', mainContent);

    $.ajax({
      url: '/aboutUs/create',
      type: 'POST',
      data: formData,
      headers: { Authorization: 'Bearer ' + getCookie('accessToken') },
      processData: false,
      contentType: false,
      success: (res) => {
        if (res.success) {
          toastr.success('About Us entry created successfully!');
          $('#modal-create').modal('hide');
          $('#createAboutForm')[0].reset();
          $('#main_content').summernote('reset');
          table.ajax.reload();
        } else {
          toastr.error(res.message || 'Error creating entry.');
        }
      },
      error: (xhr) => {
        toastr.error(xhr.responseJSON?.message || 'Error creating entry.');
      },
    });
  });

  // LOAD FOR EDIT 
  $(document).on('click', '.edit-btn', async function () {
    const id = $(this).data('id');
    try {
      const res = await fetch(`/aboutUs/fetch/${id}`, {
        headers: { Authorization: 'Bearer ' + getCookie('accessToken') },
      });
      const data = await res.json();

      if (!data.success) return toastr.error(data.message || 'Failed to fetch entry.');

      const item = data.data;
      $('#editAboutId').val(item.about_id);
      $('#editMainHeading').val(item.main_heading);
      $('#editMainContent').summernote('code', item.main_content || '');
      $('#editQuote').val(item.testimonial_quote || '');
      $('#editAuthor').val(item.testimonial_author || '');
      $('#editImagePreview').html(
        item.hero_image
          ? `<img src="${item.hero_image}" style="width:150px;height:100px;object-fit:cover;border-radius:5px;">`
          : `<span>No image</span>`
      );
      $('#modal-edit').modal('show');
    } catch (err) {
      toastr.error('Error loading About Us entry.');
    }
  });

  // UPDATE 
  $('#editAboutForm').on('submit', async function (e) {
    e.preventDefault();
    const id = $('#editAboutId').val();
    const content = $('#editMainContent').summernote('code').trim();

    if (!content || content === '<p><br></p>') {
      toastr.error('Please enter some content before updating!');
      return;
    }

    const formData = new FormData(this);
    formData.set('main_content', content);

    try {
      const res = await fetch(`/aboutUs/update/${id}`, {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + getCookie('accessToken') },
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        toastr.success('About Us updated successfully!');
        $('#modal-edit').modal('hide');
        table.ajax.reload();
      } else {
        toastr.error(data.message || 'Error updating entry.');
      }
    } catch (err) {
      toastr.error('Error updating About Us.');
    }
  });

  // DELETE 
  $(document).on('click', '.delete-btn', function () {
    const id = $(this).data('id');
    if (!confirm('Are you sure you want to delete this About Us entry?')) return;

    $.ajax({
      url: `/aboutUs/delete/${id}`,
      type: 'DELETE',
      headers: { Authorization: 'Bearer ' + getCookie('accessToken') },
      success: (res) => {
        if (res.success) {
          toastr.success('Deleted successfully!');
          table.ajax.reload();
        } else {
          toastr.error(res.message || 'Error deleting entry.');
        }
      },
      error: (xhr) => {
        toastr.error(xhr.responseJSON?.message || 'Error deleting entry.');
      },
    });
  });

  // Reset Summernote content on modal close
  $('#modal-create').on('hidden.bs.modal', () => $('#main_content').summernote('reset'));
  $('#modal-edit').on('hidden.bs.modal', () => $('#editMainContent').summernote('reset'));
});
