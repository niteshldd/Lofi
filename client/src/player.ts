import * as Tone from 'tone';
import { getInstrumentFilters, getInstrument, Instrument } from './instruments';
import * as Samples from './samples';
import { Track } from './track';
import { compress } from './helper';
import { upload } from './api';



/**
 * A class that plays a Track by synthesizing events in Tone.js.
 */
class Player {
  /** Current list of tracks in queue */
  playlist: Track[] = [];

  /** Current track in playlist being played */
  currentPlayingIndex: number;

  ifRecord: boolean = false;

  /** Current track. Can be undefined */
  get currentTrack() {
    if (this.currentPlayingIndex !== undefined) {
      return this.playlist[this.currentPlayingIndex];
    }
    return undefined;
  }

  /** Whether the player is currently playing */
  private _isPlaying: boolean = false;

  get isPlaying() {
    return this._isPlaying;
  }

  set isPlaying(isPlaying: boolean) {
    this._isPlaying = isPlaying;
    this.onPlayingStateChange();
    if (this.gain) {
      this.gain.gain.value = isPlaying && !this._muted ? this.getGain() : 0;
    }
  }

  /** Whether the player is currently loading */
  private _isLoading: boolean = false;

  get isLoading() {
    return this._isLoading;
  }

  set isLoading(isLoading: boolean) {
    if (this._isLoading !== isLoading) {
      this._isLoading = isLoading;
      this.onLoadingStateChange();
    }
  }

  repeat: RepeatMode = RepeatMode.NONE;

  shuffle = false;

  /** Playing queue, used when shuffling */
  shuffleQueue: number[] = [];

  private _muted = false;

  get muted() {
    return this._muted;
  }

  set muted(muted: boolean) {
    this._muted = muted;
    if (this.gain) {
      this.gain.gain.value = muted ? 0 : this.getGain();
    }
  }

  /** Function to get the gain from the UI */
  getGain: () => number;

  /** Function to update the playlist in the UI */
  updatePlaylistDisplay: () => void;

  /** Function to update track information in the UI */
  updateTrackDisplay: (seconds?: number, spectrum?: Float32Array) => void;

  /** Function to call when the track changes */
  onTrackChange: () => void;

  /** Function to call when isPlaying changes */
  onPlayingStateChange: () => void;

  /** Function to call when isLoading changes */
  onLoadingStateChange: () => void;

  /** Update local storage playlist when it changes */
  updateLocalStorage: () => void;

  /** Map of sample group to players */
  samplePlayers: Map<string, Tone.Player[]>;

  /** Map of instrument to samplers */
  instruments: Map<Instrument, any>;

  /** Master gain */
  gain: Tone.Gain;

  constructor() {
    // preload most common instruments
    [Instrument.ElectricPiano, Instrument.BassGuitar, Instrument.Piano].forEach((instrument) => {
      getInstrument(instrument);
    });
  }

  /** Adds a given track to the playlist */
  addToPlaylist(track: Track, playImmediately = false) {
    this.playlist.push(track);
    this.updateLocalStorage();
    this.updatePlaylistDisplay();
    if (playImmediately || !this.isPlaying) {
      this.playTrack(this.playlist.length - 1);
    }
    this.fillShuffleQueue();
  }

  /** Plays a specific track in the playlist */
  playTrack(playlistIndex: number) {
    this.currentPlayingIndex = playlistIndex;
    this.onTrackChange();
    this.seek(0);
    try{
      this.stop();
    } catch (err) {
      console.log(err);
    }
    this.load();
  }

  /** Sets up Tone.Transport for the current track and starts playback */
  async load() {
    if (!this.currentTrack) {
      return;
    }
    this.isLoading = true;
    Tone.Transport.timeSignature = this.currentTrack.meter
    this.gain = new Tone.Gain();
    this.isPlaying = true;
    this.setAudioWebApiMetadata();

    // wait 500ms before trying to play the track
    // this is needed due to Tone.js scheduling conflicts if the user rapidly changes the track
    const trackToPlayIndex = this.currentPlayingIndex;
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (trackToPlayIndex !== this.currentPlayingIndex || !this.isPlaying) {
      return;
    }


    await Tone.start();
    const recorder = new Tone.Recorder();
    recorder.start();
    Tone.Transport.bpm.value = this.currentTrack.bpm;

    this.samplePlayers = new Map();
    this.instruments = new Map();

    // load samples
    for (const [sampleGroupName, sampleIndex] of this.currentTrack.samples) {
      const sampleGroup = Samples.SAMPLEGROUPS.get(sampleGroupName);
      const player = new Tone.Player({
        url: sampleGroup.getSampleUrl(sampleIndex),
        volume: sampleGroup.volume,
        loop: true,
        fadeIn: '8n',
        fadeOut: '8n'
      })
        .chain(...sampleGroup.getFilters(), this.gain, Tone.Destination)
        .sync();
      player.connect(recorder);
      if (!this.samplePlayers.has(sampleGroupName)) {
        this.samplePlayers.set(sampleGroupName, Array(sampleGroup.size));
      }
      this.samplePlayers.get(sampleGroupName)[sampleIndex] = player;
    }

    // load instruments
    const instrumentVolumes = new Map();
    for (const instrument of this.currentTrack.instruments) {
      const toneInstrument = getInstrument(instrument)
        .chain(...getInstrumentFilters(instrument), this.gain, Tone.Destination)
        .sync();
      toneInstrument.connect(recorder);
      this.instruments.set(instrument, toneInstrument);
      instrumentVolumes.set(toneInstrument, toneInstrument.volume.value);
    }

    // set up swing
    Tone.Transport.swing = this.currentTrack.swing ? 2 / 3 : 0;

    // wait until all samples are loaded
    await Tone.loaded();
    for (const sampleLoop of this.currentTrack.sampleLoops) {
      const samplePlayer = this.samplePlayers.get(sampleLoop.sampleGroupName)[
        sampleLoop.sampleIndex
      ];
      samplePlayer.connect(recorder);
      samplePlayer.start(sampleLoop.startTime);
      samplePlayer.stop(sampleLoop.stopTime);
    }

    for (const noteTiming of this.currentTrack.instrumentNotes) {
      const instrumentSampler = this.instruments.get(noteTiming.instrument);
      if (noteTiming.duration) {
        instrumentSampler.connect(recorder);
        instrumentSampler.triggerAttackRelease(
          noteTiming.pitch,
          noteTiming.duration,
          noteTiming.time,
          noteTiming.velocity !== undefined ? noteTiming.velocity : 1
        );
      } else {
        instrumentSampler.connect(recorder);
        instrumentSampler.triggerAttack(
          noteTiming.pitch,
          noteTiming.time,
          noteTiming.velocity !== undefined ? noteTiming.velocity : 1
        );
      }
    }
    // connect analyzer for visualizations
    const analyzer = new Tone.Analyser('fft', 32);
    this.gain.connect(analyzer);

    const fadeOutBegin = this.currentTrack.length - this.currentTrack.fadeOutDuration;
    // schedule events to do every 100ms
    Tone.Transport.scheduleRepeat((time) => {
      this.isLoading = false;

      const seconds = Tone.Transport.getSecondsAtTime(time);
      const spectrum = analyzer.getValue() as Float32Array;
      this.updateTrackDisplay(seconds, spectrum);
      this.updateAudioWebApiPosition(seconds);

      if (this.currentTrack.length - seconds < 0) {
        this.playNext();
      }

      // schedule fade out in the last seconds
      const volumeOffset = seconds < fadeOutBegin ? 0 : (seconds - fadeOutBegin) * 4;
      for (const [sampler, volume] of instrumentVolumes) {
        sampler.volume.value = volume - volumeOffset;
      }
    }, 0.1);

    this.play();

    if (this.ifRecord) {
      const trackTitle = this.currentTrack.title;
      await new Promise((resolve) => setTimeout(async () => {
        const recording = await recorder.stop();
        await upload(recording, `${trackTitle}.webm`);
      }, 1000 * (this.currentTrack.length + 10)));
    }


  }

  /** Starts playback on the current track; the track must have been loaded */
  play() {
    if (this.currentTrack) {
      this.isPlaying = true;
      Tone.Transport.start();
      this.seek(Tone.Transport.seconds);
    } else if (this.playlist.length > 0) {
      this.playTrack(0);
    }
  }

  /** Seeks to a specific position in the current track */
  seek(seconds: number) {
    if (!this.currentTrack) return;
    this.instruments?.forEach((s) => s.releaseAll());
    Tone.Transport.seconds = seconds;
    this.updateTrackDisplay(seconds);
  }

  /** Seeks to a specific position in the current track, relative to the current position */
  seekRelative(seconds: number) {
    if (!this.currentTrack) return;
    const position = Math.max(0, Tone.Transport.seconds + seconds);
    if (position > this.currentTrack.length) {
      this.stop();
    }
    this.seek(position);
  }

  /** Pauses the current track */
  pause() {
    this.isPlaying = false;
    Tone.Transport.pause();
  }

  /** Stops the current track, and disposes Tone.js objects */
  stop() {
    this.isPlaying = false;
    this.gain?.disconnect();
    Tone.Transport.cancel();
    Tone.Transport.stop();
    this.instruments?.forEach((s) => {
      try {
        s.dispose()
      } catch (error) {
        console.log(error);
      }
    });
    this.samplePlayers?.forEach((s) => s.forEach((t) => {
      try {
        if (!t.disposed) {
          t.dispose()
        }
      } catch (error) {
        console.log(error);
      }
    }));
  }

  /** Stops playback and unloads the current track in the UI */
  unload() {
    this.stop();
    this.currentPlayingIndex = undefined;
    this.updateTrackDisplay();
    this.updatePlaylistDisplay();
    navigator.mediaSession.metadata = null;
  }

  /** Plays the previous track */
  playPrevious() {
    let nextTrackIndex = null;
    if (this.currentPlayingIndex > 0) {
      nextTrackIndex = this.currentPlayingIndex - 1;
    } else if (this.currentPlayingIndex === 0) {
      if (this.repeat === RepeatMode.ALL) {
        nextTrackIndex = this.playlist.length - 1;
      } else {
        this.seek(0);
      }
    }

    if (nextTrackIndex !== null) {
      this.playTrack(nextTrackIndex);
    }
  }

  /** Plays the next track */
  playNext() {
    if (this.repeat === RepeatMode.ONE) {
      this.seek(0);
      return;
    }

    let nextTrackIndex = null;
    if (this.shuffle) {
      if (this.shuffleQueue.length === 0) this.fillShuffleQueue();
      nextTrackIndex = this.shuffleQueue.shift();
    } else if (this.currentPlayingIndex < this.playlist.length - 1) {
      nextTrackIndex = this.currentPlayingIndex + 1;
    } else if (
      this.currentPlayingIndex === this.playlist.length - 1 &&
      this.repeat === RepeatMode.ALL
    ) {
      nextTrackIndex = 0;
    }

    if (nextTrackIndex !== null) {
      this.playTrack(nextTrackIndex);
    } else {
      this.unload();
    }
  }

  /** Generates a 'shuffle queue' */
  fillShuffleQueue() {
    this.shuffleQueue = [...Array(this.playlist.length).keys()];

    // shuffle
    for (let i = this.shuffleQueue.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffleQueue[i], this.shuffleQueue[j]] = [this.shuffleQueue[j], this.shuffleQueue[i]];
    }
  }

  /** Deletes a track from the playlist */
  deleteTrack(index: number) {
    this.playlist.splice(index, 1);
    this.updateLocalStorage();
    if (index === this.currentPlayingIndex) {
      this.unload();
    } else if (index < this.currentPlayingIndex) {
      this.currentPlayingIndex -= 1;
    }
    this.updatePlaylistDisplay();
  }

  /** Generate a URL that points to the current playlist */
  getExportUrl() {
    const json = JSON.stringify(this.playlist.map((t) => t.outputParams));
    const compressed = compress(json);
    return `${window.location.origin}${window.location.pathname}?${compressed}`;
  }

  /** Set up Media Session API metadata */
  setAudioWebApiMetadata() {
    if (!('mediaSession' in navigator) || !this.currentTrack) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: this.currentTrack.title,
      artist: 'Lofi generator',
      artwork: [{ src: './cover.jpg', type: 'image/jpg' }]
    });
    this.updateAudioWebApiPosition(0);
  }

  /** Set up Media Session API current position */
  updateAudioWebApiPosition(seconds: number) {
    if (!('mediaSession' in navigator) || !this.currentTrack) return;
    navigator.mediaSession.setPositionState({
      duration: this.currentTrack.length,
      position: Math.max(0, Math.min(this.currentTrack.length, seconds))
    });
  }
}

export enum RepeatMode {
  NONE,
  ALL,
  ONE
}

export default Player;
