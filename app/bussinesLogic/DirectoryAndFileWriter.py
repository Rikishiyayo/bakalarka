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
    create_status_file(os.path.join(current_app.config['EXP_DIRECTORY'], user_id, exp_identificator))
    create_result_file(os.path.join(current_app.config['EXP_DIRECTORY'], user_id, exp_identificator))
    upload_file(form.models.data, os.path.join(current_app.config['EXP_DIRECTORY'], user_id, exp_identificator), "model.pdb")
    upload_file(form.expData.data, os.path.join(current_app.config['EXP_DIRECTORY'], user_id, exp_identificator), "saxs.dat")


# uploads a file to a specified directory
# file - a reference to a file to upload
# path - a path to a directory where the  file will be uploaded
def upload_file(file, path, name):
    file.save(os.path.join(path, name))


# creates file params.txt in specified directory with data from form
# path - a path to a directory where the params.txt file will be created
# form - a reference to a form with data which will be written in params.txt
def create_params_file(path, form):
    params = open(os.path.join(path, "params.txt"), "a+")

    params.write(form.title.name + '="' + form.title.data + '"\n')
    params.write('date="' + time.strftime("%d/%m/%Y") + '"\n')
    params.write(form.description.name + '="' + form.description.data + '"\n')
    params.write('structures_file="' + form.models.data.filename + '"\n')
    params.write('optim_steps="' + str(form.calcSteps.data) + '"\n')
    params.write('optim_sync="' + str(form.stepsBetweenSync.data) + '"\n')
    params.write('optim_alpha="' + str(form.alpha.data) + '"\n')
    params.write('optim_beta="' + str(form.beta.data) + '"\n')
    params.write('optim_gama="' + str(form.gama.data) + '"\n')
    params.write('optim_algorithm="' + str(form.calcType.data) + '"\n')
    params.write('max_q="' + str(form.qRange.data) + '"')

    params.close()


# creates file result.dat in specified directory
# path - a path to a directory where the result.dat file will be created
def create_status_file(path):
    result = open(os.path.join(path, "status.txt"), "a+")
    result.write("accepted")
    result.close()


def create_result_file(path):
    result = open(os.path.join(path, "result.dat"), "a+")
    result.write("3574")
    result.close()


# gets a file with model to display and moves it to a directory on a server to read and for user to download
# gets a file with experiment data and moves it to a directory on a server for user to download
# user_id - an id of a user that represents a directory where experiment data are stored
# exp_guid - an identificator of a experiment
def get_model_data(user_id, exp_guid):
    src_file_path_models = os.path.join(current_app.config['EXP_DIRECTORY'], user_id, exp_guid, "model.pdb")
    dst_dir = os.path.join(current_app.config['APP_ROOT'], "app/static/uploads")
    dst_dir = os.path.join(dst_dir, exp_guid)

    try:
        os.mkdir(dst_dir)
    except OSError as e:
        if e.errno != 17:
            raise e

    dst_file_path_models = os.path.join(dst_dir, "model.pdb")
    shutil.copyfile(src_file_path_models, dst_file_path_models)


# create a directory for a new user
def create_user_directory(user_id):
    os.chdir(os.path.join(current_app.config['EXP_DIRECTORY']))
    os.mkdir(str(user_id))


# def create_different_curves(computed_curves):
#     for i in range(1, 14):
#         path = os.path.join(current_app.config['EXP_DIRECTORY'], '11', str(i))
#         counter = 1
#         for k, v in computed_curves.items():
#             new_file = open(os.path.join(path, "final_m" + str(counter) + ".pdb.dat"), "a+")
#             new_file.write("# SAXS profile: number of points = 501, q_min = 0, q_max = 0.5, delta_q = 0.001\n")
#             new_file.write("#    q    intensity    error\n")
#             for point in v:
#                 new_file.write(str(point['q_value']) + "    " + str(point['intensity'] + i * 60000000) + " random_error_number\n")
#             counter += 1














