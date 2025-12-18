$(function () {

    $('#modal-create').on('hidden.bs.modal', function () {
      $('#add-tag-form')[0].reset();
    });  
    
      var tags_table = $("#tags_table").DataTable({
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
          url : '/tags/getTAGs',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        },
        aaSorting: [],
        columns: [
          { 
            data: 'tag_id',
            visible: false,        
            searchable: false
          },
          { 
            data: 'tag_name',
            render: function (data, type, row) {
              if (data) {
                return data.length > 150 ? data.substring(0, 150) + '...' : data; 
              }
              return '-';
            }
          },
          { 
            data: 'tag_id',
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
      
      tags_table.page(0).draw(false);  
      let tag_id = 0;
  
      $(document).on('click', '.deletelink', function (e){      
        if(e.target.id == '') {
          e.target.id = e.currentTarget.id;
        } 
        tag_id = e.target.id;
      });
  
      $(document).on('click', '.editlink', async function(e) {
        if(e.target.id == '') {
          e.target.id = e.currentTarget.id;
        } 
        if(e.target.id != '') {
          $('#tag-form')[0].reset();
          $.ajax({
            type: "GET",
            url: `/tags/edit/${e.target.id}`,
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
                document.getElementById('tag_name').value = data.tag_name;
                document.getElementById('txtId').value = data.tag_id;
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
          url: `/tags/delete/${tag_id}`,
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
            tags_table.page(0).draw(false);  
          },
          error:function(error){
              var err = JSON.parse(error.responseText).error
              toastr.error(err);
          }
        });
      });
  
      $('#tag-form').validate({
        rules: {
          tag_name: {
            required: true,
            pattern: /\S+/ ,
          },
        },
        messages: {
          tag_name: {
            required: "Please enter tag name",
            pattern: "Please enter a valid tag name",
          },
        },
        submitHandler: function (form, e) {
          e.preventDefault();
      
          let formData = new FormData(form);
      
          $.ajax({
            type: "POST",
            url: `/tags/edit/${$('#txtId').val()}`,
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
              $('#tag-form')[0].reset();
              if (res.success === true) {
                $('#modal-update').modal('hide');
                toastr.success('TAG updated successfully!');
                tags_table.page(0).draw(false);
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
  
      $('#add-tag-form').validate({
        rules: {
          tag_name: {
            required: true,
            pattern: /\S+/ ,
          },
        },
        messages: {
          tag_name: {
            required: "Please enter tag name",
            pattern: "Please enter a valid tag name",
          },
        },
        submitHandler: function (form, e) {
          e.preventDefault();
      
          let formData = new FormData(form);
          
          $.ajax({
            type: "POST",
            url: "/tags/create/",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            data: JSON.stringify(Object.fromEntries(formData)),
            processData: false,
            contentType: false,
            // enctype: "multipart/form-data",
            beforeSend: function () {
            },
            success: function (res) {
              
              if (res.success === true) {
                $('#modal-create').modal('hide');
                tags_table.page(0).draw(false);
              } else {
                toastr.error(res.message);
              }
            },
            error: function (error) {
              const errMessage = error.responseJSON?.error || "An error occurred";
              toastr.error(errMessage);
            },
            complete: function () {
              toastr.success('TAG created successfully!');
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
      