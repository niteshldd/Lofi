import os
import sys
import glob
import subprocess



def gen_insts_ts(inst_files):
    py_template = "import {Sampler} from 'tone';\n"
    for inst_file in inst_files:
        py_template += f"import {inst_file} from './{inst_file}.mp3';\n"
    py_template += "\n"
    py_template += "const AUDIO = {\n"
    for inst_file in inst_files:
        py_template += f'  "{inst_file}": {inst_file},\n'
    py_template += "};\n\n"
    py_template += "export default class Instrument{inst_name}Mp3 extends Sampler {\n"
    py_template += "  constructor (options = {}) {\n"
    py_template += "    super({\n"
    py_template += "      urls: AUDIO,\n"
    py_template += "        onload: options.onload\n"
    py_template += "    });\n"
    py_template += "  }\n"
    py_template += "}\n"
    return py_template


def get_sample_files(in_dir, out_dir):
    for fpath in glob.glob(in_dir + "/*.m4a"):
        fname = os.path.basename(fpath).upper().replace(".M4A", ".mp3")[-6:
        ]
        out_path = os.path.join(out_dir, fname)
        subprocess.run(f"ffmpeg -y -i {fpath} -acodec libmp3lame -ab 128k {out_path}", shell=True, check=True)


if __name__ == "__main__":
    in_dir = sys.argv[1]
    out_dir = sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)
    get_sample_files(in_dir, out_dir)
    inst_files = [os.path.basename(fpath).replace(".mp3", "") for fpath in glob.glob(out_dir + "/*.mp3")]
    inst_files.sort()
    py_template = gen_insts_ts(inst_files)
    with open(os.path.join(out_dir, "insts.js"), "w") as f:
        f.write(py_template)
