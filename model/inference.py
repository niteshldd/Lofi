from lofi2lofi_model import Decoder as Lofi2LofiDecoder
import torch
import json
import jsonpickle
from constants import *

device = "cpu"

class Output:
    def __init__(self, title, pred_chords, pred_notes, pred_tempo, pred_key, pred_mode, pred_valence, pred_energy):
        chords = pred_chords.argmax(dim=2)[0].tolist()
        notes = pred_notes.argmax(dim=2)[0].cpu().numpy()

        chords.append(CHORD_END_TOKEN)
        cut_off_point = chords.index(CHORD_END_TOKEN)
        chords = chords[:cut_off_point]  # cut off end token
        notes = notes[:cut_off_point * NOTES_PER_CHORD]
        melodies = notes.reshape(-1, NOTES_PER_CHORD)

        bpm = min(1, max(0, pred_tempo.item())) * 30 + 70
        energy = min(1, max(0, pred_energy.item()))
        valence = min(1, max(0, pred_valence.item()))

        self.title = title
        self.key = pred_key.argmax().item() + 1
        self.mode = pred_mode.argmax().item() + 1
        self.bpm = round(bpm)
        self.energy = round(energy, 3)
        self.valence = round(valence, 3)
        self.chords = chords
        self.melodies = [x.tolist() for x in [*melodies]]

    def to_json(self, pretty=False):
        json = jsonpickle.encode(self, unpicklable=False)

        if pretty:
            json = json.replace(", \"", ",\n  \"") \
                .replace("{", "{\n  ") \
                .replace("}", "\n}") \
                .replace("[[", "[\n    [") \
                .replace("]]", "]\n  ]").replace("], [", "],\n    [")
        return json

def decode(model, mu):
    hash, (pred_chords, pred_notes, pred_tempo, pred_key, pred_mode, pred_valence, pred_energy) = model.decode(mu)

    output = Output(hash, pred_chords, pred_notes, pred_tempo, pred_key, pred_mode, pred_valence, pred_energy)

    # json = output.to_json(True)
    # print(json)
    return output

def generate(model):
    mu = torch.randn(1, HIDDEN_SIZE)
    return decode(model, mu)

if __name__ == "__main__":
    lofi2lofi_checkpoint = "weights/lofi2lofi-decoder-epoch1900.pth"
    print("Loading lofi model...", end=" ")
    lofi2lofi_model = Lofi2LofiDecoder(device=device)
    lofi2lofi_model.load_state_dict(torch.load(lofi2lofi_checkpoint, map_location=device))

    print(f"Loaded {lofi2lofi_checkpoint}.")
    lofi2lofi_model.to(device)


    out_num = input("Input the number of output : ")
    out_num = int(out_num)

    for i in range(out_num):
        lofi2lofi_model.eval()
        mu = torch.randn(1, HIDDEN_SIZE)
        out = decode(lofi2lofi_model, mu)

        file_name = 'midi_out/output_' + str(i) + '.json'

        with open(file_name, "w") as f:
            json.dump(out.__dict__, f)