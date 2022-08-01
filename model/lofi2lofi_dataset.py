import torch
from torch.utils.data import Dataset

import json
import os

from dataset import *

class Lofi2LofiDataset(Dataset):
    def __init__(self, dataset_folder):
        super(Lofi2LofiDataset, self).__init__()
        self.samples = []
        self.labels = []

        for emotion_foler_name in os.listdir(dataset_folder):
            emotion_foler = os.path.join(dataset_folder, emotion_foler_name)
            for file in os.listdir(emotion_foler):
                with open(f"{dataset_folder}/{emotion_foler_name}/{file}") as sample_file_json:
                    json_loaded = json.load(sample_file_json)
                    sample = process_sample(json_loaded)
                    
                    self.samples.append(sample)
                    self.labels.append(emotion_foler_name)

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, index):
        sample = self.samples[index]
        label  = self.labels[index]

        sample["chords"] = torch.tensor(sample["chords"])
        sample["melody_notes"] = torch.tensor(sample["melody_notes"])

        return sample, label