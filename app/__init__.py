from flask import Flask
from flask.ext.bootstrap import Bootstrap
from flask.ext.login import LoginManager
from flask.ext.sqlalchemy import SQLAlchemy
from flask_admin import Admin
from flask_mail import Mail
from config import config


db = SQLAlchemy()
bootstrap = Bootstrap()
mail = Mail()
admin = Admin()
lm = LoginManager()
lm.login_view = 'main.main_page'


def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)

    bootstrap.init_app(app)
    mail.init_app(app)
    db.init_app(app)
    lm.init_app(app)
    admin.init_app(app)

    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    from .userManagement import userMngmt as userMngmt_blueprint
    app.register_blueprint(userMngmt_blueprint, url_prefix='/userManagement')

    return app


# from flask import Flask
# from flask.ext.bootstrap import Bootstrap
# from flask.ext.login import LoginManager
# from flask.ext.sqlalchemy import SQLAlchemy
# from flask_admin import Admin
# from flask_mail import Mail
#
# app = Flask(__name__)
# app.config.from_object('config')
# db = SQLAlchemy(app)
# lm = LoginManager()
# lm.init_app(app)
# lm.login_view = 'main_page'
# bootstrap = Bootstrap(app)
# mail = Mail(app)
#
# from app import models
# from app.main import views
#
# admin = Admin(app, template_mode='bootstrap3')
# admin.add_view(models.UserView(models.User, db.session))