import os
import argparse
import torch
import numpy as np

from lofi2lofi_dataset import Lofi2LofiDataset
from lofi2lofi_model import Lofi2LofiModel
from train import train

def Set_Seed(myseed = 1520):
    np.random.seed(myseed)

    torch.manual_seed(myseed)
    torch.cuda.manual_seed(myseed)
    torch.cuda.manual_seed_all(myseed)

def Check_Folder():
    emo_list = ["Happy", "Angry", "Relaxed", "Sad"]
    weights_folder = 'weights'

    if not os.path.exists(weights_folder):
        os.mkdir(weights_folder)
        print("Create the weights folder !")
        for emo in emo_list:
            folder = os.path.join(weights_folder, emo)
            if not os.path.exists(folder):
                print("Create the " + emo + " folder !")
                os.mkdir(folder)

if __name__ == '__main__':

    Check_Folder()
    Set_Seed()

    parser = argparse.ArgumentParser()
    parser.add_argument("--emotion", type=str, default="Happy", help="Input emotion for training: Happy, Angry, Relaxed, Sad")
    args = parser.parse_args()

    dataset_path = 'dataset'
    dataset_name = 'processed_emotion'
    emotion_name = args.emotion

    dataset_folder = os.path.join(dataset_path, dataset_name, emotion_name)
    dataset_files = os.listdir(dataset_folder)

    dataset = Lofi2LofiDataset(dataset_folder, dataset_files)
    model = Lofi2LofiModel()

    train(dataset, model, "lofi2lofi", emotion_name)