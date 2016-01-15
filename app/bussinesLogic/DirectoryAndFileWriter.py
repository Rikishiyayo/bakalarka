import os
import time
import shutil
import uuid
from werkzeug.utils import secure_filename
from flask import current_app


# creates an experiment - creates a directory, uploads and creates required files
# form - a reference to a form with data required to create a new experiment
def create_experiment(form, user_id):
    exp_identificator = str(uuid.uuid4())

    # create a directory for this experiment
    os.chdir(os.path.join(current_app.config['EXP_DIRECTORY'], user_id))
    os.mkdir(exp_identificator)

    create_params_file(os.path.join(current_app.config['EXP_DIRECTORY'], user_id, exp_identificator), form)
    create_result_file(os.path.join(current_app.config['EXP_DIRECTORY'], user_id, exp_identificator))
    upload_file(form.models.data, os.path.join(current_app.config['EXP_DIRECTORY'], user_id, exp_identificator))
    upload_file(form.expData.data, os.path.join(current_app.config['EXP_DIRECTORY'], user_id, exp_identificator))


# uploads a file to a specified directory
# file - a reference to a file to upload
# path - a path to a directory where the  file will be uploaded
def upload_file(file, path):
    filename = secure_filename(file.filename)
    file.save(os.path.join(path, filename))


# creates file params.txt in specified directory with data from form
# path - a path to a directory where the params.txt file will be created
# form - a reference to a form with data which will be written in params.txt
def create_params_file(path, form):
    params = open(os.path.join(path, "params.txt"), "a+")

    params.write(form.title.name + ':' + form.title.data + '\n')
    params.write("date:" + time.strftime("%d/%m/%Y") + '\n')
    params.write(form.description.name + ':' + form.description.data + '\n')
    params.write(form.calcSteps.name + ':' + str(form.calcSteps.data) + '\n')
    params.write(form.stepsBetweenSync.name + ':' + str(form.stepsBetweenSync.data) + '\n')
    params.write(form.alpha.name + ':' + str(form.alpha.data) + '\n')
    params.write(form.beta.name + ':' + str(form.beta.data) + '\n')
    params.write(form.gama.name + ':' + str(form.gama.data))

    params.close()


# creates file result.dat in specified directory
# path - a path to a directory where the result.dat file will be created
def create_result_file(path):
    result = open(os.path.join(path, "result.dat"), "a+")
    result.write("status:accepted\nprogress:40%")
    result.close()
    

# gets a file with model to display and moves it to a directory on a server to read and for user to download
# gets a file with experiment data and moves it to a directory on a server for user to download
# user_id - an id of a user that represents a directory where experiment data are stored
# exp_guid - an identificator of a experiment
def get_model_data(user_id, exp_guid):
    src_file_path_models = os.path.join(current_app.config['EXP_DIRECTORY'], user_id, exp_guid, "final.pdb")
    dst_file_path_models = os.path.join(current_app.config['APP_ROOT'], "app/static/uploads/final.pdb")
    shutil.copyfile(src_file_path_models, dst_file_path_models)

    src_file_path_exp_data = os.path.join(current_app.config['EXP_DIRECTORY'], user_id, exp_guid, "exp_data.dat")
    dst_file_path_exp_data = os.path.join(current_app.config['APP_ROOT'], "app/static/uploads/exp_data.dat")
    shutil.copyfile(src_file_path_exp_data, dst_file_path_exp_data)


# create a directory for a new user
def create_user_directory(user_id):
    os.chdir(os.path.join(current_app.config['EXP_DIRECTORY']))
    os.mkdir(str(user_id))







