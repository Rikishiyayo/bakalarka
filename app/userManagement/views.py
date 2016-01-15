from flask import render_template, redirect, flash, request, current_app, url_for
from flask.ext.login import login_required, current_user, login_user, logout_user
from .. import db
from app.userManagement import userMngmt
from app.forms import LoginForm, PasswordResetForm, RegistrationForm, PasswordResetRequestForm
from app.bussinesLogic import DirectoryAndFileWriter
from app.models import User
from app.email import send_email


@userMngmt.route('/login', methods=['POST'])
def login():
    l_form = LoginForm(request.form)

    if l_form.validate_on_submit():
        user = User.query.filter_by(email=l_form.login_email.data).first()
        if user is not None and user.verify_password(l_form.login_password.data):       #if user with specified email exists and submited password is correct
            login_user(user, l_form.remember_me.data)
            target = request.args.get("next")
            if target is not None:
                return redirect(target)
            else:
                return redirect('/home')

        flash(current_app.config['LOGIN_ERROR'], "login_error")

    return render_template('main_page.html', l_form=l_form, r_form=RegistrationForm(),
                            pr_form=PasswordResetRequestForm())


@userMngmt.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect('/main_page')


@userMngmt.route('/register', methods=['POST'])
def register():
    r_form = RegistrationForm(request.form)

    if r_form.validate_on_submit():
        user = User(email=r_form.register_email.data, username=r_form.username.data, password=r_form.register_password.data, role_id=2)
        db.session.add(user)
        db.session.commit()
        token = user.generate_confirmation_token()
        send_email(user.email, 'Confirm Your Account', 'mail/confirm', user=user, token=token)
        flash(current_app.config['REGISTRATION_SUCCESSFUL'], "info")
        return redirect('/main_page')

    return render_template('main_page.html', l_form=LoginForm(), r_form=r_form,
                           pr_form=PasswordResetRequestForm())

@userMngmt.route('/confirm/<token>')
@login_required
def confirm(token):
    if current_user.confirmed:      #if user is already confirmed, redirect him to his home page
        return redirect('/home')

    if current_user.confirm(token):     #succesfully confirmed user
        flash(current_app.config['ACCOUNT_CONFIRMATION'], "info")
        DirectoryAndFileWriter.create_user_directory(current_user.id)
        return redirect('/home')
    else:       #confirmation wasnt successfull
        flash(current_app.config['ACCOUNT_FAILED_CONFIRMATION'], "info")
        return redirect(url_for('userManagement.unconfirmed'))


@userMngmt.route('/unconfirmed')
@login_required
def unconfirmed():
    if current_user.is_anonymous or (current_user.confirmed and current_user.active):
        return redirect('/main_page')

    return render_template('unconfirmed.html')


@userMngmt.route('/confirm')
@login_required
def resend_confirmation():
    token = current_user.generate_confirmation_token()
    send_email(current_user.email, 'Confirm Your Account', 'mail/confirm', user=current_user, token=token)
    flash(current_app.config['CONFIRMATION_MAIL_SENT'], "info")
    return redirect(url_for('userManagement.unconfirmed'))


@userMngmt.route('/reset', methods=['POST'])
def password_reset_request():
    if not current_user.is_anonymous:       #if current user is not anonymous, redirect him to home page
        return redirect('/home')
    form = PasswordResetRequestForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.user_email.data).first()
        if user:
            token = user.generate_reset_token()
            send_email(user.email, 'Reset Your Password', 'mail/reset_password', user=user, token=token)
            flash(current_app.config['PASSWORD_RESET_MAIL_SENT'], 'info')
            return redirect('/main_page')

        flash(current_app.config['PASSWORD_RESET_FAILED_USER_DOESNT_EXIST'], 'password_reset_request_error')

    return render_template('main_page.html', l_form=LoginForm(), r_form=RegistrationForm(),
                           pr_form=form)


@userMngmt.route('/password_reset/<token>', methods=['GET', 'POST'])
def password_reset(token):
    if not current_user.is_anonymous:        #if current user is not anonymous, redirect him to home page
        return redirect('/home')

    form = PasswordResetForm()
    if form.validate_on_submit():       #tries to reset password
        user = User.query.filter_by(email=form.user_email.data).first()
        if user is None:
            flash(current_app.config['PASSWORD_RESET_FAILED_USER_DOESNT_EXIST'], 'info')
            return redirect('main_page')

        if user.reset_password(token, form.new_password.data):
            flash(current_app.config['PASSWORD_RESET_SUCCESSFUL'], 'info')
            return redirect('/main_page')
        else:
            flash(current_app.config['PASSWORD_RESET_FAILED'], 'info')
            return redirect('/main_page')

    return render_template('password_reset.html', form=form)        #render password_reset page for GET request