import os
import argparse

from lofi2lofi_dataset import Lofi2LofiDataset
from lofi2lofi_model import Lofi2LofiModel
from train import train

if __name__ == '__main__':
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