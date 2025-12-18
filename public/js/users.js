$(function () {
  $('#modal-create').on('hidden.bs.modal', function () {
    $('#add-user-form')[0].reset();
  });  

    const allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
    $('#updimage').on('change', function () {
      const file = this.files[0];
      const errorElement = $('#file_error');
    
      if (file) {
        if (!allowedFileTypes.includes(file.type)) {
          errorElement.removeClass('d-none').text('Invalid file type. Only images are allowed.');
          this.value = '';
          $('#file_name').text('Choose file');
        } else {
          errorElement.addClass('d-none');  
          $('#file_name').text(file.name);
        }
      }
    });
  
    $('#image').on('change', function () {
      const file = this.files[0];
      const errorElement = $('#create_file_error');
    
      if (file) {
        if (!allowedFileTypes.includes(file.type)) {
          errorElement.removeClass('d-none').text('Invalid file type. Only images are allowed.');
          this.value = '';
          $('#create_file_name').text('Choose file');
        } else {
          errorElement.addClass('d-none');  
          $('#create_file_name').text(file.name);
        }
      }
    });
  
    var users_table = $("#users_table").DataTable({
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
        url : '/users/',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      },
      aaSorting: [],
      columns: [
        { 
          data: 'user_id',
          visible: false,        
          searchable: false
        },
        { 
          data: 'first_name',
          render: function(data, type, row) {
            return row.first_name && row.last_name ? row.first_name + ' ' + row.last_name : '-';
          }
        },
        { data: 'email' },
        { 
          data: 'profile_image',
          render: function (data, type, row) {
            if (data) {
              return `<td><a href="data:image/png;base64,${data}" data-toggle="lightbox" data-title="${row.first_name + ' ' + row.last_name}"   data-id="14"><img src="data:image/png;base64,${data}" height="50px" width="50px" /></i></a></td>`;
            } else {
              return `<img src="/public/dist/img/no_image.png" height="50px" width="50px" />`;
            }
          }
        },
        { 
            data: 'bio',
            render: function(data, type, row) {
              return data ? data : '-';
            }
        },
        { 
          data: 'is_active',
          render: function (data, type, row) {
            if(data) {
              return `<span class="badge bg-success">Active</span>`
            } else {
              return `<span class="badge bg-danger">In-Active</span>`
            }
          }
        },
        { 
          data: 'user_id',
          name: 'Action',
          visible: true,
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
    
    users_table.page(0).draw(false);  
    let user_id = 0;

    $(document).on('click', '.deletelink', function (e){      
      if(e.target.id == '') {
        e.target.id = e.currentTarget.id;
      } 
      user_id = e.target.id;
    });

    $(document).on('click', '.editlink', async function(e) {
      if(e.target.id == '') {
        e.target.id = e.currentTarget.id;
      } 
      if(e.target.id != '') {
        $('#user-form')[0].reset();
        $.ajax({
          type: "get",
          url: `/users/editUser/${e.target.id}`,
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
              document.getElementById('txtFName').value = data.first_name;
              document.getElementById('txtLName').value = data.last_name;
              document.getElementById('txtEmail').value = data.email;
              document.getElementById('updated_isActive').checked = data.is_active || 0;
              document.getElementById('txtId').value = data.user_id;
              document.getElementById('txtBio').value = data?.bio;
              document.getElementById('file_name').innerHTML = data.image_name ? data.image_name : 'Choose file';
              
              data.email_subscription.replace(/"/g, '').split(',').map(function (x) {
                document.getElementById(`upd_chk_${x}`).checked = true
              })
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
        url: `/users/deleteUser/${user_id}`,
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
          users_table.page(0).draw(false);  
          // return window.location.replace("/users/admin/list");
        },
        error:function(error){
            var err = JSON.parse(error.responseText).message
            toastr.error(err);
        }
      });
    });
    

    $('#user-form').validate({
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
        bio: {
          required: true,
        },
      },
      messages: {
        email: {
          required: "Please enter an email address",
          email: "Please enter a valid email address",
        },
        first_name: {
          required: "Please provide a first name",
        },
        last_name: {
          required: "Please provide a last name",
        },
        bio: {
          required: "Please provide a bio",
        },
      },
      submitHandler: function (form, e) {
        e.preventDefault();
    
        let formData = new FormData(form);
        formData.set('is_active', $('#updated_isActive').is(':checked') ? 1 : 0);

        let checkedValues = $('.email-chk-upd:checked').map(function() {
          return $(this).attr('id').split('_')[2];
        }).get();
        formData.append('email_subscription', checkedValues);
    
        $.ajax({
          type: "PUT",
          url: `/users/editUser/${$('#txtId').val()}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: formData,
          processData: false,
          contentType: false,
          enctype: "multipart/form-data",
          beforeSend: function () {
            // $('#modal-overlay').modal('show');
          },
          success: function (res) {
            $('#user-form')[0].reset();
            if (res.success === true) {
              // $('#modal-overlay').modal('hide');
              $('#modal-update').modal('hide');
              toastr.success('User updated successfully!');
              users_table.page(0).draw(false);
              // window.location.replace("/users/admin/list");
            } else {
              toastr.error(res.message);
            }
          },
          error: function (error) {
            const errMessage = error.responseJSON?.error || "An error occurred";
            // $('#modal-overlay').modal('hide');
            toastr.error(errMessage);
          },
          complete: function () {
            // $('#modal-overlay').modal('hide');
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

    $('#add-user-form').validate({
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
        bio: {
          required: true,
        },
      },
      messages: {
        email: {
          required: "Please enter an email address",
          email: "Please enter a valid email address",
        },
        first_name: {
          required: "Please provide a first name",
        },
        last_name: {
          required: "Please provide a last name",
        },
        bio: {
          required: "Please provide a bio",
        },
      },
      submitHandler: function (form, e) {
        e.preventDefault();
    
        let formData = new FormData(form);
        formData.set('is_active', $('#isActive').is(':checked') ? 1 : 0);
        
        let checkedValues = $('.email-chk:checked').map(function() {
          return $(this).attr('id').split('_')[1];
        }).get();
        formData.append('email_subscription', checkedValues);
    
        $.ajax({
          type: "POST",
          url: "/users/createUser/",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: formData,
          processData: false,
          contentType: false,
          enctype: "multipart/form-data",
          beforeSend: function () {
            // $('#modal-overlay').modal('show');
          },
          success: function (res) {
            $('#add-user-form')[0].reset();
            if (res.success === true) {
              // $('#modal-overlay').modal('hide');
              $('#modal-create').modal('hide');
              toastr.success('User created successfully!');
              users_table.page(0).draw(false);
              // window.location.replace("/users/admin/list");
            } else {
              toastr.error(res.message);
            }
          },
          error: function (error) {
            const errMessage = error.responseJSON?.error || "An error occurred";
            // $('#modal-overlay').modal('hide');
            toastr.error(errMessage);
          },
          complete: function () {
            // $('#modal-overlay').modal('hide');
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
    