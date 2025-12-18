function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function isAdminUser() {
    const userCookie = getCookie('logged_in_user');
    if (userCookie) {
        try {
            const user = JSON.parse(decodeURIComponent(userCookie));
            return user.is_admin === true;
        } catch (e) {
            return false;
        }
    }
    return false;
}

$(document).ready(function () {
    $.validator.addMethod("extension", function(value, element, param) {
        param = typeof param === "string" ? param.replace(/,/g, '|') : 'png|jpe?g|gif|webp';
        return this.optional(element) || value.match(new RegExp("\\.(" + param + ")$", "i"));
    }, $.validator.format("Please upload a file with a valid extension ({0})."));

    $.validator.addMethod("summernoteRequired", function(value, element) {
        var content = $(element).summernote('code');
        var textContent = $(content).text().trim();
        return textContent.length > 0;
    }, "Please enter blog content");

    $.validator.addMethod("summernoteContent", function(value, element, param) {
        var content = $(element).summernote('code');
        var textContent = $(content).text().trim();
        if (!textContent || textContent.length === 0) {
            return false;
        }
        return this.optional(element) || textContent.length >= param;
    }, $.validator.format("Content must be at least {0} characters long."));

    $('#content').summernote({
        height: 300,
        toolbar: [
            ['font', ['bold', 'underline', 'italic', 'clear']],
            ['fontname', ['fontname']],
            ['fontsize', ['fontsize']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['height', ['height']],
            ['table', ['table']],
            ['insert', ['link', 'picture', 'video']],
            ['view', ['fullscreen', 'codeview', 'help']]
        ],
        fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Nunito', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana'],
        fontNamesIgnoreCheck: ['Nunito'],
        fontSizes: ['8', '9', '10', '11', '12', '14', '16', '18', '24', '36'],
        callbacks: {
            onImageUpload: function(files) {
                console.log('Image upload:', files);
            }
        }
    });

    $('#editContent').summernote({
        height: 300,
        toolbar: [
            ['font', ['bold', 'underline', 'italic', 'clear']],
            ['fontname', ['fontname']],
            ['fontsize', ['fontsize']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['height', ['height']],
            ['table', ['table']],
            ['insert', ['link', 'picture', 'video']],
            ['view', ['fullscreen', 'codeview', 'help']]
        ],
        fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Nunito', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana'],
        fontNamesIgnoreCheck: ['Nunito'],
        fontSizes: ['8', '9', '10', '11', '12', '14', '16', '18', '24', '36'],
        callbacks: {
            onInit: function() {
                var $editor = $(this);
                $editor.summernote('fontSize', '16'); 
            },
            onImageUpload: function(files) {
                console.log('Image upload:', files);
            }
        }
    });

    $('#content').on('summernote.change', function() {
        $(this).valid();
    });

    $('#editContent').on('summernote.change', function() {
        $(this).valid();
    });
    


    if (isAdminUser()) {
        $('#publishOption').show();
    }
    
    var table = $('#blogs_table').DataTable({
        processing: true,
        serverSide: false,
        pageLength: 25, 
        lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]], 
        ajax: {
            url: '/blog/getAllBlogs?limit=1000',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getCookie('accessToken')
            },
            dataSrc: function (json) {
                return json.data.blogs || [];
            }
        },
        initComplete: function() {
            if (isAdminUser()) {
                var adminInfo = '<div class="alert alert-info alert-sm mt-2 mb-0"><i class="fas fa-info-circle"></i> Admin view: Showing all blogs (published and unpublished)</div>';
                $('#blogs_table_wrapper .dataTables_filter').after(adminInfo);
            }
        },
        columns: [
            { data: 'title' },
            { data: 'description' },
            { 
                data: 'image',
                render: function(data) {
                    if (data) {
                        return `<img src="${data}" alt="Blog Image" style="width: 50px; height: 50px; object-fit: cover;border-radius:4px">`;
                    }
                    return 'No Image';
                }
            },
            { data: 'type' },
            { 
                data: 'content',
                render: function(data) {
                    if (data) {
                        var plainText = data.replace(/<[^>]*>/g, '');
                        return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
                    }
                    return '';
                }
            },
            { 
                data: 'createdAt',
                render: function(data) {
                    return new Date(data).toLocaleDateString();
                }
            },
            { 
                data: 'user',
                render: function(data) {
                    return data ? `${data.first_name} ${data.last_name}` : 'Unknown';
                }
            },
            { 
                data: 'is_published',
                render: function(data) {
                    if (data) {
                        return '<span class="badge badge-success">Published</span>';
                    } else {
                        return '<span class="badge badge-danger">Not published</span>';
                    }
                }
            },
            {
                data: 'blog_id',
                render: function(data) {
                    return `
                        <div class="d-flex" style="gap: 10px;">
                            <button class="btn btn-sm btn-primary edit-btn" data-id="${data}" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger delete-btn" data-id="${data}" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                }
            }
        ],
        order: [[0, 'desc']]
    });


    $("#createBlogForm").validate({
        onkeyup: false,
        onfocusout: function(element) {
            if (!this.checkable(element)) {
                this.element(element);
            }
        },
        onchange: function(element) {
            if (!this.checkable(element)) {
                this.element(element);
            }
        },
        rules: {
            title: {
                required: true,
                minlength: 3,
                maxlength: 255
            },
            description: {
                required: true,
                minlength: 10,
                maxlength: 500
            },
            content: {
                summernoteRequired: true,
                summernoteContent: 20
            },
            type: {
                required: true
            },
            file: {
                extension: "jpg|jpeg|png|gif|webp"
            }
        },
        messages: {
            title: {
                required: "Please enter blog title",
                minlength: "Title must be at least 3 characters long",
                maxlength: "Title cannot exceed 255 characters"
            },
            description: {
                required: "Please enter blog description",
                minlength: "Description must be at least 10 characters long",
                maxlength: "Description cannot exceed 500 characters"
            },
            content: {
                required: "Please enter blog content",
                summernoteContent: "Content must be at least 20 characters long"
            },
            type: {
                required: "Please select blog type"
            },
            file: {
                extension: "Please upload only image files (jpg, jpeg, png, gif, webp)"
            }
        },
        submitHandler: function (form, e) {
            e.preventDefault();
            
            var htmlContent = $('#content').summernote('code');
            
            var formData = new FormData(form);
            formData.set('content', htmlContent);
            
            $.ajax({
                url: '/blog/create',
                type: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + getCookie('accessToken')
                },
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    if (response.success) {
                        $('#modal-create').modal('hide');
                        $('#createBlogForm')[0].reset();
                        $('#content').summernote('code', '');
                        table.ajax.reload();
                        toastr.success('Blog created successfully!');
                    } else {
                        toastr.error(response.message || 'Error creating blog');
                    }
                },
                error: function(xhr) {
                    var error = xhr.responseJSON;
                    toastr.error(error.message || 'Error creating blog');
                }
            });
        },
        errorElement: "span",
        errorPlacement: function (error, element) {
            error.addClass("invalid-feedback");
            element.closest(".form-group").append(error);
        },
        highlight: function (element) {
            $(element).addClass("is-invalid");
            if ($(element).attr('id') === 'content') {
                $('#content').closest('.note-editor').addClass('is-invalid');
            }
        },
        unhighlight: function (element) {
            $(element).removeClass("is-invalid");
            if ($(element).attr('id') === 'content') {
                $('#content').closest('.note-editor').removeClass('is-invalid').addClass('is-valid');
            }
        }
    });

    // Edit Blog
    $(document).on('click', '.edit-btn', function() {
        var blogId = $(this).data('id');
        
        $.ajax({
            url: '/blog/getById/' + blogId,
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getCookie('accessToken')
            },
            success: function(response) {
                if (response.success) {
                    var blog = response.data[0];
                    $('#editBlogId').val(blog.blog_id);
                    $('#editTitle').val(blog.title);
                    $('#editDescription').val(blog.description);
                    $('#editContent').summernote('code', blog.content);
                    $('#editType').val(blog.type);
                    $('#editIsPublished').prop('checked', blog.is_published);
                    $('#editIsPublishedHidden').val(blog.is_published);
                    
                    if (blog.image) {
                        $('#editImagePreview').html(`<img src="${blog.image}" alt="Current Image" style="max-width: 200px;">`);
                    } else {
                        $('#editImagePreview').html('<p>No image</p>');
                    }
                    
                    $('#modal-edit').modal('show');
                } else {
                    toastr.error(response.message || 'Error fetching blog');
                }
            },
            error: function(xhr) {
                var error = xhr.responseJSON;
                toastr.error(error.message || 'Error fetching blog');
            }
        });
    });


    $("#editBlogForm").validate({
        onkeyup: false,
        onfocusout: function(element) {
            if (!this.checkable(element)) {
                this.element(element);
            }
        },
        onchange: function(element) {
            if (!this.checkable(element)) {
                this.element(element);
            }
        },
        rules: {
            title: {
                required: true,
                minlength: 3,
                maxlength: 255
            },
            description: {
                required: true,
                minlength: 10,
                maxlength: 500
            },
            content: {
                summernoteRequired: true,
                summernoteContent: 20
            },
            type: {
                required: true
            },
            file: {
                extension: "jpg|jpeg|png|gif|webp"
            }
        },
        messages: {
            title: {
                required: "Please enter blog title",
                minlength: "Title must be at least 3 characters long",
                maxlength: "Title cannot exceed 255 characters"
            },
            description: {
                required: "Please enter blog description",
                minlength: "Description must be at least 10 characters long",
                maxlength: "Description cannot exceed 500 characters"
            },
            content: {
                required: "Please enter blog content",
                summernoteContent: "Content must be at least 20 characters long"
            },
            type: {
                required: "Please select blog type"
            },
            file: {
                extension: "Please upload only image files (jpg, jpeg, png, gif, webp)"
            }
        },
        submitHandler: function (form, e) {
            e.preventDefault();
            
            var blogId = $('#editBlogId').val();
            
            var htmlContent = $('#editContent').summernote('code');
            
            var formData = new FormData(form);
            formData.set('content', htmlContent);
            
            if (isAdminUser()) {
                var isPublished = $('#editIsPublished').is(':checked');
                formData.set('is_published', isPublished);
                console.log('Debug - Frontend is_published value:', isPublished);
            }
            
            $.ajax({
                url: '/blog/update/' + blogId,
                type: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + getCookie('accessToken')
                },
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    if (response.success) {
                        $('#modal-edit').modal('hide');
                        table.ajax.reload();
                        toastr.success('Blog updated successfully!');
                    } else {
                        toastr.error(response.message || 'Error updating blog');
                    }
                },
                error: function(xhr) {
                    var error = xhr.responseJSON;
                    toastr.error(error.message || 'Error updating blog');
                }
            });
        },
        errorElement: "span",
        errorPlacement: function (error, element) {
            error.addClass("invalid-feedback");
            element.closest(".form-group").append(error);
        },
        highlight: function (element) {
            $(element).removeClass("is-valid").addClass("is-invalid");
            if ($(element).attr('id') === 'editContent') {
                $('#editContent').closest('.note-editor').addClass('is-invalid');
            }
        },
        unhighlight: function (element) {
            $(element).removeClass("is-invalid").addClass("is-valid");
            if ($(element).attr('id') === 'editContent') {
                $('#editContent').closest('.note-editor').removeClass('is-invalid').addClass('is-valid');
            }
        }
    });

    // Delete Blog
    $(document).on('click', '.delete-btn', function() {
        var blogId = $(this).data('id');
        
        if (confirm('Are you sure you want to delete this blog?')) {
            $.ajax({
                url: '/blog/delete/' + blogId,
                type: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + getCookie('accessToken')
                },
                success: function(response) {
                    if (response.success) {
                        table.ajax.reload();
                        toastr.success('Blog deleted successfully!');
                    } else {
                        toastr.error(response.message || 'Error deleting blog');
                    }
                },
                error: function(xhr) {
                    var error = xhr.responseJSON;
                    toastr.error(error.message || 'Error deleting blog');
                }
            });
        }
    });

    $('#editIsPublished').on('change', function() {
        $('#editIsPublishedHidden').val($(this).is(':checked'));
    });
    $('#modal-create').on('hidden.bs.modal', function() {
        $('#createBlogForm')[0].reset();
        $('#content').summernote('code', '');
        $('#createBlogForm .form-control').removeClass('is-invalid is-valid');
        $('#createBlogForm .note-editor').removeClass('is-invalid is-valid');
        $('#createBlogForm .invalid-feedback').remove();
    });

    $('#modal-edit').on('hidden.bs.modal', function() {
        $('#editBlogForm')[0].reset();
        $('#editContent').summernote('code', '');
        $('#editImagePreview').html('');
        $('#editBlogForm .form-control').removeClass('is-invalid is-valid');
        $('#editBlogForm .note-editor').removeClass('is-invalid is-valid');
        $('#editBlogForm .invalid-feedback').remove();
    });
});
