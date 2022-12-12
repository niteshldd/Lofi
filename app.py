import json

import torch
from flask import Flask, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS

from model.lofi2lofi_model import Decoder as Lofi2LofiDecoder
from model.lyrics2lofi_model import Lyrics2LofiModel
from server.lofi2lofi_generate import decode
from server.lyrics2lofi_predict import predict
# from functools import partial
import toml


#device = "cpu"
device = 0 
map_loc = lambda storage, dev: storage.cuda(dev) 
app = Flask(__name__)
cors = CORS(app, resources={r"*": {"origins": "*"}})


'''
name2mod = {"default": {
    "mod": lofi2lofi_model, 
    "pth": "/workspace/model/checkpoints/lofi2lofi_decoder.pth"
    },
    "v001": None,
    "pth": "/workspace/model/lofi2lofi/ckpt/lofi2lofi-decoder-epoch200.pth",
    "device": "cpu"
    }
'''

# lofi2lofi_model = Lofi2LofiDecoder(device=device)
# lofi2lofi_model.load_state_dict(torch.load("/workspace/model/checkpoints/lofi2lofi_decoder.pth", map_location=map_loc))
# lofi2lofi_model.to(device)
# lofi2lofi_model.eval()



# lofi2lofi_model_001 = Lofi2LofiDecoder(device=device)
# lofi2lofi_model_001.load_state_dict(torch.load("/workspace/model/lofi2lofi/ckpt/lofi2lofi-decoder-epoch200.pth", map_location=map_loc))
# lofi2lofi_model_001.to(device)
# lofi2lofi_model_001.eval()


# name2path = {
#     'default': "/workspace/model/checkpoints/lofi2lofi_decoder.pth",
#     '001': "/workspace/model/lofi2lofi/ckpt/lofi2lofi-decoder-epoch200.pth",
#     'rnb_500': "/workspace/model/checkpoints/r-and-b/ckpt/r-and-b-decoder-epoch500.pth",
#     'rnb_1500': "/workspace/model/checkpoints/r-and-b/ckpt/r-and-b-decoder-epoch1500.pth",
#     'rnb_ft_1370': "/workspace/model/checkpoints/r-and-b_pretrain/ckpt/r-and-b_pretrain-decoder-epoch1370.pth",
#     'rock_200': "/workspace/model/checkpoints/rock/ckpt/rock-decoder-epoch200.pth",
#     'rock_500': "/workspace/model/checkpoints/rock/ckpt/rock-decoder-epoch500.pth",
#     'rock_ft_1360': "/workspace/model/checkpoints/rock_pretrain/ckpt/rock_pretrain-decoder-epoch1360.pth"
# }

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


# name2mod = {
#     'default': lofi2lofi_model,
#     '001': lofi2lofi_model_001
# }

name2mod = { k: Lofi2LofiDecoder(device=device) for k in name2path}
for k, v in name2mod.items():
    print(f'Loading params for {k} from {name2path[k]}')
    v.load_state_dict(torch.load(name2path[k], map_location=map_loc))
    v.to(device)
    v.eval()



# lyrics2lofi_checkpoint = "/workspace/model/checkpoints/lyrics2lofi.pth"
# print("Loading lyrics2lofi model...", end=" ")
# lyrics2lofi_model = Lyrics2LofiModel(device=device)
# lyrics2lofi_model.load_state_dict(torch.load(lyrics2lofi_checkpoint, map_location=map_loc))
# print(f"Loaded {lyrics2lofi_checkpoint}.")
# lyrics2lofi_model.to(device)
# lyrics2lofi_model.eval()


@app.route('/')
def home():
    return 'Server running'


@app.route('/decode', methods=['GET'])
def decode_input():
    input = request.args.get('input')
    number_list = json.loads(input)

    mod_name = request.args.get('mod_name2', 'default')
    print(name2mod.keys())
    print(mod_name)
    mod = name2mod[mod_name]

    json_output = decode(mod, torch.tensor([number_list]).float(), title=mod_name)
    response = jsonify(json_output)
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response


# @app.route('/predict', methods=['GET'])
# def lyrics_to_track():
#     input = request.args.get('input')
#     json_output = predict(lyrics2lofi_model, input)
#     response = jsonify(json_output)
#     response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/get_mod_names', methods=['GET'])
def get_mod_names():
    response = jsonify(list(name2mod.keys()))
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


if __name__ == '__main__':
    # app.run(host='0.0.0.0', port=17337)
    app.run(host='0.0.0.0', port=8001)
