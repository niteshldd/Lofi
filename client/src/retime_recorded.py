import os
import glob
import tqdm
import subprocess
import multiprocessing

in_dir = '/workspace/data/Lofi/Records/2022-12-20'
old_dir = '/workspace/data/Lofi/Records/2022-12-20-retime'
new_dir = '/workspace/data/Lofi/Records/2022-12-20-retime2'
os.makedirs(new_dir, exist_ok=True)
in2out = []
for fpath in tqdm.tqdm(glob.glob(f'{in_dir}/*.webm')):
    fname = os.path.basename(fpath).split('.')[0] + '.wav'
    out_fpath = f'{new_dir}/{fname}'
    old_fpath = f'{old_dir}/{fname}'
    if os.path.exists(old_fpath):
        continue

    in2out.append((fpath, out_fpath))


def retime(fpath, out_fpath):
    try:
        subprocess.run(f'ffmpeg -y -i {fpath} {out_fpath}', shell=True, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        print(f'Failed to retime {fpath} to {out_fpath}')
        if os.path.exists(out_fpath):
            os.remove(out_fpath)

with multiprocessing.Pool(16) as p:
    p.starmap(retime, in2out)


for fpath in glob.glob(f'{new_dir}/*.wav'):
    if os.path.exists(fpath) and os.path.getsize(fpath) / float(1024 * 1024) < 12:
        os.remove(fpath)

print('Done!')
