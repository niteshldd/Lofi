import os
import json
import argparse
from tqdm import tqdm

from utils import json2midi
from inference import inference

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument("-o", "--output_num", type=int, default=1, help="Output number of each emotion")
    args = parser.parse_args()

    output_num = args.output_num

    weight_path = os.path.join("model", "weights", "latest_weight.pth")
    out_midi_base = "condition_json_out"

    emotion_name = ["Happy", "Angry", "Relaxed", "Sad"]

    json_folders = [
        os.path.join(out_midi_base, emotion_name[0]),
        os.path.join(out_midi_base, emotion_name[1]),
        os.path.join(out_midi_base, emotion_name[2]),
        os.path.join(out_midi_base, emotion_name[3]),
    ]

    for emotion_num in range(4): # 4 => total emotion number
        for _ in tqdm(range(output_num), desc=emotion_name[emotion_num]):

            json_output = json.loads(inference(weight_path, emotion_num))

            valence = json_output['valence']
            energy = json_output['energy']

            out_name = "V_{} E_{}".format(valence, energy) + ".json"
            out_path = os.path.join(json_folders[emotion_num], out_name)

            with open(out_path, "w") as f:
                json.dump(json_output, f)

# %%
