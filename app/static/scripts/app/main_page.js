$(function () {
    validation();
    showDropdownForm();
    hideLoginFormWhenRegisterFieldFocus();
    showPasswordResetRequestForm();
    showLoginForm();
    setPlaceholders();
    loginFormVisibility();
    passwordResetRequestFormVisibility();
});

function setPlaceholders(){
    $('#user_email').prop('placeholder', "Email");
    $('#login_email').prop('placeholder', "Email");
    $('#login_password').prop('placeholder', "Password");

}

function showDropdownForm(){
    $('a.dropdown_toggle').on('click', function(){
        $('div.dropdown-form-wrapper').slideToggle(100);
    })
}

function showLoginForm(){
    $('#cancel').on('click', function(){
        $('.dropdown-login-form-wrapper').show();
        $('.dropdown_password_reset_request_form_wrapper').hide();
    });
}

function showPasswordResetRequestForm(){
    $('.toggle-password-reset-request-form').on('click', function(){
        $('.dropdown-login-form-wrapper').hide();
        $('.dropdown_password_reset_request_form_wrapper').show();
    });
}

function hideLoginFormWhenRegisterFieldFocus(){
    $('#register_form input').on('focus', function(){
        $('div.dropdown-form-wrapper').slideUp(100);
    });
}

function loginFormVisibility(){
    if($('.login_errors').children().length != 0)
        $('.dropdown-form-wrapper').show();
}

function passwordResetRequestFormVisibility(){
    if($('.password-reset-request-errors').children().length != 0) {
        $('.dropdown-form-wrapper').show();
        $('.dropdown-login-form-wrapper').hide();
        $('.dropdown_password_reset_request_form_wrapper').show();
    }
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

    $('#password_reset_request_form').validate({
        rules: {
            user_email: {
                required: true
            }
        },
        errorPlacement: function(error, element) {
            return false;
        }
    });
}