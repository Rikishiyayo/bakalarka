import os
basedir = os.path.dirname(os.path.abspath(__file__))


class Config:
    APP_ROOT = os.path.dirname(os.path.abspath(__file__))
    CSRF_ENABLED = True
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'vf486k6q3269f5;;s\`\dd5t5vc5nb5e5c4.][-=89'
    SQLALCHEMY_COMMIT_ON_TEARDOWN = True

    # messages and instructions
    REGISTRATION_SUCCESSFUL = 'Registration successful! An activation email has been sent to your email address. You can now log in.'
    ACCOUNT_CONFIRMATION = 'You have confirmed your account. Thanks!'
    ACCOUNT_FAILED_CONFIRMATION = 'The confirmation link is invalid or has expired.'
    CONFIRMATION_MAIL_SENT = 'A new confirmation email has been sent to your email account.'
    PASSWORD_RESET__MAIL_SENT = 'An email with instructions to reset your password has been sent to you.'
    PASSWORD_RESET_SUCCESSFUL = 'Your password has been updated!'
    PASSWORD_RESET_FAILED_USER_DOESNT_EXIST = 'User with this email does not exist!'
    PASSWORD_RESET_FAILED = 'Password reset failed!'
    LOGIN_ERROR = 'Invalid username or password.'
    LOGIN_BEFORE_CONFIRMATION = "You must first log in to confirm your account!"
    EXPERIMENT_SUBMITTED = "You have successfully submitted an experiment. You can examine result by clicking on a row with this experiment." \
                           "Click on a refresh button to load newest results"
    EXPERIMENTS_ON_ONE_PAGE = 16

    @staticmethod
    def init_app(app):
        pass


class DevelopmentConfig(Config):
    DEBUG = True
    EXP_DIRECTORY = "/var/www/SaxsExperiments"

    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or \
        'sqlite:///' + os.path.join(EXP_DIRECTORY, 'app.db')

    MAIL_SERVER = 'relay.ics.muni.cz'
    MAIL_PORT = 25
    MAIL_USE_TLS = False
    MAIL_USE_SSL = True
    MAIL_USERNAME = ""
    MAIL_PASSWORD = ""
    MAIL_DEFAULT_SENDER = "ljocha@ics.muni.cz"
    MAIL_SUBJECT = "[SaxsExpWebApp]"


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('TEST_DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'data-test.sqlite')
    SQLALCHEMY_MIGRATE_REPO = os.path.join(basedir, 'db_repository')
    SQLALCHEMY_TRACK_MODIFICATIONS = True


class ProductionConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'data.sqlite')


config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,

    'default': DevelopmentConfig
}
