#!/var/www/bakalarka/flask/bin/python
from migrate.versioning import api
from config import config
#from config import SQLALCHEMY_DATABASE_URI
#from config import SQLALCHEMY_MIGRATE_REPO
from app import db
import os.path

from app import create_app
db.app = create_app(os.getenv('FLASK_CONFIG') or 'default')

db.create_all()

c=config['default']

if not os.path.exists(c.SQLALCHEMY_MIGRATE_REPO):
    api.create(c.SQLALCHEMY_MIGRATE_REPO, 'database repository')
    api.version_control(c.SQLALCHEMY_DATABASE_URI, c.SQLALCHEMY_MIGRATE_REPO)
else:
    api.version_control(c.SQLALCHEMY_DATABASE_URI, c.SQLALCHEMY_MIGRATE_REPO,
                        api.version(c.SQLALCHEMY_MIGRATE_REPO))
