from werkzeug.security import generate_password_hash, check_password_hash
from flask.ext.login import UserMixin, current_user
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer
from flask import current_app, redirect
from app import db, lm
from flask_admin.contrib.sqla import ModelView


class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    active = db.Column(db.Boolean, index=True, default=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'))
    password_hash = db.Column(db.String(128))
    confirmed = db.Column(db.Boolean, default=False)
    
    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')

    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)

    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def generate_confirmation_token(self, expiration=3600):
        s = Serializer(current_app.config['SECRET_KEY'], expiration)
        return s.dumps({'confirm': self.id})

    def generate_reset_token(self, expiration=3600):
        s = Serializer(current_app.config['SECRET_KEY'], expiration)
        return s.dumps({'reset': self.id})

    def reset_password(self, token, new_password):
        s = Serializer(current_app.config['SECRET_KEY'])

        try:
            data = s.loads(token)
        except:
            return False

        if data.get('reset') != self.id:
            return False

        self.password = new_password
        db.session.add(self)
        db.session.commit()
        return True

    def confirm(self, token):
        s = Serializer(current_app.config['SECRET_KEY'])

        try:
            data = s.loads(token)
        except:
            return False
        
        if data.get('confirm') != self.id:
            return False
        
        self.confirmed = True
        db.session.add(self)
        db.session.commit()
        return True

    def __repr__(self):
        return '<User %r>' % (self.username)



class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), index=True, unique=True)
    users = db.relationship('User', backref='role')
    

    def __repr__(self):
        return self.name
    
    def __str__(self):
        return self.name
    
    
class UserView(ModelView):
    page_size = 30
    can_edit = False
    can_create = False
    column_exclude_list = ['password_hash']
    column_editable_list = ['confirmed', 'active', 'role']
    def is_accessible(self):
        return current_user.is_authenticated and current_user.role_id == 1

    def inaccessible_callback(self, name, **kwargs):
        # redirect to login page if user doesn't have access
        return redirect("/main_page")
    
    
@lm.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))