#%%
import torch
import json
import jsonpickle
import argparse
import os

from model.lofi2lofi_model import idx2onehot
from model.lofi2lofi_model import Decoder as Lofi2LofiDecoder
from model.constants import *
from server.output import Output
from server.lofi2lofi_generate import *
import torch.nn as nn

device = "cpu"

def inference(weight_path, emotion_num):
    lofi2lofi_checkpoint = weight_path

    # print("Loading lofi model...")
    lofi2lofi_model = Lofi2LofiDecoder(device=device)
    lofi2lofi_model.load_state_dict(torch.load(lofi2lofi_checkpoint, map_location=device))

    # print(f"Loaded {lofi2lofi_checkpoint}.")
    lofi2lofi_model.to(device)

    lofi2lofi_model.eval()
    # json_out = generate(lofi2lofi_model)

    # num = input("Please input a number (Happy : 0, Angry : 1, Relaxed : 2, Sad : 3) : ")
    emotion_num = torch.tensor([int(emotion_num)])

    mu = torch.randn(1, HIDDEN_SIZE) # [1, 100]

    label = idx2onehot(emotion_num, 4)
    z_condition = torch.cat((mu, label), dim=-1) # [1, 104] , 4 for emotion condition
    # print(z_condition)
    json_out = decode(lofi2lofi_model, z_condition)

    return json_out

#%%

# weight_base = os.path.join("model", "weights", "latest_weight.pth")
# a = inference(weight_base)

# print(a)
# %%
