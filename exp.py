#%%
import os
from glob import glob
import json
from inference import inference
from tqdm import tqdm

#%%
if __name__ == "__main__":

    output_num = 10

    weight_base = os.path.join("model", "weights")

    emotion_name = ["Happy", "Angry", "Relaxed", "Sad"]

    weight_folders = [
        os.path.join(weight_base, emotion_name[0]),
        os.path.join(weight_base, emotion_name[1]),
        os.path.join(weight_base, emotion_name[2]),
        os.path.join(weight_base, emotion_name[3]),
    ]

    output_dict = {emotion_name[0]: [],
                   emotion_name[1]: [],
                   emotion_name[2]: [],
                   emotion_name[3]: []
                   }

    for i, folder in enumerate(weight_folders):
        weight = os.path.join(folder, "latest_weight.pth")

        for _ in tqdm(range(output_num), desc = emotion_name[i]):

            json_output = json.loads(inference(weight))

            valence = json_output['valence']
            energy = json_output['energy']

            emotion_list = [valence, energy]
            output_dict[emotion_name[i]].append(emotion_list)

#%%