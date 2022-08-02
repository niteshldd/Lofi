# %%
from inference import inference

import os
import numpy as np
import json
from tqdm import tqdm
import matplotlib.pyplot as plt

# %%
def list_to_np(emotion_list: list):
    np_list = np.array(emotion_list)
    x = np_list[:, 0]
    y = np_list[:, 1]

    return x, y


def plot_graph(emotion_dict: dict):
    plt.figure(figsize=(8, 8))

    x1, y1 = list_to_np(emotion_dict['Happy'])
    x2, y2 = list_to_np(emotion_dict['Angry'])
    x3, y3 = list_to_np(emotion_dict['Relaxed'])
    x4, y4 = list_to_np(emotion_dict['Sad'])

    plt.xlabel("Valence")
    plt.ylabel("Energy")

    plt.scatter(x1, y1, c='r', label='Happy')
    plt.scatter(x2, y2, c='b', label='Angry')
    plt.scatter(x3, y3, c='g', label='Relaxed')
    plt.scatter(x4, y4, c='k', label='Sad')

    plt.legend()
    plt.show()


def plot_graph_middle(emotion_dict: dict):
    plt.figure(figsize=(8, 8))

    x1, y1 = list_to_np(emotion_dict['Happy'])
    x2, y2 = list_to_np(emotion_dict['Angry'])
    x3, y3 = list_to_np(emotion_dict['Relaxed'])
    x4, y4 = list_to_np(emotion_dict['Sad'])

    plt.scatter(x1, y1, c='r', label='Happy')
    plt.scatter(x2, y2, c='b', label='Angry')
    plt.scatter(x3, y3, c='g', label='Relaxed')
    plt.scatter(x4, y4, c='k', label='Sad')

    ax = plt.gca()
    ax.spines['right'].set_color('none')
    ax.spines['top'].set_color('none')

    ax.xaxis.set_ticks_position('bottom')
    ax.yaxis.set_ticks_position('left')

    ax.xaxis.set_ticklabels([])
    ax.yaxis.set_ticklabels([])

    ax.spines['bottom'].set_position(('data', 0.5))
    ax.spines['left'].set_position(('data', 0.5))

    plt.legend()
    plt.show()


# %%
if __name__ == "__main__":

    output_num = 100

    weight_path = os.path.join("model", "weights", "latest_weight.pth")

    emotion_name = ["Happy", "Angry", "Relaxed", "Sad"]

    output_dict = {emotion_name[0]: [],
                   emotion_name[1]: [],
                   emotion_name[2]: [],
                   emotion_name[3]: []
                   }

    for emotion_num in range(4):
        for _ in tqdm(range(output_num), desc=emotion_name[emotion_num]):

            json_output = json.loads(inference(weight_path, emotion_num))

            valence = json_output['valence']
            energy = json_output['energy']

            emotion_list = [valence, energy]
            output_dict[emotion_name[emotion_num]].append(emotion_list)

# %%
plot_graph(output_dict)
plot_graph_middle(output_dict)

# %%
