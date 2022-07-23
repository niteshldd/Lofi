import pretty_midi
import json
import os
import argparse
import audiolazy.lazy_midi as lm

argparser = argparse.ArgumentParser()
argparser.add_argument("-f", "--file", required=True, type=lambda s:file_choices(("json"),s), help="Model output json file path.")
argparser.add_argument("-o", "--output", default="out.mid", type=lambda s:file_choices(("mid"),s), help="Output midi filename.")

mode_to_scales = {
    1: [2, 2, 1, 2, 2, 2, 1],
    2: [2, 1, 2, 2, 2, 1, 2],
    3: [1, 2, 2, 2, 1, 2, 2],
    4: [2, 2, 2, 1, 2, 2, 1],
    5: [2, 2, 1, 2, 2, 1, 2],
    6: [2, 1, 2, 2, 1, 2, 2],
    7: [1, 2, 2, 1, 2, 2, 2]
}

key_num_to_string = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

def file_choices(choices,fname):
    ext = os.path.splitext(fname)[1][1:]
    if ext not in choices:
       argparser.error("file doesn't end with {}".format(choices))
    return fname

def get_notes_scale(mode, key):
    """
    Parameters
    ----------
    mode : int
        Greek scales 1~7, include "ionian", "dorian" ,"phrygian" ,
        "lydian", "mixolydia", "aeolian", "locrian".
    
    key : int
        The root key 1~12.
    """

    step = mode_to_scales[mode]
    current_pointer = key-1
    scale = [key_num_to_string[current_pointer]]
    for i in range(6):
        current_pointer += step[i]
        scale.append(key_num_to_string[current_pointer%len(key_num_to_string)])
    return scale

def reduce(l: list):
    """Reduce the raw melody sequence to [note, time, pos] format.

    Parameters
    ----------
    l : list
        The soruce list to parse melody.
    
    Returns
    ---------
    list
    """

    result = []
    current_note = None
    current_keep = 0
    for index, next_note in enumerate(l):
        if current_note == None:
            current_pose = index
            current_note = next_note
            current_keep = 1
        else:
            if next_note == current_note:
                current_keep += 1
            else:
                result.append([current_note, current_keep, current_pose])
                current_pose = index
                current_note = next_note
                current_keep = 1
    
    result.append([current_note, current_keep, current_pose])

    return result 

def decode(file_path: str, main_program: int, chord_program: int, octave=3):
    """Decode from model json format output to `PrettyMIDI` object.
    
    Parameters
    ----------
    file_path : str
        Path of json file.
    main_program : int
        Program num of instrument for main melody.
        https://www.midi.org/specifications-old/item/gm-level-1-sound-set
        
    chord_program : int
        Program num of instrument for chord melody.
        https://www.midi.org/specifications-old/item/gm-level-1-sound-set

    Returns
    ----------
    PrettyMIDI
        With 2 instruments(tracks).
    """
    # TODO: Adjustable velocity.

    with open(file_path) as js:
        json_content = json.load(js)

    scale = get_notes_scale(json_content["mode"], json_content["key"])
    str_pitch_scales = [None] + [note+str(octave) for note in scale] + [note+str(octave+1) for note in scale]

    chords = json_content["chords"]
    for index, chord in enumerate(chords):
        chords[index] = [str_pitch_scales[t] for t in range(chord, chord+5, 2)]

    bpm = json_content["bpm"]
    melodies = json_content["melodies"]
    bar_interval = (bpm / 60) * 0.25 # sec

    midi = pretty_midi.PrettyMIDI(initial_tempo=bpm)
    main_instrument = pretty_midi.Instrument(program=main_program, name='Melody')
    chord_instrument = pretty_midi.Instrument(program=chord_program, name="Chord")

    melodies = [reduce(m) for m in melodies]

    tick = 0
    for melody in melodies:
        for note in melody:
            if note[0] == 0:
                tick += note[1]*bar_interval
                continue
        
            main_instrument.notes.append(
                pretty_midi.Note(
                    velocity=80,
                    pitch=lm.str2midi(str_pitch_scales[note[0]]),
                    start=tick,
                    end=tick+bar_interval*note[1]
                )
            )

            tick += bar_interval * note[1]

    tick = 0
    for chord in chords:
        # TODO: If it's 0 or 8, consider it.
        for note in chord:
            chord_instrument.notes.append(
                pretty_midi.Note(
                    velocity=70,
                    pitch=lm.str2midi(note),
                    start=tick,
                    end = tick + bar_interval*8
                )
            )
        tick += bar_interval*8

    midi.instruments.append(main_instrument)
    midi.instruments.append(chord_instrument)

    return midi

if __name__ == "__main__":

    args = argparser.parse_args()

    # Main -> Acoustic Guitar (steel), Chord -> Electric Piano 1
    midi = decode(args.file, main_program=25, chord_program=4)
    midi.write(args.output)
