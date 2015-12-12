from flask import render_template, redirect, flash, jsonify, request, current_app, url_for
from flask.ext.login import login_required, current_user
from . import main
from app.forms import SaxsExperimentForm, LoginForm, RegistrationForm, PasswordResetRequestForm
from app.bussinesLogic import DirectoryAndFileReader, DirectoryAndFileWriter
from app.models import User


@main.route('/')
@main.route('/main_page')
def main_page():
    if current_user.is_authenticated:
        if current_user.confirmed and current_user.active:
            return redirect('/home')
        else:
            return redirect(url_for('userManagement.unconfirmed'))

    if request.args.get("next"):
        flash(current_app.config['LOGIN_BEFORE_CONFIRMATION'], "info")

    return render_template('main_page.html', l_form=LoginForm(), r_form=RegistrationForm(),
                           pr_form=PasswordResetRequestForm())


@main.route('/home', methods=['GET', 'POST'])
@login_required
def home():
    form = SaxsExperimentForm()

    if form.validate_on_submit():
        DirectoryAndFileWriter.create_experiment(form, str(current_user.id))
        flash(current_app.config['EXPERIMENT_SUBMITTED'], "info")
        return redirect('/home')

    return render_template('home.html', form=form,
                           exps=DirectoryAndFileReader.get_experiments(current_user.id))


@main.route('/get_experiments')
def get_experiments():
    return jsonify(exps = DirectoryAndFileReader.get_experiments(current_user.id))


@main.route('/is_email_available')
def is_email_available():
    user = User.query.filter_by(email=request.args.get("register_email")).first()

    if user is not None:
        return "false"

    return "true"


@main.route('/is_username_available')
def is_username_available():
    user = User.query.filter_by(username=request.args.get("username")).first()

    if user is not None:
        return "false"

    return "true"


@main.route('/view_experiment/<user_id>/<exp_guid>')
@login_required
def view_experiment(user_id, exp_guid):
    DirectoryAndFileWriter.get_model_data(user_id, exp_guid)
    return render_template("view_experiment.html", exp_details=DirectoryAndFileReader.get_experiment_parameters(
        user_id, exp_guid))


@main.route('/get_experiment_data')
@login_required
def get_experiment_data():
    user_id = request.args.get("user_id")
    exp_guid = request.args.get("exp_guid")
    return jsonify(weights=DirectoryAndFileReader.get_weights(user_id, exp_guid),
                   models=DirectoryAndFileReader.get_computed_values_for_models(user_id, exp_guid),
                   metadata=DirectoryAndFileReader.get_experiment_result_data(user_id, exp_guid))


@main.before_request
def before_request():
    if current_user.is_authenticated and request.endpoint == 'main.home' and \
            (not current_user.confirmed or not current_user.active):
        return redirect(url_for('userManagement.unconfirmed'))
