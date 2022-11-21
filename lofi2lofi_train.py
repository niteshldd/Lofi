import os

from model.lofi2lofi_dataset import Lofi2LofiDataset
from model.lofi2lofi_model import Lofi2LofiModel
from model.train import train

import click
import torch
import json
from functools import reduce
from loguru import logger


def filter_flist_by_genre(genre: str, flist):
    genre2songs = json.load(open('/workspace/model/dataset/genre2song.json'))
    songs = set([song.lower().strip() for song, _ in genre2songs[genre]])
    picked = []
    for f in flist:
        if f.split('/')[-1].split('.')[0].split('-')[1].lower().strip() in songs:
            picked.append(f)

    # return reduce(lambda x: x in songs, flist)
    return picked


@click.command()
@click.option('--pretrain', type=click.Path(exists=True), required=False)
@click.option('--genre', type=str, required=False, default='rock')
@click.option('--dev', type=int, default=0)
@click.option('--out_dir', type=str, required=True, default='/workspace/model/checkpoints/genre_test')
@click.option('--name', type=str, default='test')
def main(pretrain, genre, dev, name, out_dir):
    # dataset_folder = "dataset/processed-spotify-all"
    if dev != 'cpu':
        os.environ['CUDA_VISIBLE_DEVICES'] = str(dev)

    dataset_folder = "/workspace/model/dataset/processed"
    dataset_files = os.listdir(dataset_folder)

    if genre is not None:
        origin_cnt = len(dataset_files)
        dataset_files = filter_flist_by_genre(genre, dataset_files)
        logger.info(f"get {len(dataset_files)}/{origin_cnt} for {genre}/all_genres")

    dataset = Lofi2LofiDataset(dataset_folder, dataset_files)
    model = Lofi2LofiModel()
    os.makedirs(out_dir, exist_ok=True)

    if pretrain is not None:
        model.load_state_dict(torch.load(pretrain))


    train(dataset=dataset, model=model, name=name, out_dir=out_dir)
    # train(dataset, model, "lofi2lofi", out_dir)

if __name__ == '__main__':
    main()

