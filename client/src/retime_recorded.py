import os
import glob
import tqdm
import subprocess
import multiprocessing

in_dir = '/workspace/data/Lofi/Records'
out_dir = '/workspace/data/Lofi/RecordsReTimed'
os.makedirs(out_dir, exist_ok=True)
in2out = []
for fpath in tqdm.tqdm(glob.glob(f'{in_dir}/*.webm')):
    fname = os.path.basename(fpath).split('.')[0] + '.wav'
    out_fpath = f'{out_dir}/{fname}'
    in2out.append((fpath, out_fpath))


def retime(fpath, out_fpath):
    try:
        subprocess.run(f'ffmpeg -y -i {fpath} {out_fpath}', shell=True, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        print(f'Failed to retime {fpath} to {out_fpath}')

with multiprocessing.Pool(16) as p:
    p.starmap(retime, in2out)

print('Done!')