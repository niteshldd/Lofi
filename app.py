import json
import torch
from flask import Flask, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
from multiprocessing import Lock

from model.lofi2lofi_model import Decoder as Lofi2LofiDecoder
from model.lyrics2lofi_model import Lyrics2LofiModel
from server.lofi2lofi_generate import decode
from server.lyrics2lofi_predict import predict

fmutex = Lock()
#device = "cpu"
device = 0 if torch.cuda.is_available() else "cpu"
preset_path = "/workspace/server/presets.json"
map_loc = lambda storage, dev: storage.cuda(dev) 
app = Flask(__name__)
cors = CORS(app, resources={r"*": {"origins": "*"}})
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024


name2path = {
    'default': "/workspace/model/checkpoints/lofi2lofi_decoder.pth",
    '001': "/workspace/model/checkpoints/lofi2lofi-decoder-epoch200.pth",
    'rnb_500': "/workspace/model/checkpoints/r-and-b-decoder-epoch500.pth",
    'rnb_1500': "/workspace/model/checkpoints/r-and-b-decoder-epoch1500.pth",
    'rnb_ft_1370': "/workspace/model/checkpoints/r-and-b_pretrain-decoder-epoch1370.pth",
    'rock_200': "/workspace/model/checkpoints/rock-decoder-epoch200.pth",
    'rock_500': "/workspace/model/checkpoints/rock-decoder-epoch500.pth",
    'rock_ft_1360': "/workspace/model/checkpoints/rock_pretrain-decoder-epoch1360.pth"
}


name2mod = { k: Lofi2LofiDecoder(device=device) for k in name2path}
for k, v in name2mod.items():
    print(f'Loading params for {k} from {name2path[k]}')
    v.load_state_dict(torch.load(name2path[k], map_location=map_loc))
    v.to(device)
    v.eval()


@app.route('/')
def home():
    return 'Server running'


@app.route('/decode', methods=['GET'])
def decode_input():
    input = request.args.get('input')
    number_list = json.loads(input)

    mod_name = request.args.get('mod_name2', '001')
    mod = name2mod[mod_name]

    json_output = decode(mod, torch.tensor([number_list]).float(), title=mod_name)
    response = jsonify(json_output)
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response


@app.route('/upload', methods=['POST'])
def upload():
    fname, file = request.files.items().__next__()
    fpath = f'/workspace/data/Lofi/Records/{fname}'
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
    app.run(host='0.0.0.0', port=8001)
