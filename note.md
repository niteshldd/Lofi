```
本地输出的数据结构
```
key: 3
mode: 1
bpm: 75
energy: 0.501
valence: 0.3
chords: [6, 7, 1, 4, 5, 1]
melodies: [
    [0, 6, 6, 6, 5, 6, 5, 6],
    [5, 6, 2, 0, 2, 0, 2, 0],
    ...]

```

```


``
### 直接操作
 - BMP 压缩到70-100


```
// 获得主音 tonic note, e.g. 'G' 
this.tonic = keyNumberToString(params.key)
// 获得调
this.keyNum = key

// musical mode, e.g. 'ionian'
<!-- const MODES = [
  [0, 2773, 0, "ionian", "", "Maj7", "major"],
  [1, 2902, 2, "dorian", "m", "m7"],
  [2, 3418, 4, "phrygian", "m", "m7"],
  [3, 2741, -1, "lydian", "", "Maj7"],
  [4, 2774, 1, "mixolydian", "", "7"],
  [5, 2906, 3, "aeolian", "m", "m7", "minor"],
  [6, 3434, 5, "locrian", "dim", "m7b5"],
] as const; -->
this.mode = Tonal.Mode.names()[params.mode - 1]

// 如果是C大调或者D小调，则简化音高
// 首先通过主音获得同名音高（就是不考虑八度的音高）
// 然后通过该主音的同名音高获得同名音高的调式
// 比较当前主音和同名主音的keySignature.length，取更短的一方作为主音
simplifyKeySignature()  # tonic


// 根据主音和调式，获得对应的音阶
this.notesInScale = Tonal.Mode.notes(this.mode, this.tonic);


// 这里不知道啥意思
this.notesInScalePitched = Tonal.Mode.notes(this.mode, `${this.tonic}3`);

//根据调式和主音获取Tonal内置的三和弦
//这里锁死了和弦，一种主音和调式只能对应到一个固定的和弦，例如
// Mode.triads("major", "C");
// => ["C", "Dm", "Em", "F", "G", "Am", "Bdim"];
this.chordsInScale = Tonal.Mode.triads(this.mode, this.tonic);


// 根据能量和情感度指定预参数
<!-- export class ProducerPreset {
  <!-- /** Instrument that plays the root note at the first beat beginning of each chord */
  bassLine: InstrumentConfiguration;

  /** Instrument that plays the entire chord at the first beat of each chord */
  harmony: InstrumentConfiguration;

  /** Instrument that plays an arpeggio at the first beat */
  firstBeatArpeggio: InstrumentConfiguration;

  /** First beat arpeggio pattern, played in eighth notes */
  firstBeatArpeggioPattern = [1, 5, 8, 9, 10];

  /** Instrument that plays the melody */
  melody: InstrumentConfiguration;

  /** Play the melody in octaves */
  melodyOctaves = false;

  public constructor(init?: Partial<ProducerPreset>) {
    Object.assign(this, init);
  }
} -->

<!-- export class InstrumentConfiguration {
  instrument: Instrument;

  /** Volume between [0, 1] */
  volume = 1;

  /** Octaves to shift up or down */
  octaveShift = 0;

  public constructor(init?: Partial<InstrumentConfiguration>) {
    Object.assign(this, init);
  }
} -->

preset = Presets.selectPreset(this.valence, this.energy)

// 生成swing
const swing = randomFromInterval(1, 10, this.energy) <= 1;

// 根据Chords，先获得ChordIndex，再根据刚才获得的和弦的音阶，生成和弦notes对应的array，型如["C", "Dm", "Em", "F", "G", "Am", "Bdim"];
this.chordsTonal = this.chords.map((c, chordNo) => {
    const chordIndex = this.chords[chordNo] - 1;
    const chordString = this.chordsInScale[chordIndex];
    // e.g. Chord.getChord("maj7", "G4")
    return Tonal.Chord.getChord(
    Tonal.Chord.get(chordString).aliases[0],
    `${this.notesInScale[chordIndex]}3`
    );
});

this.melodies = params.melodies;

// 生成前奏(未实现)
this.introLength = this.produceIntro();

// 生成verse(主体)部分
<!-- produceMain(): number {
    const numberOfIterations = Math.ceil(24 / this.chords.length);
    const length = this.chords.length * numberOfIterations;

    // the measure where the main part starts
    const measureStart = this.introLength;

    // number of bars at the beginning and end without a drumbeat
    const drumbeatPadding = this.chords.length > 8 ? 2 : 1;

    for (let i = 0; i < numberOfIterations; i += 1) {
      const iterationMeasure = measureStart + i * this.chords.length;
      this.startDrumbeat(`${i === 0 ? iterationMeasure + drumbeatPadding : iterationMeasure}:0`);
      this.endDrumbeat(`${measureStart + (i + 1) * this.chords.length - drumbeatPadding}:0`);

      this.produceIteration(iterationMeasure);
    }

    return length;
  } -->
this.mainLength = this.produceMain();
this.outroLength = this.produceOutro();

// 小节输 measure=bar
this.numMeasures = this.introLength + this.mainLength + this.outroLength;

// 混入雨声和黑胶唱片音
this.produceFx();



```