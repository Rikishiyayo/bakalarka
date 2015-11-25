from flask import render_template, redirect, flash, jsonify, request
from flask.ext.login import login_user, logout_user, login_required, current_user
from app import app, db
from app.forms import SaxsExperimentForm, LoginForm, RegistrationForm
from app.bussinesLogic import DirectoryAndFileReader, DirectoryAndFileWriter
from app.models import User


@app.route('/main_page')
@app.route('/')
def main_page():    
    if current_user.is_authenticated:
        return render_template('home.html', form=SaxsExperimentForm(),
                               exps=DirectoryAndFileReader.get_experiments(current_user.id))
    
    return render_template('main_page.html', l_form=LoginForm(), r_form=RegistrationForm())


@app.route('/home', methods=['GET', 'POST'])
@app.route('/', methods=['GET', 'POST'])
@login_required
def home():
    form = SaxsExperimentForm()

    if form.validate_on_submit():
        DirectoryAndFileWriter.create_experiment(form, str(current_user.id))
        flash("experiment submited")
        return redirect('/home')

    return render_template('home.html', form=form,
                           exps=DirectoryAndFileReader.get_experiments(current_user.id))


@app.route('/get_experiments')
def get_experiments():
    return jsonify(exps = DirectoryAndFileReader.get_experiments(current_user.id))


@app.route('/is_email_available')
def is_email_available():
    user = User.query.filter_by(email=request.args.get("register_email")).first()
    if user is not None:
        return "false"
    return "true"


@app.route('/is_username_available')
def is_username_available():
    user = User.query.filter_by(username=request.args.get("username")).first()
    if user is not None:
        return "false"
    return "true"


@app.route('/view_experiment/<user_id>/<exp_guid>')
def view_experiment(user_id, exp_guid):
    DirectoryAndFileWriter.get_model_data(user_id, exp_guid)
    return render_template("view_experiment.html", exp_details=DirectoryAndFileReader.get_experiment_parameters(user_id, exp_guid))


@app.route('/get_experiment_data')
def get_experiment_data():
    user_id = request.args.get("user_id")
    exp_guid = request.args.get("exp_guid")
    return jsonify(weights=DirectoryAndFileReader.get_weights(user_id, exp_guid),
                   models=DirectoryAndFileReader.get_computed_values_for_models(user_id, exp_guid),
                   metadata=DirectoryAndFileReader.get_experiment_result_data(user_id, exp_guid))


# ------------------------------------------------------------------------------------------------------------
# user management
# ------------------------------------------------------------------------------------------------------------ 
@app.route('/login', methods=['POST'])
def login():
    l_form = LoginForm(request.form)
    
    if l_form.validate_on_submit():
        user = User.query.filter_by(email=l_form.login_email.data).first()
        if user is not None and user.verify_password(l_form.login_password.data):
            login_user(user, l_form.remember_me.data)
            return redirect('/home')
        
        flash('Invalid username or password.')
            
    return render_template('main_page.html', l_form=l_form, r_form=RegistrationForm())


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect('/main_page')


@app.route('/register', methods=['POST'])
def register():
    r_form = RegistrationForm(request.form)
    
    if r_form.validate_on_submit():
        user = User(email=r_form.register_email.data, username=r_form.username.data, password=r_form.register_password.data, role_id=2)
        db.session.add(user)
        db.session.commit()
        DirectoryAndFileWriter.create_user_directory(user.id)
        return redirect('/main_page')
    
    return render_template('main_page.html', l_form=LoginForm(), r_form=r_form)

