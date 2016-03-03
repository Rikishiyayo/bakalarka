from flask import render_template, redirect, flash, jsonify, request, current_app, url_for
from flask.ext.login import login_required, current_user
from . import main
from app.forms import Computation, LoginForm, RegistrationForm, PasswordResetRequestForm
from app.bussinesLogic import DirectoryAndFileReader, DirectoryAndFileWriter
from app.models import User


@main.route('/')
@main.route('/main_page')
def main_page():
    if current_user.is_authenticated:       # if current user is authenticated
        if current_user.confirmed and current_user.active:      # if current user is confirmed and active, redirect him to a home page
            return redirect('/home')
        else:
            return redirect(url_for('userManagement.unconfirmed'))      # redirect him to a unconfirmed page

    if request.args.get("next"):        # if user is trying to get to a page which requires users to be authenticated, he is redirected to a main page and asked to log in
        flash(current_app.config['LOGIN_BEFORE_CONFIRMATION'], "info")

    return render_template('main_page.html', l_form=LoginForm(), r_form=RegistrationForm(),
                           pr_form=PasswordResetRequestForm())


@main.route('/home', methods=['GET', 'POST'])
@login_required
def home():
    form = Computation()

    if form.validate_on_submit():       #this block of code is executed when browser sent POST request(user submitted form)
        DirectoryAndFileWriter.create_experiment(form, str(current_user.id))
        flash(current_app.config['EXPERIMENT_SUBMITTED'], "info")
        return redirect('/home')

    return render_template('home.html', form=form,
                           pages=DirectoryAndFileReader.get_pagination_controls_count(current_user.id),
                           comps=DirectoryAndFileReader.get_subset_of_computations_for_one_page(current_user.id, 0, '0', 0, {}))


@main.route('/get_experiments/<page>/<sort_option>/<sort_order>')
def get_experiments(page, sort_option, sort_order):
    return jsonify(comps=DirectoryAndFileReader.get_subset_of_computations_for_one_page(current_user.id, int(page), sort_option, int(sort_order), get_filters()),
                   pages=len(DirectoryAndFileReader.get_pagination_controls_count(computations=DirectoryAndFileReader.get_computations(current_user.id, sort_option, int(sort_order), get_filters()))))


@main.route('/view_experiment/<user_id>/<comp_guid>')
@login_required
def view_experiment(user_id, comp_guid):
    DirectoryAndFileWriter.get_model_data(user_id, comp_guid)
    return render_template("view_experiment.html", best_results=DirectoryAndFileReader.get_best_solutions_of_computation(user_id, comp_guid),
                         computation_details=DirectoryAndFileReader.get_computation_parameters(user_id, comp_guid))


@main.route('/get_experiment_data')
@login_required
def get_experiment_data():
    user_id = request.args.get("user_id")
    comp_guid = request.args.get("comp_guid")
    json = jsonify(weights=DirectoryAndFileReader.get_weights(user_id, comp_guid),
                    computedCurves=DirectoryAndFileReader.get_computed_curves(user_id, comp_guid),
                    experimentData=DirectoryAndFileReader.get_experiment_data(user_id, comp_guid))
                    # metadata=DirectoryAndFileReader.get_computations_result_data(user_id, comp_guid))
    return json


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


@main.before_request
def before_request():
    if current_user.is_authenticated and request.endpoint == 'main.home' and \
            (not current_user.confirmed or not current_user.active):
        return redirect(url_for('userManagement.unconfirmed'))


def get_filters():
    search_filters = {}
    for key in ["title", "date", "progress", "status"]:
        if request.args.get(key) is not None:
            search_filters[key] = request.args.get(key)
    return search_filters
