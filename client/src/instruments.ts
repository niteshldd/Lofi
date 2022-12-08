import * as Tone from 'tone';
import { SAMPLES_BASE_URL } from './samples';
import BassElectrics from 'tonejs-instrument-bass-electric';
import BassoonMp3 from 'tonejs-instrument-bassoon-mp3';
import CelloMp3 from 'tonejs-instrument-cello-mp3';
import ClarinetMp3 from 'tonejs-instrument-clarinet-mp3';
import ContrabassMp3 from 'tonejs-instrument-contrabass-mp3';
import Flutes from 'tonejs-instrument-flute';
import FrenchHornMp3 from 'tonejs-instrument-french-horn-mp3';
import GuitarAcousticMp3 from 'tonejs-instrument-guitar-acoustic-mp3';
import GuitarElectricMp3 from 'tonejs-instrument-guitar-electric-mp3';
import GuitarNylonMp3 from 'tonejs-instrument-guitar-nylon-mp3';
import HarmoniumMp3 from 'tonejs-instrument-harmonium-mp3';
import OrganMp3 from 'tonejs-instrument-organ-mp3';
import SaxophoneMp3 from 'tonejs-instrument-saxophone-mp3';
import TromboneMp3 from 'tonejs-instrument-trombone-mp3';
import TrumpetMp3 from 'tonejs-instrument-trumpet-mp3';
import TubaMp3 from 'tonejs-instrument-tuba-mp3';
import Violins from 'tonejs-instrument-violin';
import Xylophones from 'tonejs-instrument-xylophone';


export enum Instrument {
  /** Salamander grand piano, velocity 6 */
  Piano,
  /** Salamander grand piano, velocity 1 */
  SoftPiano,
  /** Mellow electric piano */
  ElectricPiano,
  /** Harp */
  Harp,
  /** Acoustic guitar */
  AcousticGuitar,
  /** Bass Guitar */
  BassGuitar,
  /** Electric guitar */
  ElectricGuitar,
  /** Synth (Tone.js) */
  Synth,
  BassElectric,
  Bassoon,
  Cello,
  Clarinet,
  Contrabass,
  Flute,
  FrenchHorn,
  GuitarAcoustic,
  GuitarElectric,
  GuitarNylon,
  Harmonium,
  Organ,
  Saxophone,
  Trombone,
  Trumpet,
  Tuba,
  Violin,
  Xylophone,
}


export const getInstrumentName = (instrument: Instrument) => {
  let name = '';
  switch (instrument) {
    case Instrument.Piano: name='Piano'; break;
    case Instrument.SoftPiano: name='Soft-Piano'; break;
    case Instrument.ElectricPiano: name='E-Piano'; break;
    case Instrument.Harp: name='Harp'; break;
    case Instrument.AcousticGuitar: name='AC-Guitar'; break;
    case Instrument.BassGuitar: name='B-Guitar'; break;
    case Instrument.ElectricGuitar: name='E-Guitar'; break;
    case Instrument.Synth: name='Synth'; break;
    case Instrument.BassElectric: name='BassElectric'; break;
    case Instrument.Bassoon: name='Bassoon'; break;
    case Instrument.Cello: name='Cello'; break;
    case Instrument.Clarinet: name='Clarinet'; break;
    case Instrument.Contrabass: name='Contrabass'; break;
    case Instrument.Flute: name='Flute'; break;
    case Instrument.FrenchHorn: name='FrenchHorn'; break;
    case Instrument.GuitarAcoustic: name='GuitarAcoustic'; break;
    case Instrument.GuitarElectric: name='GuitarElectric'; break;
    case Instrument.GuitarNylon: name='GuitarNylon'; break;
    case Instrument.Harmonium: name='Harmonium'; break;
    case Instrument.Organ: name='Organ'; break;
    case Instrument.Saxophone: name='Saxophone'; break;
    case Instrument.Trombone: name='Trombone'; break;
    case Instrument.Trumpet: name='Trumpet'; break;
    case Instrument.Tuba: name='Tuba'; break;
    case Instrument.Violin: name='Violin'; break;
    case Instrument.Xylophone: name='Xylophone'; break;
    }
  return name;
}


export const getInstrumentIdx = (instrumentName: string) => {
  let idx = -1;
  switch (instrumentName) {
    case 'Piano': idx=0; break;
    case 'Soft-Piano': idx=1; break;
    case 'E-Piano': idx=2; break;
    case 'Harp': idx=3; break;
    case 'AC-Guitar': idx=4; break;
    case 'B-Guitar': idx=5; break;
    case 'E-Guitar': idx=6; break;
    case 'Bass': idx=7; break;
    case 'BassElectric': idx=8; break;
    case 'Bassoon': idx=9; break;
    case 'Cello': idx=10; break;
    case 'Clarinet': idx=11; break;
    case 'Contrabass': idx=12; break;
    case 'Flute': idx=13; break;
    case 'FrenchHorn': idx=14; break;
    case 'GuitarAcoustic': idx=15; break;
    case 'GuitarElectric': idx=16; break;
    case 'GuitarNylon': idx=17; break;
    case 'Harmonium': idx=18; break;
    case 'Organ': idx=19; break;
    case 'Saxophone': idx=20; break;
    case 'Trombone': idx=21; break;
    case 'Trumpet': idx=22; break;
    case 'Tuba': idx=23; break;
    case 'Violin': idx=24; break;
    case 'Xylophone': idx=25; break;
  }
  return idx;
}


const BASE_URL = `${SAMPLES_BASE_URL}/instruments`;
export const getInstrument = (instrument: Instrument) => {
  switch (instrument) {
    case Instrument.Piano: {
      return new Tone.Sampler({
        urls: {
          A2: 'A2.mp3',
          A3: 'A3.mp3',
          A4: 'A4.mp3',
          A5: 'A5.mp3',
          A6: 'A6.mp3',
          A7: 'A7.mp3',
          C2: 'C2.mp3',
          C3: 'C3.mp3',
          C4: 'C4.mp3',
          C5: 'C5.mp3',
          C6: 'C6.mp3',
          C7: 'C7.mp3',
          C8: 'C8.mp3',
          'D#2': 'Ds2.mp3',
          'D#3': 'Ds3.mp3',
          'D#4': 'Ds4.mp3',
          'D#5': 'Ds5.mp3',
          'D#6': 'Ds6.mp3',
          'D#7': 'Ds7.mp3',
          'F#2': 'Fs2.mp3',
          'F#3': 'Fs3.mp3',
          'F#4': 'Fs4.mp3',
          'F#5': 'Fs5.mp3',
          'F#6': 'Fs6.mp3',
          'F#7': 'Fs7.mp3'
        },
        baseUrl: `${BASE_URL}/piano/`,
        volume: 0
      });
    }

    case Instrument.SoftPiano: {
      return new Tone.Sampler({
        urls: {
          A2: 'A2.mp3',
          A3: 'A3.mp3',
          A4: 'A4.mp3',
          A5: 'A5.mp3',
          A6: 'A6.mp3',
          A7: 'A7.mp3',
          C2: 'C2.mp3',
          C3: 'C3.mp3',
          C4: 'C4.mp3',
          C5: 'C5.mp3',
          C6: 'C6.mp3',
          C7: 'C7.mp3',
          C8: 'C8.mp3',
          'D#2': 'Ds2.mp3',
          'D#3': 'Ds3.mp3',
          'D#4': 'Ds4.mp3',
          'D#5': 'Ds5.mp3',
          'D#6': 'Ds6.mp3',
          'D#7': 'Ds7.mp3',
          'F#2': 'Fs2.mp3',
          'F#3': 'Fs3.mp3',
          'F#4': 'Fs4.mp3',
          'F#5': 'Fs5.mp3',
          'F#6': 'Fs6.mp3',
          'F#7': 'Fs7.mp3'
        },
        baseUrl: `${BASE_URL}/piano-soft/`,
        volume: 4
      });
    }

    case Instrument.ElectricPiano: {
      return new Tone.Sampler({
        urls: {
          A2: 'A2.mp3',
          A3: 'A3.mp3',
          A4: 'A4.mp3',
          A5: 'A5.mp3',
          A6: 'A6.mp3',
          C2: 'C2.mp3',
          C3: 'C3.mp3',
          C4: 'C4.mp3',
          C5: 'C5.mp3',
          C6: 'C6.mp3',
          'D#2': 'Ds2.mp3',
          'D#3': 'Ds3.mp3',
          'D#4': 'Ds4.mp3',
          'D#5': 'Ds5.mp3',
          'D#6': 'Ds6.mp3',
          'F#2': 'Fs2.mp3',
          'F#3': 'Fs3.mp3',
          'F#4': 'Fs4.mp3',
          'F#5': 'Fs5.mp3',
          'F#6': 'Fs6.mp3'
        },
        baseUrl: `${BASE_URL}/piano-electric/`,
        volume: 0
      });
    }

    case Instrument.Harp: {
      return new Tone.Sampler({
        urls: {
          A2: 'A2.mp3',
          A3: 'A3.mp3',
          A4: 'A4.mp3',
          A5: 'A5.mp3',
          A6: 'A6.mp3',
          C2: 'C2.mp3',
          C3: 'C3.mp3',
          C4: 'C4.mp3',
          C5: 'C5.mp3',
          C6: 'C6.mp3',
          'D#2': 'Ds2.mp3',
          'D#3': 'Ds3.mp3',
          'D#4': 'Ds4.mp3',
          'D#5': 'Ds5.mp3',
          'D#6': 'Ds6.mp3',
          'F#2': 'Fs2.mp3',
          'F#3': 'Fs3.mp3',
          'F#4': 'Fs4.mp3',
          'F#5': 'Fs5.mp3',
          'F#6': 'Fs6.mp3'
        },
        baseUrl: `${BASE_URL}/harp/`,
        volume: 0
      });
    }

    case Instrument.AcousticGuitar: {
      return new Tone.Sampler({
        urls: {
          A2: 'A2.mp3',
          A3: 'A3.mp3',
          A4: 'A4.mp3',
          A5: 'A5.mp3',
          C2: 'C2.mp3',
          C3: 'C3.mp3',
          C4: 'C4.mp3',
          C5: 'C5.mp3',
          C6: 'C6.mp3',
          'D#2': 'Ds2.mp3',
          'D#3': 'Ds3.mp3',
          'D#4': 'Ds4.mp3',
          'D#5': 'Ds5.mp3',
          'F#2': 'Fs2.mp3',
          'F#3': 'Fs3.mp3',
          'F#4': 'Fs4.mp3',
          'F#5': 'Fs5.mp3'
        },
        baseUrl: `${BASE_URL}/guitar-acoustic/`,
        volume: 0
      });
    }

    case Instrument.ElectricGuitar: {
      return new Tone.Sampler({
        urls: {
          A2: 'A2.mp3',
          A3: 'A3.mp3',
          A4: 'A4.mp3',
          A5: 'A5.mp3',
          C3: 'C3.mp3',
          C4: 'C4.mp3',
          C5: 'C5.mp3',
          C6: 'C6.mp3',
          'C#2': 'Cs2.mp3',
          'D#3': 'Ds3.mp3',
          'D#4': 'Ds4.mp3',
          'D#5': 'Ds5.mp3',
          E2: 'E2.mp3',
          'F#2': 'Fs2.mp3',
          'F#3': 'Fs3.mp3',
          'F#4': 'Fs4.mp3',
          'F#5': 'Fs5.mp3'
        },
        baseUrl: `${BASE_URL}/guitar-electric/`,
        volume: -10
      });
    }

    case Instrument.BassGuitar: {
      return new Tone.Sampler({
        urls: {
          E1: 'E.mp3',
          A1: 'A.mp3',
          C2: 'C.mp3'
        },
        baseUrl: `${BASE_URL}/guitar-bass/`,
        volume: 0
      });
    }

    case Instrument.Synth: {
      return new Tone.PolySynth(Tone.Synth, {
        envelope: {
          attack: 0.02,
          decay: 0.1,
          sustain: 0.3,
          release: 1
        },
        volume: -10
      });
    }

    case Instrument.BassElectric: {
      return new BassElectrics.BassElectricMp3(false);
    }

    case Instrument.Bassoon: {
      return new BassoonMp3(false);
    }

    case Instrument.Cello: {
      return new CelloMp3(false);
    }

    case Instrument.Clarinet: {
      return new ClarinetMp3(false);
    }

    case Instrument.Contrabass: {
      return new ContrabassMp3(false);
    }

    case Instrument.Flute: {
      return new Flutes.FluteMp3(false);
    }

    case Instrument.FrenchHorn: {
      return new FrenchHornMp3(false);
    }

    case Instrument.GuitarAcoustic: {
      return new GuitarAcousticMp3(false);
    }

    case Instrument.GuitarElectric: {
      return new GuitarElectricMp3(false);
    }

    case Instrument.GuitarNylon: {
      return new GuitarNylonMp3(false);
    }

    case Instrument.Harmonium: {
      return new HarmoniumMp3(false);
    }
    
    case Instrument.Organ: {
      return new OrganMp3(false);
    }
    
    case Instrument.Saxophone: {
      return new SaxophoneMp3(false);
    }

    case Instrument.Trombone: {
      return new TromboneMp3(false);
    }

    case Instrument.Trumpet: {
      return new TrumpetMp3(false);
    }

    case Instrument.Tuba: {
      return new TubaMp3(false);
    }

    case Instrument.Violin: {
      return new Violins.ViolinMp3(false);
    }

    case Instrument.Xylophone: {
      return new Xylophones.XylophoneMp3(false);
    }

    default:
      throw new Error('Invalid instrument specified');
  }
};

export const DefaultFilters = [
  new Tone.Reverb({
    decay: 2,
    wet: 0.2,
    preDelay: 0.3
  })
];

export const getInstrumentFilters = (instrument: Instrument) => {
  switch (instrument) {
    case Instrument.ElectricGuitar: {
      return [
        ...DefaultFilters,
        new Tone.Filter({
          type: 'highpass',
          frequency: 350,
          Q: 0.5
        })
      ];
    }

    case Instrument.BassGuitar: {
      return [
        ...DefaultFilters,
        new Tone.Filter({
          type: 'highpass',
          frequency: 300,
          Q: 0.5
        })
      ];
    }

    default:
      return [
          ...DefaultFilters,
        ];
  }
};
