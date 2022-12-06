import Sortable from 'sortablejs';
import Player, { RepeatMode } from './player';
import Producer from './producer';
import { DecodeParams, DEFAULT_OUTPUTPARAMS, HIDDEN_SIZE, OutputParams } from './params';
import { decompress, randn, Chord } from './helper';
import { decode } from './api';
import { Instrument } from './instruments';
import { InstrumentConfiguration, ProducerPreset } from './producer_presets';

const player = new Player();
const producer = new Producer();

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
let playlistToLoad: OutputParams[] = [];
if (localStorageAvailable) {
  const localStoragePlaylist = localStorage.getItem('playlist');
  if (localStoragePlaylist) {
    try {
      playlistToLoad = JSON.parse(localStoragePlaylist);
    } catch (e) {
      console.log('Error parsing', localStoragePlaylist);
    }
  }
}
const updateLocalStorage = () => {
  if (localStorageAvailable) {
    localStorage.setItem('playlist', JSON.stringify(player.playlist.map((t) => t.outputParams)));
  }
};
player.updateLocalStorage = updateLocalStorage;

// load playlist in URL if possible
const queryString = window.location.search;
if (queryString.length > 0) {
  const compressedPlaylist = queryString === '?default' ? DEFAULT_OUTPUTPARAMS : queryString.substring(1);
  try {
    const decompressed = decompress(compressedPlaylist);
    const outputParams: OutputParams[] = JSON.parse(decompressed);
    playlistToLoad = [
      ...playlistToLoad.filter((p) => outputParams.every((p2) => p2.title !== p.title)),
      ...outputParams
    ];
    window.history.pushState({}, null, window.location.href.split('?')[0]);
  } catch (e) {
    console.log('Error parsing', compressedPlaylist);
  }
}

if (playlistToLoad.length > 0) {
  const playlist = playlistToLoad.map((params) => {
    const producer = new Producer();
    return producer.produce(params);
  });
  player.playlist = playlist;
  updateLocalStorage();
}

// Sliders
const slidersEl = document.getElementById('sliders');
const sliders: HTMLInputElement[] = [];
for (let i = 0; i < HIDDEN_SIZE; i += 1) {
  const slider = document.createElement('input') as HTMLInputElement;
  slider.type = 'range';
  slider.min = '-4';
  slider.max = '4';
  slider.step = '0.01';
  slider.valueAsNumber = randn();
  slidersEl.appendChild(slider);
  sliders.push(slider);
}

// Help button
const helpButton = document.getElementById('help');
const introText = document.getElementById('intro-text');
helpButton.addEventListener('click', () => {
  if (introText.style.maxHeight) {
    introText.style.maxHeight = null;
  } else {
    introText.style.maxHeight = '200px';
  }
});

// Refresh Button
const refreshButton = document.getElementById('refresh-button');
refreshButton.addEventListener('click', () => {
  sliders.forEach((s) => {
    s.valueAsNumber = randn();
  });
});

// Generate button
const generateButton = document.getElementById('generate-button') as HTMLButtonElement;
const loadingAnimation = document.getElementById('loading-animation');
generateButton.addEventListener('click', async () => {
  generateButton.disabled = true;
  loadingAnimation.style.display = null;

  const numberArray = sliders.map((n) => n.valueAsNumber);

  let params;
  try {
    params = await decode(numberArray);
    params.octave = 3;
  } catch (err) {
    generateButton.textContent = 'Error!';
    return;
  }
  displayDecodeParams(params);

  // const producer = new Producer();
  // const track = producer.produce(params);
  // player.addToPlaylist(track, true);
  // // scroll to end of playlist
  // playlistContainer.scrollTop = playlistContainer.scrollHeight;

  // generateButton.disabled = false;
  loadingAnimation.style.display = 'none';
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

function getDecodeParams(): OutputParams {
  const title = document.getElementById('hash') as HTMLInputElement;
  const key = document.getElementById('key') as HTMLInputElement;
  const mode = document.getElementById('mode') as HTMLInputElement;
  const bpm = document.getElementById('bpm') as HTMLInputElement;
  const energy = document.getElementById('energy') as HTMLInputElement;
  const valence = document.getElementById('valence') as HTMLInputElement;
  const chords = document.getElementById('chords') as HTMLInputElement;
  const octave = document.getElementById('octave') as HTMLInputElement;
  const melodies = document.getElementById('melodies') as HTMLInputElement;
  return new OutputParams({
    title: title.value,
    key: parseInt(key.value),
    mode: parseInt(mode.value),
    bpm: parseInt(bpm.value),
    energy: parseFloat(energy.value),
    valence: parseFloat(valence.value),
    chords: chords.value.split(',').map((c) => parseInt(c)),
    octave: parseInt(octave.value),
    melodies: melodies.value.split('\n').map((m) => m.split(' ').map((n) => parseInt(n))),
  });
}

function displayProduceParams(params: DecodeParams) {
  document.getElementById('hash-produce').innerText = params.title.slice(0, 10);
  document.getElementById('tonic').innerText = params.tonic;
  document.getElementById('mode-name').innerText = params.mode;
  document.getElementById('bpm-mapped').innerText = params.bpm.toString();
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

  note_scales.value = params.note_scales.toString();
  chord_scales.value = params.chord_scales.toString();
  chords.value = params.chords.map((c) => c.notes.join(' ')).join("\n");

  bassLine_inst.selectedIndex = params.preset.bassLine.instrument;
  bassLine_vol.value = params.preset.bassLine.volume.toString();
  bassLine_os.value = params.preset.bassLine.octaveShift.toString();

  harmony_inst.selectedIndex = params.preset.harmony.instrument;
  harmony_vol.value = params.preset.harmony.volume.toString();
  harmony_os.value = params.preset.harmony.octaveShift.toString();

  melody_inst.selectedIndex = params.preset.melody.instrument;
  melody_vol.value = params.preset.melody.volume.toString();
  melody_os.value = params.preset.melody.octaveShift.toString();

  fba_inst.selectedIndex = params.preset.firstBeatArpeggio ? params.preset.firstBeatArpeggio.instrument : -1;
  fba_vol.value = params.preset.firstBeatArpeggio ? params.preset.firstBeatArpeggio.volume.toString() : "0";
  fba_os.value = params.preset.firstBeatArpeggio ? params.preset.firstBeatArpeggio.octaveShift.toString() : "0";

  fbap.value = params.preset.firstBeatArpeggioPattern.toString();
};

function getProduceParams(): DecodeParams {
  const params = new DecodeParams();
  params.title = document.getElementById('hash').innerText;
  params.tonic = document.getElementById('tonic').innerText;
  params.mode = document.getElementById('mode-name').innerText;
  params.bpm = +document.getElementById('bpm-mapped').innerText;
  params.note_scales = (document.getElementById('note-scales') as HTMLInputElement).value.split(',');
  params.chord_scales = (document.getElementById('chord-scales') as HTMLInputElement).value.split(',');
  params.chords = (document.getElementById('chord-notes') as HTMLTextAreaElement).value.split("\n").map((c) => new Chord({ empty: c == '', notes: c.split(' ') }));

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

  params.preset = new ProducerPreset({ bassLine: bassPrest, harmony: harmonyPrest, melody: melodyPrest, firstBeatArpeggio: firstBeatArpeggioPrest, firstBeatArpeggioPattern: firstBeatArpeggioPatternPrest });
  return params
}

// decode button
const decodeButton = document.getElementById('decode-button') as HTMLButtonElement;
decodeButton.addEventListener('click', async () => {
  generateButton.disabled = true;
  loadingAnimation.style.display = null;
  let params = new OutputParams()
  try {
    const title = document.getElementById('hash') as HTMLInputElement;
    params.title = title.value

    const key = document.getElementById('key') as HTMLInputElement;
    params.key = +key.value

    const mode = document.getElementById('mode') as HTMLInputElement;
    params.mode = +mode.value

    const bpm = document.getElementById('bpm') as HTMLInputElement;
    params.bpm = +bpm.value

    const energy = document.getElementById('energy') as HTMLInputElement;
    params.energy = +energy.value

    const valence = document.getElementById('valence') as HTMLInputElement;
    params.valence = +valence.value

    const chords = document.getElementById('chords') as HTMLInputElement;
    let chords_arr = chords.value.split(',')
    params.chords = new Array<number>();
    for (let i = 0; i < 8; i++) {
      params.chords.push(+chords_arr[i])
    }

    const octave = document.getElementById('octave') as HTMLInputElement;
    params.octave = +octave.value;

    const melodies = document.getElementById('melodies') as HTMLInputElement;
    var melody_arr = melodies.value.split(',')
    params.melodies = [[0]]
    params.melodies.pop()
    for (let i = 0; i < 8; i++) {
      melody_arr.slice(i * 8, i * 8 + 8)
      let melody_nums: number[] = melody_arr.map((s) => {
        let n: number
        n = +s
        return n
      })
      params.melodies.push(melody_nums)
    }
  } catch (err) {
    console.log(err)
    generateButton.textContent = 'Error!';
    return;
  }

  let decode_params = producer.decode(params);
  displayProduceParams(decode_params);
  const track = producer.produce(params);
  player.addToPlaylist(track, true);
  // scroll to end of playlist
  playlistContainer.scrollTop = playlistContainer.scrollHeight;

  generateButton.disabled = false;
  loadingAnimation.style.display = 'none';
});

// produce button
const produceButton = document.getElementById('produce-button') as HTMLButtonElement;
produceButton.addEventListener('click', async () => {
  const params = getProduceParams();
  params.outputParams = getDecodeParams();
  const track = producer.produce_track(params);
});

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
