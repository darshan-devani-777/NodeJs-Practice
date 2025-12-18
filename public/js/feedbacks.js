$(function () {

  $('#modal-create').on('hidden.bs.modal', function () {
    $('#add-feedback-form')[0].reset();
    document.getElementById('image_preview').style.display = 'none';
  });  

  const allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif'];

  $('#image').on('change', function () {
    const file = this.files[0];
    const errorElement = $('#file_error');
  
    if (file) {
      if (!allowedFileTypes.includes(file.type)) {
        errorElement.removeClass('d-none').text('Invalid file type. Only images are allowed.');
        this.value = '';
        $('#file_name').text('Choose file');
      } else {
        
        const reader = new FileReader();

          reader.onload = function(e) {
            const imagePreview = document.getElementById('updimage_preview');
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
          };
  
          reader.readAsDataURL(file);

        errorElement.addClass('d-none');  
        $('#file_name').text(file.name);
      }
    }
  });

  $('#create_image').on('change', function () {
    const file = this.files[0];
    const errorElement = $('#create_file_error');
  
    if (file) {
      if (!allowedFileTypes.includes(file.type)) {
        errorElement.removeClass('d-none').text('Invalid file type. Only images are allowed.');
        this.value = '';
        $('#create_file_name').text('Choose file');
      } else {

        const reader = new FileReader();

        reader.onload = function(e) {
          const imagePreview = document.getElementById('image_preview');
          imagePreview.src = e.target.result;
          imagePreview.style.display = 'block';
        };
  
        reader.readAsDataURL(file);

        errorElement.addClass('d-none');  
        $('#create_file_name').text(file.name);
      }
    }
  });
  
    var feedbacks_table = $("#feedbacks_table").DataTable({
      order: [],
      autoWidth: false, // Disable auto column width calculation
      drawCallback: function () {
        this.api().columns.adjust();
      },
      processing : true,
      serverSide : true,
      stateSave: true,
      serverMethod : 'get',
      ajax : {
        url : '/feedbacks/getFeedbacks',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      },
      aaSorting: [],
      columns: [
        { 
          data: 'feedback_id',
          visible: false,        
          searchable: false
        },
        { 
          data: 'name',
          render: function (data, type, row) {
            if (data) {
              return data.length > 150 ? data.substring(0, 150) + '...' : data; 
            }
            return '-';
          }
        },
        { 
          data: 'description',
          render: function (data, type, row) {
            if (data) {
              return data.length > 150 ? data.substring(0, 150) + '...' : data; 
            }
            return '-';
          }
        },
        { 
          data: 'image',
          render: function (data, type, row) {
            if (data) {
              return `<td><a href="${data}" data-toggle="lightbox" data-title="${row.image_name}"   data-id="14"><img src="${data}" height="50px" width="50px" /></i></a></td>`;
            } else {
              return `<img src="/public/dist/img/no_image.png" height="50px" width="50px" />`;
            }
          }
        },
        { 
          data: 'feedback_text',
          render: function (data, type, row) {
            if (data) {
              return data.length > 150 ? data.substring(0, 150) + '...' : data; 
            }
            return '-';
          }
        },
        { 
          data: 'feedback_id',
          name: 'Action',
          render: function (data, type, row) {
            let html = '';
                html += `<a id="${data}" class="editlink btn btn-info btn-sm" data-toggle="modal" data-target="#modal-update">
                        <i class="fas fa-pencil-alt">
                        </i>
                        Edit
                      </a>`
                html += ` <a id="${data}" class="deletelink btn btn-danger btn-sm" data-toggle="modal" data-target="#modal-delete">
                        <i class="fas fa-trash">
                        </i>
                        Delete
                      </a>`
            return html;
          } 
        },
      ],
    });
    
    feedbacks_table.page(0).draw(false);  
    let feedback_id = 0;

    $(document).on('click', '.deletelink', function (e){      
      if(e.target.id == '') {
        e.target.id = e.currentTarget.id;
      } 
      feedback_id = e.target.id;
    });

    $(document).on('click', '.editlink', async function(e) {
      if(e.target.id == '') {
        e.target.id = e.currentTarget.id;
      } 
      if(e.target.id != '') {
        $('#feedback-form')[0].reset();
        $.ajax({
          type: "GET",
          url: `/feedbacks/edit/${e.target.id}`,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          cache:false,
          processData:false,
          contentType:false,
          success: function (res) {
            if(res.success == false) {
              toastr.error(res.message);
            } else {
              const data = res.data;
              document.getElementById('name').value = data.name;
              document.getElementById('description').value = data.description;
              document.getElementById('feedback_text').value = data.feedback_text;
              if(data.image_name && data.image) {
                document.getElementById('file_name').innerHTML = data.image_name ? data.image_name : 'Choose file';
                $('#image').trigger('change');
                $('#updimage_preview').css('display', 'block').attr('src', `${data.image}`);
              }
              document.getElementById('txtId').value = data.feedback_id;
            }
          },
          error:function(error){
            var err = JSON.parse(error.responseText).message
            toastr.error(err);
          }
        });
      } else {
        toastr.error('Invalid user ID!')
      }
    });

    $('#btnDelete').click(function (){
      $.ajax({
        type: "delete",
        url: `/feedbacks/delete/${feedback_id}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        cache:false,
        processData:false,
        contentType:false,
        success: function (res) {
          if(res.success == false) {
            toastr.error(res.message);
          }
          $('#modal-delete').modal('hide');
          feedbacks_table.page(0).draw(false);  
        },
        error:function(error){
            var err = JSON.parse(error.responseText).message
            toastr.error(err);
        }
      });
    });

    $('#feedback-form').validate({
      rules: {
        name: {
          required: true,
        },
        description: {
          required: true,
        },
        feedback_text: {
          required: true,
        },
      },
      messages: {
        name: {
          required: "Please enter name",
        },
        description: {
          required: "Please provide description",
        },
        feedback_text: {
          required: "Please provide feedback_text",
        },
      },
      submitHandler: function (form, e) {
        e.preventDefault();
    
        let formData = new FormData(form);
    
        $.ajax({
          type: "POST",
          url: `/feedbacks/edit/${$('#txtId').val()}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: formData,
          processData: false,
          contentType: false,
          enctype: "multipart/form-data",
          beforeSend: function () {
          },
          success: function (res) {
            $('#feedback-form')[0].reset();
            if (res.success === true) {
              $('#modal-update').modal('hide');
              toastr.success('Feedback updated successfully!');
              feedbacks_table.page(0).draw(false);
            } else {
              toastr.error(res.message);
            }
          },
          error: function (error) {
            const errMessage = error.responseJSON?.error || "An error occurred";
            toastr.error(errMessage);
          },
          complete: function () {
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

    $('#add-feedback-form').validate({
      rules: {
        name: {
          required: true,
        },
        description: {
          required: true,
        },
        feedback_text: {
          required: true,
        },
      },
      messages: {
        name: {
          required: "Please enter name",
        },
        description: {
          required: "Please provide description",
        },
        feedback_text: {
          required: "Please provide feedback_text",
        },
      },
      submitHandler: function (form, e) {
        e.preventDefault();
    
        let formData = new FormData(form);
        
        $.ajax({
          type: "POST",
          url: "/feedbacks/create/",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: formData,
          processData: false,
          contentType: false,
          enctype: "multipart/form-data",
          beforeSend: function () {
          },
          success: function (res) {
            
            if (res.success === true) {
              $('#modal-create').modal('hide');
              feedbacks_table.page(0).draw(false);
            } else {
              toastr.error(res.message);
            }
          },
          error: function (error) {
            const errMessage = error.responseJSON?.error || "An error occurred";
            toastr.error(errMessage);
          },
          complete: function () {
            toastr.success('Feedback created successfully!');
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
    
  });
    