$(function () {
    validation();
});

function validation() {
    $('#register_form').validate({
        onfocusout: function (element) {
            this.element(element);
        },
        rules: {
            username: {
                required: true,
                minlength: 5
            },
            email: {
                required: true,
                email: true
            },
            comment: {
                required: true,
                minlength: 20
            }
        },
        errorElement: 'span',
        errorPlacement: function(error, element) {
            if (element.attr("id") == "comment" )
                error.appendTo("#comment-error");
            else
                error.insertAfter(element)
        },
        highlight: function(element, errorClass, validClass) {
            $(element).addClass(errorClass).removeClass(validClass);
            $(element.form).find("label[for=" + element.id + "]").addClass(errorClass);
        },
        unhighlight: function(element, errorClass, validClass) {
            $(element).removeClass(errorClass).addClass(validClass);
            $(element.form).find("label[for=" + element.id + "]").removeClass(errorClass);
        }
    });
}