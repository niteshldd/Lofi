import torch
import json
import jsonpickle
import argparse
import os

from model.lofi2lofi_model import Decoder as Lofi2LofiDecoder
from model.constants import *
from server.output import Output
from server.lofi2lofi_generate import *

device = "cpu"


def inference(weight_path):
    lofi2lofi_checkpoint = weight_path

    # print("Loading lofi model...")
    lofi2lofi_model = Lofi2LofiDecoder(device=device)
    lofi2lofi_model.load_state_dict(torch.load(
        lofi2lofi_checkpoint, map_location=device))

    # print(f"Loaded {lofi2lofi_checkpoint}.")
    lofi2lofi_model.to(device)

    lofi2lofi_model.eval()
    # mu = torch.randn(1, HIDDEN_SIZE)
    json_out = generate(lofi2lofi_model)

    return json_out