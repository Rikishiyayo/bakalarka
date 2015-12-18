import os
from flask import current_app


# reads a directory for a current logged in user and return his experiments
#
# user_id - id of a user which matches a directory on a server where this user has his experiments saved
#
# returns an array of dictionaries - dictionary has 4 keys: title, date, status and progress
def get_experiments(user_id, page):
    experiments = []
    count = current_app.config['EXPERIMENTS_ON_ONE_PAGE']

    for item in os.listdir(os.path.join(current_app.config['EXP_DIRECTORY'], str(user_id))):
        info = { "exp_guid": item, "user_id": user_id }
        read_file(os.path.join(current_app.config['EXP_DIRECTORY'], str(user_id), item, "params.txt"), info, ["title", "date"])
        read_file(os.path.join(current_app.config['EXP_DIRECTORY'], str(user_id), item, "result.dat"), info, ["status", "progress"])
        experiments.append(info)

    start = page * count
    end = page * count + count
    return experiments[start:end]



#
#
#
#
def get_experiments_count(user_id):
    exps_count = len(os.listdir(os.path.join(current_app.config['EXP_DIRECTORY'], str(user_id))))
    pages = exps_count / current_app.config['EXPERIMENTS_ON_ONE_PAGE']

    if pages.is_integer():
        pages_array = [0] * int(pages)
        return pages_array

    pages_array = [0] * (int(pages) + 1)
    return pages_array


#
#
#
#
#
def get_computed_values_for_models(user_id, exp_guid):
    directory = os.path.join(current_app.config['EXP_DIRECTORY'], user_id, exp_guid)
    models = []

    for item in os.listdir(os.path.join(directory, "DemoValues")):
        points = []
        # Open the text file for reading
        file = open(os.path.join(directory, "DemoValues", item))
        lines = file.readlines()

        for line in lines[2:]:
            values_in_line = line.split()
            points.append({ "q_value" : float(values_in_line[0].strip()),
                            "intensity" : float(values_in_line[1].strip())
                          })

        models.append({ "model" : points})

    return models


#
#
#
#
#
def get_weights(user_id, exp_guid):
    filepath = os.path.join(current_app.config['EXP_DIRECTORY'], user_id, exp_guid, "result.dat")
    weights = []
    # Open the text file for reading
    file = open(filepath)
    lines = file.readlines()
    values_in_line = lines[2].split()

    for value in values_in_line[1:]:
        weights.append(value.replace(",", "").strip())

    file.close()
    return weights


#
#
def get_experiment_result_data(user_id, exp_guid):
    result_file_path = os.path.join(current_app.config['EXP_DIRECTORY'], user_id, exp_guid, "result.dat")

    info = {}
    read_file(result_file_path, info, ["status", "progress"])

    return info


#
#
def get_experiment_parameters(user_id, exp_guid):
    parameters_file_path = os.path.join(current_app.config['EXP_DIRECTORY'], user_id, exp_guid, "params.txt")

    info = {}
    read_file(parameters_file_path, info, ["title", "date", "comment", "steps", "sync", "alpha", "beta", "gama"])

    return info


# reads a file and adds key:value pairs into a dictionary - finds a key string in a file
# and gets its value(a substring after ':' char)
#
# filePath - path of the file to read
# dictionary - reference to a dictionary to which new key:value pairs will be appended
# keys - a list of strings to find in a file. Each string represents a key in dictionary
def read_file(file_path, dictionary, keys):
    file = open(file_path)
    lines = file.readlines()
    for key in keys:
        for line in lines:
            if key in line:
                dictionary[key] = line.split(':')[1].strip()

    file.close()
    
    
    
    
    
    
    
    
    
