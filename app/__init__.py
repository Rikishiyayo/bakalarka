from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.login import LoginManager
from flask.ext.bootstrap import Bootstrap
from flask.ext.mail import Mail
from flask_admin import Admin


app = Flask(__name__)
app.config.from_object('config')
db = SQLAlchemy(app)
lm = LoginManager()
lm.init_app(app)
lm.login_view = 'main_page'
bootstrap = Bootstrap(app)
mail = Mail(app)

from app import views, models

admin = Admin(app, template_mode='bootstrap3')
admin.add_view(models.UserView(models.User, db.session))