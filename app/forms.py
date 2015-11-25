from flask.ext.wtf import Form
from wtforms import ValidationError, StringField, SubmitField, FileField, TextAreaField, IntegerField, FloatField, BooleanField, PasswordField, SelectField
from wtforms.validators import DataRequired, NumberRange, Email, Length, Regexp, EqualTo
from app.models import User, Role


class SaxsExperimentForm(Form):
    title = StringField('Title:', validators=[DataRequired("Required a title!"), Length(1, 35)])
    description = TextAreaField('Description:')
    models = FileField('Upload a file with model/models:', validators=[DataRequired("Required a file with model or models")])
    expData = FileField('Upload a file with experiment data:', validators=[DataRequired("Required a file with experiment data!")])
    calcSteps = IntegerField('Calculation steps:',
                             validators=[DataRequired("Required an integer number!"),
                                         NumberRange(10000, 1000000, "Minimum value is 10 000, maximum value is 1000000!")], default=10000)
    stepsBetweenSync = IntegerField('Steps between synchronization:',
                                    validators=[DataRequired("Required an integer number!"),
                                                NumberRange(100, 10000, "Minimum value is 100, maximum value is 10000!")], default=100)
    alpha = FloatField('Alpha:', validators=[DataRequired("Required a float number!")])
    beta = FloatField('Beta:', validators=[DataRequired("Required a float numer!")])
    gama = FloatField('Gama:', validators=[DataRequired("Required a float number!")])
    submit = SubmitField('Submit')
    
    
class LoginForm(Form):
    login_email = StringField('Email', validators=[DataRequired("Enter an email address!"), Email()])
    login_password = PasswordField('Password', validators=[DataRequired('Enter a password!')])
    remember_me = BooleanField('Remember me')
    submit = SubmitField('Log In')


class RegistrationForm(Form):
    register_email = StringField('Email:', validators=[DataRequired("Enter a valid email address!"), Email()])
    username = StringField('Username:', validators=[DataRequired("Minimum of 5 characters required!"),
                                                    Length(5, message="Minimum of 8 characters required!"),
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
    
    
    
    