import os
import sys
sys.path.append('../')  # to get model
import json
import yaml
import model
import torch

from flask_cors import CORS
from datetime import datetime
from multiprocessing import Lock
from flask import Flask, request, jsonify

from lofi2lofi_generate import decode

app = Flask(__name__)
cors = CORS(app, resources={r"*": {"origins": "*"}})
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024

fmutex = Lock()
def map_loc(storage, dev): return storage.cuda(dev)
config = yaml.load(open('/workspace/server/config.yaml',
                   'r'), Loader=yaml.FullLoader)

preset_path = config['preset']['default']
port = config['deploy']['port']

device = config['deploy']['device']
device = torch.device(device if torch.cuda.is_available() and device>=0 else 'cpu')

models = config['models']
name2mod = {}
for cfg in models:
    mod = getattr(model, cfg['module'])(device=device)
    mod.load_state_dict(torch.load(cfg['checkpoint'], map_location=map_loc))
    mod.to(device)
    mod.eval()
    name2mod[cfg["name"]] = mod


@app.route('/')
def home():
    return 'Server running'


@app.route('/decode', methods=['GET'])
def decode_input():
    input = request.args.get('input')
    number_list = json.loads(input)

    mod_name = request.args.get('mod_name2', '001')
    mod = name2mod[mod_name]

    json_output = decode(mod, torch.tensor(
        [number_list]).float(), title=mod_name)
    response = jsonify(json_output)
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response


@app.route('/upload', methods=['POST'])
def upload():
    fname, file = request.files.items().__next__()
    fpath = f"/workspace/data/Lofi/Records/{datetime.today().strftime('%Y-%m-%d')}/{fname}"
    os.makedirs(os.path.dirname(fpath), exist_ok=True)

    file.save(fpath)
    response = jsonify({'fname': fpath})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/get_mod_names', methods=['GET'])
def get_mod_names():
    response = jsonify(list(name2mod.keys()))
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/getPresets', methods=['GET'])
def get_preset():
    presets = json.loads(open(preset_path).read())
    response = jsonify(list(presets.values()))
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/addPreset', methods=['POST', 'GET', 'Options'])
def add_preset():
    presets = json.loads(open(preset_path).read())
    preset = request.form['preset']
    preset = json.loads(preset)

    if preset['name'] in presets:
        return jsonify({'error': 'Preset name already exists.'}), 402

    presets[preset['name']] = preset
    with fmutex:
        with open(preset_path, 'w') as fout:
            fout.write(json.dumps(presets))
    response = jsonify(presets)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/deletePreset', methods=['POST'])
def delete_preset():
    presets = json.loads(open(preset_path).read())
    name = request.form['presetName']
    if name in presets:
        presets.pop(name)
    with fmutex:
        with open(preset_path, 'w') as fout:
            fout.write(json.dumps(presets, indent=4))
    response = jsonify(presets)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port, debug=False)
