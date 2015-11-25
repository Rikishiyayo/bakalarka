$(function () {
    validation();
    showLoginForm();
    loginFormVisibility()
});

function loginFormVisibility(){
    if($('.login_errors').children().length != 0)
        $('.dropdown_login_form_wrapper').show();
}

function showLoginForm(){
    $('a.dropdown_toggle').on('click', function(){
        $('div.dropdown_login_form_wrapper').slideToggle(100);
    })
}

function validation() {
    $('#register_form').validate({
        rules: {
            register_email: {
                required: true,
                email: true,
                remote: "/is_email_available"
            },
            username: {
                required: true,
                minlength: 5,
                remote: "/is_username_available"
            },
            register_password: {
                required: true,
                minlength: 8
            },
            password2: {
                required: true,
                minlength: 8,
                equalTo: "#register_password"
            }
        },
        messages: {
            password2: {
                equalTo: "Please enter the same password again."
            },
            register_email: {
                remote: "Email address is taken, please use a different one."
            },
            username: {
                remote: "Username is taken, please use a different one."
            }
        },
        errorElement: 'span'
    });

    $('#login_form').validate({
        rules: {
            login_email: {
                required: true
            },
            login_password: {
                required: true
            }
        },
        errorPlacement: function(error, element) {
            return false;
        }
    });
}