import jsonpickle
from dataclasses import dataclass
from model.constants import *
from enum import Enum


class Output:
    def __init__(self, title, pred_chords, pred_notes, pred_tempo, pred_key, pred_mode, pred_valence, pred_energy):
        chords = pred_chords.argmax(dim=2)[0].tolist()
        notes = pred_notes.argmax(dim=2)[0].cpu().numpy()

        chords.append(CHORD_END_TOKEN)
        cut_off_point = chords.index(CHORD_END_TOKEN)
        chords = chords[:cut_off_point]  # cut off end token
        notes = notes[:cut_off_point * NOTES_PER_CHORD]
        melodies = notes.reshape(-1, NOTES_PER_CHORD)

        bpm = min(1, max(0, pred_tempo.item())) * 30 + 70
        energy = min(1, max(0, pred_energy.item()))
        valence = min(1, max(0, pred_valence.item()))

        self.title = title
        self.key = pred_key.argmax().item() + 1
        self.mode = pred_mode.argmax().item() + 1
        self.bpm = round(bpm)
        self.energy = round(energy, 3)
        self.valence = round(valence, 3)
        self.chords = chords
        self.melodies = [x.tolist() for x in [*melodies]]

    def to_json(self, pretty=False):
        json = jsonpickle.encode(self, unpicklable=False)

        if pretty:
            json = json.replace(", \"", ",\n  \"") \
                .replace("{", "{\n  ") \
                .replace("}", "\n}") \
                .replace("[[", "[\n    [") \
                .replace("]]", "]\n  ]").replace("], [", "],\n    [")
        return json


class Instrument(Enum):
    Piano=0,
    SoftPiano=1,
    ElectricPiano=2,
    Harp=3,
    AcousticGuitar=4,
    BassGuitar=5,
    ElectricGuitar=6,
    Synth=7,
    BassElectric=8,
    Bassoon=9,
    Cello=10,
    Clarinet=11,
    Contrabass=12,
    Flute=13,
    FrenchHorn=14,
    GuitarAcoustic=15,
    GuitarElectric=16,
    GuitarNylon=17,
    Harmonium=18,
    Organ=19,
    Saxophone=20,
    Trombone=21,
    Trumpet=22,
    Tuba=23,
    Violin=24,
    Xylophone=25

@dataclass
class InstrumentConfiguration:
    def __init__(self, instrument, volume=1., octaveShift=0):
        self.instrument: Instrument = instrument
        self.volume = volume
        self.octaveShift = octaveShift


@dataclass
class ProducePreset:
    def __init__(self, name, bassLine, harmony, firstBeatArpeggio, firstBeatArpeggioPattern, melody, melodyOctaves):
        self.name = name
        self.bassLine: InstrumentConfiguration = bassLine
        self.harmony: InstrumentConfiguration = harmony
        self.firstBeatArpeggio: InstrumentConfiguration = firstBeatArpeggio
        self.firstBeatArpeggioPattern = firstBeatArpeggioPattern
        self.melody: InstrumentConfiguration = melody
        self.melodyOctaves = melodyOctaves

