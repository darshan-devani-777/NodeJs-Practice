$(function () {

  $('#modal-create').on('hidden.bs.modal', function () {
    $('#add-faq-form')[0].reset();
  });  
  
    var faqs_table = $("#faqs_table").DataTable({
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
        url : '/faqs/getFAQs',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      },
      aaSorting: [],
      columns: [
        { 
          data: 'faq_id',
          visible: false,        
          searchable: false
        },
        { 
          data: 'question',
          render: function (data, type, row) {
            if (data) {
              return data.length > 150 ? data.substring(0, 150) + '...' : data; 
            }
            return '-';
          }
        },
        { 
          data: 'answer',
          render: function (data, type, row) {
            if (data) {
              return data.length > 150 ? data.substring(0, 150) + '...' : data; 
            }
            return '-';
          }
        },
        { 
          data: 'faq_id',
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
    
    faqs_table.page(0).draw(false);  
    let faq_id = 0;

    $(document).on('click', '.deletelink', function (e){      
      if(e.target.id == '') {
        e.target.id = e.currentTarget.id;
      } 
      faq_id = e.target.id;
    });

    $(document).on('click', '.editlink', async function(e) {
      if(e.target.id == '') {
        e.target.id = e.currentTarget.id;
      } 
      if(e.target.id != '') {
        $('#faq-form')[0].reset();
        $.ajax({
          type: "GET",
          url: `/faqs/edit/${e.target.id}`,
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
              document.getElementById('question').value = data.question;
              document.getElementById('answer').value = data.answer;
              document.getElementById('txtId').value = data.faq_id;
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
        url: `/faqs/delete/${faq_id}`,
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
          faqs_table.page(0).draw(false);  
        },
        error:function(error){
            var err = JSON.parse(error.responseText).message
            toastr.error(err);
        }
      });
    });

    $('#faq-form').validate({
      rules: {
        question: {
          required: true,
        },
        answer: {
          required: true,
        },
      },
      messages: {
        question: {
          required: "Please enter question",
        },
        answer: {
          required: "Please provide answer",
        },
      },
      submitHandler: function (form, e) {
        e.preventDefault();
    
        let formData = new FormData(form);
    
        $.ajax({
          type: "POST",
          url: `/faqs/edit/${$('#txtId').val()}`,
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
            $('#faq-form')[0].reset();
            if (res.success === true) {
              $('#modal-update').modal('hide');
              toastr.success('FAQ updated successfully!');
              faqs_table.page(0).draw(false);
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

    $('#add-faq-form').validate({
      rules: {
        question: {
          required: true,
        },
        answer: {
          required: true,
        },
      },
      messages: {
        question: {
          required: "Please enter question",
        },
        answer: {
          required: "Please provide answer",
        },
      },
      submitHandler: function (form, e) {
        e.preventDefault();
    
        let formData = new FormData(form);
        
        $.ajax({
          type: "POST",
          url: "/faqs/create/",
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
              faqs_table.page(0).draw(false);
            } else {
              toastr.error(res.message);
            }
          },
          error: function (error) {
            const errMessage = error.responseJSON?.error || "An error occurred";
            toastr.error(errMessage);
          },
          complete: function () {
            toastr.success('FAQ created successfully!');
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
    