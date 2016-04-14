import os, time, shutil, uuid
from flask import current_app
from werkzeug import secure_filename


# creates an experiment - creates a directory, uploads and creates required files
# form - a reference to a form with data required to create a new experiment
def create_experiment(form, user_id):
    exp_identificator = str(uuid.uuid4())

    # create a directory for this experiment
    os.chdir(os.path.join(current_app.config['EXP_DIRECTORY'], user_id))
    os.mkdir(exp_identificator)
    os.chmod(exp_identificator,0770)

    create_params_file(os.path.join(current_app.config['EXP_DIRECTORY'], user_id, exp_identificator), form)
    create_status_file(os.path.join(current_app.config['EXP_DIRECTORY'], user_id, exp_identificator))

    filename = secure_filename(form.models.data.filename)
    extension = filename.split(os.extsep)[1]
    upload_file(form.models.data, os.path.join(current_app.config['EXP_DIRECTORY'], user_id, exp_identificator), "model", extension)
    upload_file(form.expData.data, os.path.join(current_app.config['EXP_DIRECTORY'], user_id, exp_identificator), "saxs", "dat")


# uploads a file to a specified directory
# file - a reference to a file to upload
# path - a path to a directory where the  file will be uploaded
def upload_file(file, path, name, extension):
    file.save(os.path.join(path, name + '.' + extension))


# creates file params.txt in specified directory with data from form
# path - a path to a directory where the params.txt file will be created
# form - a reference to a form with data which will be written in params.txt
def create_params_file(path, form):
    params = open(os.path.join(path, "params.txt"), "a+")

    params.write('NAME' + '="' + form.title.data + '"\n')
    params.write('DATE="' + time.strftime("%d/%m/%Y") + '"\n')
    params.write('DESCRIPTION' + '="' + form.description.data + '"\n')
    params.write('STRUCTURES_FILE="' + form.models.data.filename + '"\n')
    params.write('OPTIM_STEPS="' + str(form.calcSteps.data) + '"\n')
    params.write('OPTIM_SYNC="' + str(form.stepsBetweenSync.data) + '"\n')
    params.write('OPTIM_ALPHA="' + str(form.alpha.data) + '"\n')
    params.write('OPTIM_BETA="' + str(form.beta.data) + '"\n')
    params.write('OPTIM_GAMMA="' + str(form.gama.data) + '"\n')
    params.write('OPTIM_ALGORITHM="' + str(form.calcType.data) + '"\n')
    params.write('MAX_Q="' + str(form.qRange.data) + '"\n')

    params.close()


# creates file result.dat in specified directory
# path - a path to a directory where the result.dat file will be created
def create_status_file(path):
    result = open(os.path.join(path, "status.txt"), "a+")
    result.write("accepted\n")
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


def delete_computations(info, user_id):
    if info['all'] == 'True':
        for item in os.listdir(os.path.join(current_app.config['EXP_DIRECTORY'], user_id)):
            shutil.rmtree(os.path.join(current_app.config['EXP_DIRECTORY'], user_id, item))
    else:
        directory_to_delete = os.path.join(current_app.config['EXP_DIRECTORY'], user_id, info['comp_guid'])
        shutil.rmtree(directory_to_delete)














