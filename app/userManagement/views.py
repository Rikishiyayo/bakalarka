from flask import render_template, redirect, flash, request, current_app, url_for
from .. import db
from app.userManagement import userMngmt
from app.forms import RegistrationForm
from app.models import User
from app.email import send_email


@userMngmt.route('/sign_up', methods=['GET', 'POST'])
def sign_up():
    r_form = RegistrationForm(request.form)

    if r_form.validate_on_submit():
        eppn = request.environ["HTTP_EPPN"]
        username = request.environ["HTTP_CN"]
        user = User(username=username, eppn=eppn, role_id=2)
        db.session.add(user)
        db.session.commit()
        # send_email(user.email, 'Confirm Your Account', 'mail/confirm', user=user, token=token)
        return redirect('/unconfirmed')

    return render_template('sign_up.html', r_form=r_form)


@userMngmt.route('/unconfirmed')
def unconfirmed():
    eppn = request.environ["HTTP_EPPN"]
    if is_user_registered(eppn) and is_user_confirmed(eppn):
        return redirect('/home')

    return render_template('unconfirmed.html')


def is_user_registered(eppn):
    user = User.query.filter_by(eppn=eppn).first()
    return user is not None


def is_user_confirmed(eppn):
    user = User.query.filter_by(eppn=eppn).first()
    return user is not None and user.confirmed
