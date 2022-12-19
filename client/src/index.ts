import Sortable from 'sortablejs';
import Player, { RepeatMode } from './player';
import Producer from './producer';
import { ProduceParams, DEFAULT_OUTPUTPARAMS, HIDDEN_SIZE, OutputParams } from './params';
import { decompress, randn, Chord } from './helper';
import { decode, getPresets, addPreset, deletePreset } from './api';
import { Track } from './track';
import { getInstrumentName, Instrument } from './instruments';
import { InstrumentConfiguration, ProducerPreset, selectPreset } from './producer_presets';

const player = new Player();
var decodeParams = new OutputParams();
var produceParams = new ProduceParams();
const numberArray = Array<number>(HIDDEN_SIZE);
var lockedPreset: ProducerPreset = null;
// check if local storage is available
let localStorageAvailable = false;
try {
  const x = '__storage_test__';
  window.localStorage.setItem(x, x);
  window.localStorage.removeItem(x);
  localStorageAvailable = true;
} catch (e) {
  console.log('Local storage is unavailable');
}


// try to load playlist from local storage
// let playlistToLoad: OutputParams[] = [];
let playlistToLoad: Track[] = [];
if (localStorageAvailable) {
  const localStoragePlaylist = localStorage.getItem('playlist');
  if (localStoragePlaylist && localStoragePlaylist.length > 0 && localStoragePlaylist[0] != null) {
    try {
      let localList = JSON.parse(localStoragePlaylist);
      if (localList.length > 0 && localList[0] !== null) {
        playlistToLoad = localList;
      }
    } catch (e) {
      console.log('Error parsing', localStoragePlaylist);
    }
  }
}
const updateLocalStorage = () => {
  if (localStorageAvailable) {
    localStorage.setItem('playlist', JSON.stringify(player.playlist.map((t) => t)));
  }
};
player.updateLocalStorage = updateLocalStorage;

// load playlist in URL if possible
const queryString = window.location.search;
if (queryString.length > 0) {
  const compressedPlaylist = queryString === '?default' ? DEFAULT_OUTPUTPARAMS : queryString.substring(1);
  try {
    const decompressed = decompress(compressedPlaylist);
    const storageTracks: Track[] = JSON.parse(decompressed);
    window.history.pushState({}, null, window.location.href.split('?')[0]);
  } catch (e) {
    console.log('Error parsing', compressedPlaylist);
  }
}

if (playlistToLoad.length > 0) {
  player.playlist = playlistToLoad
  updateLocalStorage();
}

const instSelectorIds = ['bassLine-inst', 'harmony-inst', 'fba-inst', 'melody-inst'];
const instNames = Object.keys(Instrument).filter((key) => isNaN(Number(key)));
instSelectorIds.forEach((id) => {
  const instSelector = document.getElementById(id) as HTMLSelectElement;
  instNames.forEach(name => {
    let option = document.createElement('option');
    option.text = name;
    option.value = Instrument[name as keyof typeof Instrument].toString();
    instSelector.add(option);
  });
  instSelector.selectedIndex = -1;
});

// Generate button
const generateButton = document.getElementById('generate-button') as HTMLButtonElement;
const loadingAnimation = document.getElementById('loading-animation');
generateButton.addEventListener('click', async () => {
  generateButton.disabled = true;
  loadingAnimation.style.display = null;
  for (let i = 0; i < HIDDEN_SIZE; i += 1) {
    numberArray[i] = randn();
  }
  let params;
  try {
    params = await decode(numberArray);
    params.octave = 3;
  } catch (err) {
    generateButton.textContent = 'Error!';
    return;
  }
  displayDecodeParams(params);
  loadingAnimation.style.display = 'none';
  generateButton.disabled = false;
});

function displayDecodeParams(params: OutputParams) {
  const title = document.getElementById('hash') as HTMLInputElement;
  const key = document.getElementById('key') as HTMLInputElement;
  const mode = document.getElementById('mode') as HTMLInputElement;
  const bpm = document.getElementById('bpm') as HTMLInputElement;
  const energy = document.getElementById('energy') as HTMLInputElement;
  const valence = document.getElementById('valence') as HTMLInputElement;
  const chords = document.getElementById('chords') as HTMLInputElement;
  const octave = document.getElementById('octave') as HTMLInputElement;
  const melodies = document.getElementById('melodies') as HTMLInputElement;

  key.value = params.key.toString();
  title.value = params.title
  mode.value = params.mode.toString();
  bpm.value = params.bpm.toString();
  energy.value = params.energy.toString();
  valence.value = params.valence.toString();
  chords.value = params.chords.toString();
  octave.value = params.octave.toString();
  melodies.value = params.melodies.map((m) => m.join(' ')).join('\n');
}

function updateDecodeParams(): OutputParams {
  const title = document.getElementById('hash') as HTMLInputElement;
  const key = document.getElementById('key') as HTMLInputElement;
  const mode = document.getElementById('mode') as HTMLInputElement;
  const bpm = document.getElementById('bpm') as HTMLInputElement;
  const energy = document.getElementById('energy') as HTMLInputElement;
  const valence = document.getElementById('valence') as HTMLInputElement;
  const chords = document.getElementById('chords') as HTMLInputElement;
  const octave = document.getElementById('octave') as HTMLInputElement;
  const melodies = document.getElementById('melodies') as HTMLInputElement;
  decodeParams.title = title.value;
  decodeParams.key = parseInt(key.value);
  decodeParams.mode = parseInt(mode.value);
  decodeParams.bpm = parseInt(bpm.value);
  decodeParams.energy = parseFloat(energy.value);
  decodeParams.valence = parseFloat(valence.value);
  decodeParams.chords = chords.value.split(',').map((c) => parseInt(c));
  decodeParams.octave = parseInt(octave.value);
  decodeParams.melodies = melodies.value.split('\n').map((m) => m.split(' ').map((n) => parseInt(n)));
  return decodeParams;
}

async function displayProduceParams(params: ProduceParams) {
  document.getElementById('tonic').innerText = params.tonic;
  document.getElementById('mode-name').innerText = params.mode;
  document.getElementById('bpm-mapped').innerText = params.bpm.toString();
  const meterNumerator = document.getElementById('meter-numerator') as HTMLInputElement;
  const meterDenominator = document.getElementById('meter-denominator') as HTMLInputElement;

  const chord_scales = document.getElementById('chord-scales') as HTMLInputElement;
  const note_scales = document.getElementById('note-scales') as HTMLInputElement;
  const chords = document.getElementById('chord-notes') as HTMLTextAreaElement;

  const bassLine_inst = document.getElementById('bassLine-inst') as HTMLSelectElement;
  const bassLine_vol = document.getElementById('bassLine-vol') as HTMLInputElement;
  const bassLine_os = document.getElementById('bassLine-os') as HTMLInputElement;
  const harmony_inst = document.getElementById('harmony-inst') as HTMLSelectElement;
  const harmony_vol = document.getElementById('harmony-vol') as HTMLInputElement;
  const harmony_os = document.getElementById('harmony-os') as HTMLInputElement;
  const melody_inst = document.getElementById('melody-inst') as HTMLSelectElement;
  const melody_vol = document.getElementById('melody-vol') as HTMLInputElement;
  const melody_os = document.getElementById('melody-os') as HTMLInputElement;
  const fba_inst = document.getElementById('fba-inst') as HTMLSelectElement;
  const fba_vol = document.getElementById('fba-vol') as HTMLInputElement;
  const fba_os = document.getElementById('fba-os') as HTMLInputElement;
  const fbap = document.getElementById('fbap') as HTMLInputElement;
  const swing = document.getElementById('swing-check') as HTMLInputElement;
  const presetSelector = document.getElementById('preset-select') as HTMLSelectElement;
  const presetName = document.getElementById('preset-name') as HTMLInputElement;
  const drumbeatCheck = document.getElementById('drumbeat-check') as HTMLInputElement;

  drumbeatCheck.checked = params.withDrumBeat;
  note_scales.value = params.note_scales.toString();
  chord_scales.value = params.chord_scales.toString();
  chords.value = params.chords.map((c) => c.notes.join(' ')).join("\n");
  meterNumerator.value = params.meter[0].toString();
  meterDenominator.value = params.meter[1].toString();
  swing.value = params.swing.toString();

  let presetArr = await getPresets();
  while (presetSelector.firstChild) {
    presetSelector.removeChild(presetSelector.firstChild);
  }

  presetArr.forEach((p, i) => {
    let option = document.createElement('option');
    option.value = i.toString();
    option.text = p.name;
    presetSelector.appendChild(option);
  });

  presetSelector.onchange = () => {
    if (presetSelector.selectedIndex >= 0) {
      let p = presetArr[presetSelector.selectedIndex];
      presetName.value = p.name;
      bassLine_inst.selectedIndex = p.bassLine.instrument;
      bassLine_vol.value = p.bassLine.volume.toString();
      bassLine_os.value = p.bassLine.octaveShift.toString();

      harmony_inst.selectedIndex = p.harmony.instrument;
      harmony_vol.value = p.harmony.volume.toString();
      harmony_os.value = p.harmony.octaveShift.toString();

      melody_inst.selectedIndex = p.melody.instrument;
      melody_vol.value = p.melody.volume.toString();
      melody_os.value = p.melody.octaveShift.toString();

      fba_inst.selectedIndex = p.firstBeatArpeggio ? p.firstBeatArpeggio.instrument : -1;
      fba_vol.value = p.firstBeatArpeggio ? p.firstBeatArpeggio.volume.toString() : "0";
      fba_os.value = p.firstBeatArpeggio ? p.firstBeatArpeggio.octaveShift.toString() : "0";
      fbap.value = p.firstBeatArpeggioPattern.toString();
    }
  };

  presetSelector.selectedIndex = presetArr.findIndex((p) => p.name == params.preset.name);
  presetSelector.onchange();

  let preset = new ProducerPreset({
    bassLine: new InstrumentConfiguration({
      instrument: bassLine_inst.selectedIndex,
      volume: parseFloat(bassLine_vol.value),
      octaveShift: parseInt(bassLine_os.value),
    }),
    harmony: new InstrumentConfiguration({
      instrument: harmony_inst.selectedIndex,
      volume: parseFloat(harmony_vol.value),
      octaveShift: parseInt(harmony_os.value),
    }),
    melody: new InstrumentConfiguration({
      instrument: melody_inst.selectedIndex,
      volume: parseFloat(melody_vol.value),
      octaveShift: parseInt(melody_os.value),
    }),
    firstBeatArpeggio: fba_inst.selectedIndex === -1 ? null : new InstrumentConfiguration({
      instrument: fba_inst.selectedIndex,
      volume: parseFloat(fba_vol.value),
      octaveShift: parseInt(fba_os.value),
    }),
    firstBeatArpeggioPattern: fbap.value ? fbap.value.split(',').map((s) => parseInt(s)) : null,
    melodyOctaves: true,
    name: presetName.value,
  });

  bassLine_inst.selectedIndex = preset.bassLine.instrument;
  bassLine_vol.value = preset.bassLine.volume.toString();
  bassLine_os.value = preset.bassLine.octaveShift.toString();

  harmony_inst.selectedIndex = preset.harmony.instrument;
  harmony_vol.value = preset.harmony.volume.toString();
  harmony_os.value = preset.harmony.octaveShift.toString();

  melody_inst.selectedIndex = preset.melody.instrument;
  melody_vol.value = preset.melody.volume.toString();
  melody_os.value = preset.melody.octaveShift.toString();

  fba_inst.selectedIndex = preset.firstBeatArpeggio ? preset.firstBeatArpeggio.instrument : -1;
  fba_vol.value = preset.firstBeatArpeggio ? preset.firstBeatArpeggio.volume.toString() : "0";
  fba_os.value = preset.firstBeatArpeggio ? preset.firstBeatArpeggio.octaveShift.toString() : "0";

  fbap.value = preset.firstBeatArpeggioPattern ? preset.firstBeatArpeggioPattern.toString() : null;

  params.preset = preset;
  params.swing = swing.checked;
};

const addPresetButton = document.getElementById('preset-add');
addPresetButton.addEventListener('click', async () => {
  updateProduceParams();
  try {
    await addPreset(produceParams.preset);
  } catch (error) {
    alert(`Failed to add preset: ${error}`);
  }
  displayProduceParams(produceParams);
});


const delPresetButton = document.getElementById('preset-del');
delPresetButton.addEventListener('click', async () => {
  const presetSelector = document.getElementById('preset-select') as HTMLSelectElement;
  let presetName = presetSelector.options[presetSelector.selectedIndex].text;
  try {
    await deletePreset(presetName);
  } catch (error) {
    alert(`Failed to delete preset: ${error}`);
  }
  displayProduceParams(produceParams);
});



function updateProduceParams(): ProduceParams {
  const title = document.getElementById('hash') as HTMLInputElement;
  const note_scales = document.getElementById('note-scales') as HTMLInputElement;
  const chord_scales = document.getElementById('chord-scales') as HTMLInputElement;
  const chords = document.getElementById('chord-notes') as HTMLTextAreaElement;
  const bassLine_inst = document.getElementById('bassLine-inst') as HTMLSelectElement;
  const bassLine_vol = document.getElementById('bassLine-vol') as HTMLInputElement;
  const bassLine_os = document.getElementById('bassLine-os') as HTMLInputElement;
  const harmony_inst = document.getElementById('harmony-inst') as HTMLSelectElement;
  const harmony_vol = document.getElementById('harmony-vol') as HTMLInputElement;
  const harmony_os = document.getElementById('harmony-os') as HTMLInputElement;
  const melody_inst = document.getElementById('melody-inst') as HTMLSelectElement;
  const melody_vol = document.getElementById('melody-vol') as HTMLInputElement;
  const melody_os = document.getElementById('melody-os') as HTMLInputElement;
  const fba_inst = document.getElementById('fba-inst') as HTMLSelectElement;
  const fba_vol = document.getElementById('fba-vol') as HTMLInputElement;
  const fba_os = document.getElementById('fba-os') as HTMLInputElement;
  const fbap = document.getElementById('fbap') as HTMLInputElement;
  const meterNumerator = document.getElementById('meter-numerator') as HTMLInputElement;
  const meterDenominator = document.getElementById('meter-denominator') as HTMLInputElement;
  const presetName = document.getElementById('preset-name') as HTMLInputElement;
  const drumbeatCheck = document.getElementById('drumbeat-check') as HTMLInputElement;


  produceParams.title = title.value;
  produceParams.tonic = document.getElementById('tonic').innerText;
  produceParams.mode = document.getElementById('mode-name').innerText;
  produceParams.bpm = parseInt(document.getElementById('bpm-mapped').innerText);
  produceParams.note_scales = note_scales.value.split(',');
  produceParams.chord_scales = chord_scales.value.split(',');
  produceParams.chords = chords.value.split("\n").map((c) => new Chord({ empty: c == '', notes: c.split(' ') }));
  produceParams.swing = document.getElementById('swing-check').innerText == 'true';
  produceParams.meter[0] = parseInt(meterNumerator.value);
  produceParams.meter[1] = parseInt(meterDenominator.value);

  produceParams.title = title.value;
  produceParams.tonic = document.getElementById('tonic').innerText;
  produceParams.mode = document.getElementById('mode-name').innerText;
  produceParams.bpm = parseInt(document.getElementById('bpm-mapped').innerText);
  produceParams.note_scales = note_scales.value.split(',');
  produceParams.chord_scales = chord_scales.value.split(',');
  produceParams.chords = chords.value.split("\n").map((c) => new Chord({ empty: c == '', notes: c.split(' ') }));
  produceParams.swing = document.getElementById('swing-check').innerText == 'true';
  produceParams.withDrumBeat = drumbeatCheck.checked;

  let bassPrest = new InstrumentConfiguration({
    instrument: +bassLine_inst.selectedIndex,
    volume: +bassLine_vol.value,
    octaveShift: +bassLine_os.value
  });

  let harmonyPrest = new InstrumentConfiguration({
    instrument: +harmony_inst.selectedIndex,
    volume: +harmony_vol.value,
    octaveShift: +harmony_os.value
  });

  let melodyPrest = new InstrumentConfiguration({
    instrument: +melody_inst.selectedIndex,
    volume: +melody_vol.value,
    octaveShift: +melody_os.value
  });

  let firstBeatArpeggioPrest = fba_inst.selectedIndex !== -1 ? new InstrumentConfiguration({
    instrument: +fba_inst.selectedIndex,
    volume: +fba_vol.value,
    octaveShift: +fba_os.value
  }) : null;

  let firstBeatArpeggioPatternPrest = fbap.value.split(',').map((c) => +c);

  produceParams.preset = new ProducerPreset({ name: presetName.value, bassLine: bassPrest, harmony: harmonyPrest, melody: melodyPrest, firstBeatArpeggio: firstBeatArpeggioPrest, firstBeatArpeggioPattern: firstBeatArpeggioPatternPrest });
  return produceParams
}


function displayTrack(track: Track) {
  const inst_notes = document.getElementById('track-table') as HTMLTableElement;
  for (let i = inst_notes.rows.length - 1; i > 0; i--) {
    inst_notes.deleteRow(i);
  }

  for (let i = 0; i < track.instrumentNotes.length; i++) {
    let row = inst_notes.insertRow(i + 1);
    let cell = row.insertCell(0);
    cell.innerHTML = getInstrumentName(track.instrumentNotes[i].instrument);
    cell = row.insertCell(1);
    cell.innerHTML = track.instrumentNotes[i].pitch.toString();
    cell = row.insertCell(2);
    cell.innerHTML = track.instrumentNotes[i].time.toString();
    cell = row.insertCell(3);
    cell.innerHTML = track.instrumentNotes[i].duration ? track.instrumentNotes[i].duration.toString() : null;
    cell = row.insertCell(4);
    cell.innerHTML = track.instrumentNotes[i].velocity ? track.instrumentNotes[i].velocity.toString() : null;
  }
}


// function getTrack(): Track {
//   const track = new Track();

//   let inst_notes = document.getElementById('inst-notes') as HTMLTextAreaElement;
//   let note_arr = inst_notes.value.split('\n').map((c) => c.split('|'));
//   let title = document.getElementById('hash') as HTMLInputElement;
//   let keyNum = document.getElementById('key') as HTMLInputElement;
//   let modeNum = document.getElementById('mode') as HTMLInputElement;
//   let swing = document.getElementById('swing-check') as HTMLInputElement;
//   let numMeasures = document.getElementById('num-measures').innerText;
//   let bpm = parseInt(document.getElementById('bpm-mapped').innerText);
//   let mode = document.getElementById('mode-name').innerText;


//   track.instrumentNotes = note_arr.map((c) => new InstrumentNote(
//     parseInt(c[0]), c[1], c[2], c[3], c[4]?parseFloat(c[4]) : null));  
//   return track
// }

// decode button
const decodeButton = document.getElementById('decode-button') as HTMLButtonElement;
decodeButton.addEventListener('click', async () => {
  loadingAnimation.style.display = null;
  try {
    updateDecodeParams();
  } catch (err) {
    console.log(err)
    generateButton.textContent = 'Error!';
    return;
  } finally {
    loadingAnimation.style.display = 'none';
  }
  let producer = new Producer();
  produceParams = producer.decode(decodeParams);

  if (lockedPreset) {
    produceParams.preset = lockedPreset;
  }

  displayProduceParams(produceParams);
});

// produce button
const produceButton = document.getElementById('produce-button') as HTMLButtonElement;
produceButton.addEventListener('click', async () => {
  loadingAnimation.style.display = null;
  updateProduceParams();
  produceParams.outputParams = decodeParams;
  let producer = new Producer();
  producer.decode(decodeParams)
  const track = producer.produce_track(produceParams);
  displayTrack(track);
  player.addToPlaylist(track, true);
  playlistContainer.scrollTop = playlistContainer.scrollHeight;
  loadingAnimation.style.display = 'none';
});

// burn button
// const burnButton = document.getElementById('burn-button') as HTMLButtonElement;
// burnButton.addEventListener('click', async () => {
//   const track = getTrack();
//   player.addToPlaylist(track, true);
//   // player.addToPlaylist(track2, true);
//   // scroll to end of playlist
//   playlistContainer.scrollTop = playlistContainer.scrollHeight;
//   loadingAnimation.style.display = 'none';
// });

/** Formats seconds into an MM:SS string */
const formatTime = (seconds: number) => {
  if (!seconds || seconds < 0) return '0:00';
  return `${Math.floor(seconds / 60)}:${`0${Math.floor(seconds % 60)}`.slice(-2)}`;
};

// Seekbar
const seekbar = document.getElementById('seekbar') as HTMLInputElement;
seekbar.addEventListener('input', () => {
  timeLabel.textContent = formatTime(seekbar.valueAsNumber);
  formatInputRange(seekbar, '#fc5c8c');
});
let wasPaused = false;
let seekbarDragging = false;
['mousedown', 'touchstart'].forEach((e) => seekbar.addEventListener(e, () => {
  seekbarDragging = true;
  wasPaused = !player.isPlaying;
  if (!wasPaused) {
    player.pause();
  }
}));
['mouseup', 'touchend'].forEach((e) => seekbar.addEventListener(e, () => {
  seekbarDragging = false;
  player.seek(seekbar.valueAsNumber);
  if (!wasPaused) {
    player.play();
  }
}));

// Visualizer
const visualizer = document.getElementById('visualizer');
const spectrumBars: HTMLDivElement[] = [];
for (let i = 0; i < 22; i += 1) {
  const spectrumBar = document.createElement('div');
  spectrumBar.classList.add('spectrum-bar');
  visualizer.appendChild(spectrumBar);
  spectrumBars.push(spectrumBar);
}
const minDecibels = -100;
const maxDecibels = -10;
const updateVisualization = (spectrum: Float32Array) => {
  spectrumBars.forEach((bar: HTMLDivElement, i) => {
    if (spectrum) {
      const val = Math.min(maxDecibels, Math.max(minDecibels, spectrum[i]));
      const scaled = (100 / (maxDecibels - minDecibels)) * (val - minDecibels);
      bar.style.height = `${scaled}%`;
    } else {
      bar.style.height = '0%';
    }
  });
};

// Track details and time
const titleLabel = document.getElementById('title');
const timeLabel = document.getElementById('current-time');
const totalTimeLabel = document.getElementById('total-time');
const audio = document.getElementById('audio') as HTMLAudioElement; // dummy audio for Media Session API
const formatInputRange = (input: HTMLInputElement, color: string) => {
  const value = ((input.valueAsNumber - +input.min) / (+input.max - +input.min)) * 100;
  if (!value) {
    input.style.background = 'rgba(0, 0, 0, 0.25)';
  }
  input.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${value}%, rgba(0, 0, 0, 0.25) ${value}%, rgba(0, 0, 0, 0.25) 100%)`;
};
player.updateTrackDisplay = (seconds?: number, spectrum?: Float32Array) => {
  // don't update display while seekbar is being dragged
  if (seekbarDragging) return;

  if (player.currentTrack) {
    vinyl.style.opacity = '1';

    titleLabel.textContent = player.currentTrack.title;
    const totalLength = player.currentTrack.length;
    seekbar.max = `${totalLength}`;
    seekbar.valueAsNumber = +seconds;
    // when current time is within 0.1s of total length, display total length
    timeLabel.textContent = formatTime(seconds);
    totalTimeLabel.textContent = formatTime(totalLength);
    vinyl.style.transform = `rotate(${seconds * 8}deg)`;
  } else {
    vinyl.style.opacity = '0.5';
    titleLabel.textContent = '';
    seekbar.valueAsNumber = 0;
    seekbar.max = '0';
    timeLabel.textContent = '0:00';
    totalTimeLabel.textContent = '0:00';
  }
  formatInputRange(seekbar, '#fc5c8c');
  updateVisualization(spectrum);
};

// On track change
const vinyl = document.getElementById('vinyl');
const vinylColor = document.getElementById('vinyl-color');
const vinylBottomText1 = document.getElementById('vinyl-bottom-text1');
const vinylBottomText2 = document.getElementById('vinyl-bottom-text2');
const playlistContainer = document.getElementById('playlist-tracks');
const updateTrackClasses = () => {
  player.playlist.forEach((track, i) => {
    const trackElements = playlistContainer.querySelectorAll('.track');
    const trackElement = trackElements[i];
    trackElement.classList.toggle('playing', player.currentTrack === track);
    trackElement.classList.toggle('loading', player.currentTrack === track && player.isLoading);
  });
};
const onTrackChange = () => {
  updateTrackClasses();

  if (player.currentTrack) {
    vinylBottomText1.textContent = `${player.currentTrack.key} ${player.currentTrack.mode}`;
    vinylBottomText2.textContent = player.currentTrack.title.substring(0, 10);
    vinylColor.setAttribute('fill', player.currentTrack.color);
  } else {
    vinylBottomText1.textContent = '';
    vinylBottomText2.textContent = '';
    vinylColor.setAttribute('fill', '#eee');
  }
};
player.onTrackChange = onTrackChange;

// Playlist
const updatePlaylistDisplay = () => {
  playlistContainer.innerHTML = '';
  player.playlist.forEach((track, i) => {
    const template = document.getElementById('playlist-track') as HTMLTemplateElement;
    const trackElement = (template.content.cloneNode(true) as HTMLElement).querySelector(
      '.track'
    ) as HTMLDivElement;

    const name = trackElement.querySelector('.track-name');
    name.textContent = track.title;
    const duration = trackElement.querySelector('.track-duration');
    duration.textContent = formatTime(track.length);

    if (track === player.currentTrack) {
      trackElement.classList.add('playing');
    }
    trackElement.addEventListener('click', async (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'BUTTON') return;
      player.playTrack(i);
      console.log(track.outputParams);
    });

    const deleteButton = trackElement.querySelector('.delete-button');
    deleteButton.addEventListener('click', async () => {
      player.deleteTrack(i);
    });

    playlistContainer.appendChild(trackElement);
  });
};
player.updatePlaylistDisplay = updatePlaylistDisplay;
Sortable.create(playlistContainer, {
  animation: 250,
  delay: 400,
  delayOnTouchOnly: true,
  ghostClass: 'dragging',
  onEnd: (event) => {
    const element = player.playlist[event.oldIndex];
    player.playlist.splice(event.oldIndex, 1);
    player.playlist.splice(event.newIndex, 0, element);
    if (player.currentPlayingIndex === event.oldIndex) {
      player.currentPlayingIndex = event.newIndex;
    }
    updatePlaylistDisplay();
    updateLocalStorage();
  }
});
updatePlaylistDisplay();

// Player controls
const playButton = document.getElementById('play-button');
const playPreviousButton = document.getElementById('play-previous-button');
const playNextButton = document.getElementById('play-next-button');
const repeatButton = document.getElementById('repeat-button');
const shuffleButton = document.getElementById('shuffle-button');
const volumeButton = document.getElementById('volume-button');
const volumeBar = document.getElementById('volume-bar') as HTMLInputElement;
player.getGain = () => volumeBar.valueAsNumber;
const updatePlayingState = () => {
  if (player.isPlaying) {
    playButton.classList.toggle('paused', true);
    audio.play();
  } else {
    playButton.classList.toggle('paused', false);
    audio.pause();
  }
};
player.onPlayingStateChange = updatePlayingState;
player.onLoadingStateChange = updateTrackClasses;
playButton.addEventListener('click', async () => {
  if (player.isPlaying) {
    player.pause();
  } else {
    player.play();
    if (!player.muted) {
      player.gain.gain.value = volumeBar.valueAsNumber;
    }
  }
});
playPreviousButton.addEventListener('click', async () => {
  player.playPrevious();
});
playNextButton.addEventListener('click', async () => {
  player.playNext();
});
repeatButton.addEventListener('click', async () => {
  switch (player.repeat) {
    case RepeatMode.ALL: {
      player.repeat = RepeatMode.ONE;
      repeatButton.classList.remove('repeat-all');
      repeatButton.classList.add('repeat-one');
      break;
    }
    case RepeatMode.ONE: {
      player.repeat = RepeatMode.NONE;
      repeatButton.classList.remove('repeat-one');
      break;
    }
    default: {
      player.repeat = RepeatMode.ALL;
      repeatButton.classList.add('repeat-all');
      break;
    }
  }
});
shuffleButton.addEventListener('click', async () => {
  player.shuffle = !player.shuffle;
  shuffleButton.classList.toggle('active', player.shuffle);
});
volumeButton.addEventListener('click', async () => {
  if (player.gain) {
    player.gain.gain.value = volumeBar.valueAsNumber;
  }
  player.muted = !player.muted;
  volumeButton.classList.toggle('muted', player.muted);
});
volumeBar.addEventListener('input', () => {
  if (player.muted) {
    volumeButton.click();
  }
  if (player.isPlaying) {
    player.gain.gain.value = volumeBar.valueAsNumber;
  }
  formatInputRange(volumeBar, '#fff');
});
formatInputRange(volumeBar, '#fff');


// Export
const exportButton = document.getElementById('export-button');
const exportPanel = document.getElementById('export-panel');
const exportUrlInput = document.getElementById('export-url-input') as HTMLInputElement;
const copyButton = document.getElementById('copy-button');
exportButton.addEventListener('click', async () => {
  if (exportPanel.style.visibility === 'visible') {
    exportPanel.style.visibility = 'hidden';
    exportPanel.style.opacity = '0';
  } else {
    exportPanel.style.visibility = 'visible';
    exportPanel.style.opacity = '1';
    const url = player.getExportUrl();
    exportUrlInput.value = url;
    // wait for panel to become visible before we can select the text field
    setTimeout(() => {
      exportUrlInput.select();
    }, 50);
  }
});
exportUrlInput.addEventListener('click', async () => {
  exportUrlInput.select();
});
copyButton.addEventListener('click', async () => {
  document.execCommand('copy');
  exportPanel.style.visibility = 'hidden';
  exportPanel.style.opacity = '0';
});

// Media Session API
const actionsAndHandlers = [
  ['play', () => { player.play(); }],
  ['pause', () => { player.pause(); }],
  ['previoustrack', () => { player.playPrevious(); }],
  ['nexttrack', () => { player.playNext(); }],
  ['seekbackward', (details: MediaSessionActionDetails) => { player.seekRelative(-5); }],
  ['seekforward', (details: MediaSessionActionDetails) => { player.seekRelative(5); }],
  ['seekto', (details: MediaSessionActionDetails) => { player.seek(details.seekTime); }],
  ['stop', () => { player.unload(); }]
];
for (const [action, handler] of actionsAndHandlers) {
  try {
    navigator.mediaSession.setActionHandler(action as any, handler as any);
  } catch (error) {
    console.log(`The media session action ${action}, is not supported`);
  }
}


const lockPresetButton = document.getElementById('preset-lock');
lockPresetButton.addEventListener('click', async () => {
  const presetSelector = document.getElementById('preset-select') as HTMLSelectElement;
  if (lockPresetButton.innerText === 'lock') {
    lockPresetButton.innerText = 'unkock';
    updateProduceParams();
    lockedPreset = produceParams.preset;
    presetSelector.disabled = true;
  } else {
    lockPresetButton.innerText = 'lock';
    presetSelector.disabled = false;
    lockedPreset = null;
  }

});


const recordButton = document.getElementById('record-button');
const recordNum = document.getElementById('record-num') as HTMLInputElement;
recordButton.addEventListener('click', async () => {
  loadingAnimation.style.display = null;
  player.ifRecord = true;
  let total = parseInt(recordNum.value);
  document.getElementById('progress').innerText = `0/${total}`;
  for (let i = 0; i < total; i++) {
    try {
      // generateButton.click();
      for (let i = 0; i < HIDDEN_SIZE; i += 1) {
        numberArray[i] = randn();
      }
      let params = await decode(numberArray);
      params.octave = 3;
      displayDecodeParams(params);

      // decodeButton.click();
      let producer = new Producer();
      let prodParams = producer.decode(params);
      displayProduceParams(prodParams);

      // produceButton.click();
      prodParams.outputParams = params;
      const track = producer.produce_track(prodParams);
      displayTrack(track);
      player.addToPlaylist(track, true);
      await new Promise((resolve) => setTimeout(resolve, 2000 + player.currentTrack.length * 1000));
      player.deleteTrack(player.playlist.length - 1)
      document.getElementById('progress').innerText = `${i + 1}/${total}`;
    } catch (error) {
      console.log(error);
    }
  }

  player.ifRecord = false;
  // document.getElementById('progress').innerText = `${player.recordBlobs.length}/${player.recordNum}`;
  loadingAnimation.style.display = 'none';
});


const clearButton = document.getElementById('clear-button');
clearButton.addEventListener('click', async () => {
  for (let i = player.playlist.length; i >= 0; i--) {
    player.deleteTrack(i);
  };
});