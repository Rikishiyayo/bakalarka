from flask.ext.wtf import Form
from wtforms import ValidationError, StringField, SubmitField, TextAreaField, IntegerField, FloatField, BooleanField, PasswordField, RadioField
from wtforms.fields.html5 import DecimalRangeField
from wtforms.validators import DataRequired, NumberRange, Email, Length, Regexp, EqualTo
from flask_wtf.file import FileAllowed, FileField
from app.models import User

# A form for computation
#
class Computation(Form):
    title = StringField('Title:', validators=[DataRequired("Required a title!"), Length(1, 35)])
    description = TextAreaField('Description:')
    models = FileField('File with model/models:', validators=[DataRequired("Required a file with model or models. Allowed formats are 'pdb', 'zip', 'tar.gz', 'rar' or 'tar.bz2'"),
                                                              FileAllowed(['pdb', 'zip', 'tar.gz', 'rar', 'tar.bz2'])])
    expData = FileField('File with experiment data:', validators=[DataRequired("Required a text file with experiment data!")])
    qRange = DecimalRangeField('q range:', validators=[DataRequired("Required parameter")], default=0.1)
    calcType = RadioField('Calculation type:', choices=[('random_walk', 'Random walk'), ('stunnel', 'Stochastic tunneling')], default='random_walk')
    calcSteps = IntegerField('Calculation steps:',
                             validators=[DataRequired("Required an integer number!"),
                                         NumberRange(500, 1000000, "Minimum value is 10 000, maximum value is 1000000!")], default=500)
    stepsBetweenSync = IntegerField('Steps between synchronization:',
                                    validators=[NumberRange(100, 10000, "Minimum value is 100, maximum value is 10000!")], default=100)
    alpha = FloatField('alpha - max. random step:', default=0.01)
    beta = FloatField('beta - chi2 acceptance:', default=0.005)
    gama = FloatField('gama - tunel scaling:', default=500)
    submit = SubmitField('Submit')


# A login form
#
class LoginForm(Form):
    login_email = StringField('Email', validators=[DataRequired("Enter a valid email address!"), Email()])
    login_password = PasswordField('Password', validators=[DataRequired('Enter a password!')])
    remember_me = BooleanField('Remember me')
    submit = SubmitField('Log In')


# A register form
#
class RegistrationForm(Form):
    register_email = StringField('Email:', validators=[DataRequired("Enter a valid email address!"), Email()])
    username = StringField('Username:', validators=[DataRequired("Minimum of 5 characters required!"),
                                                    Length(5, message="Minimum of 5 characters required!"),
                                                    Regexp('^[A-Za-z][A-Za-z0-9_.]*$', 0, "Username must have only letters, numbers, dots or underscores")])
    register_password = PasswordField('Password:', validators=[DataRequired("Minimum of 8 characters required!"),
                                                               Length(8, message="Minimum of 8 characters required!")])
    password2 = PasswordField('Confirm password:', validators=[DataRequired(), EqualTo('register_password',
                                                   message='Passwords must match.')])
    submit = SubmitField('Register')
    
    
    def validate_email(self, field):
        if User.query.filter_by(email=field.data).first():
            raise ValidationError('Email already registered.')


    def validate_username(self, field):
        if User.query.filter_by(username=field.data).first():
            raise ValidationError('Username already in use.')


# A password reset request form
#
class PasswordResetRequestForm(Form):
    user_email = StringField('Email', validators=[DataRequired("Enter a valid email address!"), Email()])
    submit = SubmitField('Confirm')


# A password reset form
#
class PasswordResetForm(Form):
    user_email = StringField('Email', validators=[DataRequired("Enter a valid email address!"), Email()])
    new_password = PasswordField('New password:', validators=[DataRequired("Minimum of 8 characters required!"),
                                                               Length(8, message="Minimum of 8 characters required!")])
    new_password_confirm = PasswordField('Confirm new password:', validators=[DataRequired(), EqualTo('new_password',
                                                   message='Passwords must match.')])
    submit = SubmitField('Confirm')

    # def validate_username_or_email_requirement(self):
    #     if not super(PasswordResetForm, self).validate():
    #         return False
    #     if not self.username.data and not self.user_email.data:
    #             msg = 'Username or email must be set!'
    #             self.username.errors.append(msg)
    #             self.user_email.errors.append(msg)
    #             return False