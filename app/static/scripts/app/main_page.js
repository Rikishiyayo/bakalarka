$(function () {
    validation();
    showDropdownElement();
    hideDropdownElementWhenRegisterFieldHasFocus();
    showPasswordResetRequestForm();
    showLoginForm();
    setPlaceholders();
    loginFormVisibility();
    passwordResetRequestFormVisibility();
    setUsername();
});

function setUsername() {
    $('#username').val($('#username_hid_inp').val());
}

//sets HTML placeholder attribute for specified textboxes
function setPlaceholders(){
    $('#user_email').prop('placeholder', "Email");
    $('#login_email').prop('placeholder', "Email");
    $('#login_password').prop('placeholder', "Password");

}

//this function shows dropdown element, which displays either login form or password reset request form
function showDropdownElement(){
    $('a.dropdown_toggle').on('click', function(){
        $('div.dropdown-form-wrapper').slideToggle(100);
    })
}

//this function shows login form
function showLoginForm(){
    $('#cancel').on('click', function(){
        $('.dropdown-login-form-wrapper').show();
        $('.dropdown_password_reset_request_form_wrapper').hide();
    });
}

//this function shows password reset request form
function showPasswordResetRequestForm(){
    $('.toggle-password-reset-request-form').on('click', function(){
        $('.dropdown-login-form-wrapper').hide();
        $('.dropdown_password_reset_request_form_wrapper').show();
    });
}

//this function hides dropdown element when field in register form has focus
function hideDropdownElementWhenRegisterFieldHasFocus(){
    $('#register_form input').on('focus', function(){
        $('div.dropdown-form-wrapper').slideUp(100);
    });
}

//show login form when it has validation errors
function loginFormVisibility(){
    if($('.login_errors').children().length != 0)
        $('.dropdown-form-wrapper').show();
}

//show password reset request form when it has validation errors
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
            username: {
                required: true
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