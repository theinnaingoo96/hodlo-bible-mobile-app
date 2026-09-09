import SoundPlayer from 'react-native-sound-player';
import RNFS from 'react-native-fs';
import { store } from '../store/store';
import {
  setAudioPlayerState,
  setAudioPlayerPlaying,
  setAudioPlayerPaused,
  setAudioPlayerStopped,
  setAudioPlayerDuration,
  setAudioPlayerCurrentTime,
  setAudioPlayerVolume,
  resetAudioPlayer,
} from '../store/slices/readerSlice';
import { Platform } from 'react-native';

export interface AudioPlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  isStopped: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  isLoading: boolean;
  error: string | null;
}

export type PlayerEventType = 'play' | 'pause' | 'stop' | 'load' | 'progress' | 'end' | 'error';

class AudioPlayerService {
  private progressInterval: NodeJS.Timeout | null = null;
  private currentAudioPath: string | null = null;
  private subscriptions: any[] = [];
  private eventListeners: Map<PlayerEventType, Set<(...args: any[]) => void>> = new Map();

  // Centralized mapping for Psalm audio resources
  // private psalmResources: { [key: number]: any } = {
  //   101: require('../assets/audio/Psalm-00101.m4a'),
  //   102: require('../assets/audio/Psalm-00102.m4a'),
  //   103: require('../assets/audio/Psalm-00103.m4a'),
  //   104: require('../assets/audio/Psalm-00104.m4a'),
  //   105: require('../assets/audio/Psalm-00105.m4a'),
  //   106: require('../assets/audio/Psalm-00106.m4a'),
  //   23: require('../assets/audio/psalms2300.wav'),
  //   24: require('../assets/audio/psalms2400.mp3'),
  // };

  constructor() {
    this.initializeSoundPlayer();
  }

  private initializeSoundPlayer() {
    try {
      this.setupEventListeners();
      store.dispatch(setAudioPlayerState({
        isLoading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error in initializeSoundPlayer:', error);
      store.dispatch(setAudioPlayerState({
        error: 'Failed to initialize sound player',
        isLoading: false
      }));
    }
  }

  private setupEventListeners() {
    // Clear existing subscriptions if any
    this.removeEventListeners();

    // Listen for finished playing
    this.subscriptions.push(
      SoundPlayer.addEventListener('FinishedPlaying', () => {
        store.dispatch(setAudioPlayerStopped(true));
        store.dispatch(setAudioPlayerCurrentTime(0));
        this.emit('end');
        this.stopProgressTracking();
      })
    );

    // Listen for finished loading
    this.subscriptions.push(
      SoundPlayer.addEventListener('FinishedLoading', () => {
        const state = store.getState().reader.audioPlayer;
        store.dispatch(setAudioPlayerState({ isLoading: false, error: null }));
        this.emit('load', state.duration);
      })
    );

    this.subscriptions.push(
      SoundPlayer.addEventListener('OnSetupError', (data: any) => {
        console.error('[AUDIO] Native Setup Error:', data);
        store.dispatch(setAudioPlayerState({
          error: data && data.error ? data.error : 'Setup error occurred',
          isLoading: false
        }));
        this.emit('error', data && data.error ? data.error : 'Setup error occurred');
      })
    );
  }

  public removeEventListeners() {
    this.subscriptions.forEach(sub => sub.remove());
    this.subscriptions = [];
  }

  public addListener(event: PlayerEventType, callback: (...args: any[]) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
    return () => this.eventListeners.get(event)?.delete(callback);
  }

  private emit(event: PlayerEventType, ...args: any[]) {
    this.eventListeners.get(event)?.forEach(cb => cb(...args));
  }

  public getState(): AudioPlayerState {
    return store.getState().reader.audioPlayer;
  }

  public async loadAudio(audioPath: any): Promise<void> {
    return new Promise(async (resolve, reject) => {
      store.dispatch(setAudioPlayerState({ isLoading: true, error: null }));

      try {
        let soundSource: any;

        if (typeof audioPath === 'string') {
          soundSource = audioPath;
        } else if (typeof audioPath === 'number' || (audioPath && typeof audioPath === 'object')) {
          soundSource = audioPath.uri || audioPath.path || audioPath;
        } else {
          throw new Error('Unsupported audio path');
        }

        if (typeof soundSource === 'number') {
          console.log('[AUDIO] Loading asset:', soundSource);
          SoundPlayer.loadAsset(soundSource);
          this.currentAudioPath = `asset_${soundSource}`;
        } else if (typeof soundSource === 'string') {
          if (soundSource.startsWith('http')) {
            console.log('[AUDIO] Loading URL:', soundSource);
            SoundPlayer.loadUrl(soundSource);
          } else if (soundSource.startsWith('/') || soundSource.startsWith('file://')) {
            let localPath = soundSource;

            if (Platform.OS === 'ios') {
              // iOS strictly requires file:// prefix for AVPlayer URLWithString
              localPath = soundSource.startsWith('file://') ? soundSource : `file://${soundSource}`;
            } else {
              // Android handles raw paths or file:// paths
              localPath = soundSource.startsWith('file://') ? soundSource : `file://${soundSource}`;
            }

            console.log('[AUDIO] Loading local file:', localPath);
            SoundPlayer.loadUrl(localPath);
          } else {
            // Bundle resource
            const fileName = soundSource.split('/').pop()?.split('.')[0] || 'audio';
            const fileType = soundSource.split('.').pop() || 'm4a';
            console.log('[AUDIO] Loading bundle resource:', fileName, fileType);
            SoundPlayer.loadSoundFile(fileName, fileType);
          }
          this.currentAudioPath = soundSource;
        }

        // Give the native player a moment to initialize before getting info
        setTimeout(async () => {
          try {
            const info = await SoundPlayer.getInfo();
            store.dispatch(setAudioPlayerDuration(info.duration));
            store.dispatch(setAudioPlayerState({ isLoading: false, error: null }));
            this.emit('load', info.duration);
            resolve();
          } catch (infoError) {
            console.warn('[AUDIO] Failed to get initial info, but resolving anyway:', infoError);
            store.dispatch(setAudioPlayerState({ isLoading: false, error: null }));
            resolve();
          }
        }, 300);
      } catch (error: any) {
        store.dispatch(setAudioPlayerState({ error: error.message, isLoading: false }));
        this.emit('error', error.message);
        reject(error);
      }
    });
  }

  public async play(): Promise<void> {
    if (!this.currentAudioPath) return;
    try {
      SoundPlayer.play();
      store.dispatch(setAudioPlayerPlaying(true));
      this.emit('play');
      this.startProgressTracking();
    } catch (error: any) {
      store.dispatch(setAudioPlayerState({ error: 'Playback failed' }));
      this.emit('error', 'Playback failed');
    }
  }

  public pause(): void {
    if (!this.currentAudioPath) return;
    try {
      SoundPlayer.pause();
      store.dispatch(setAudioPlayerPaused(true));
      this.emit('pause');
      this.stopProgressTracking();
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  }

  public resume(): void {
    if (!this.currentAudioPath) return;
    try {
      SoundPlayer.resume();
      store.dispatch(setAudioPlayerPlaying(true));
      this.emit('play');
      this.startProgressTracking();
    } catch (error) {
      console.error('Error resuming audio:', error);
    }
  }

  public stop(): void {
    if (!this.currentAudioPath) return;
    try {
      SoundPlayer.stop();
      store.dispatch(setAudioPlayerStopped(true));
      this.emit('stop');
      this.stopProgressTracking();
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }

  public seekTo(time: number): void {
    if (!this.currentAudioPath) return;
    try {
      SoundPlayer.seek(time);
      store.dispatch(setAudioPlayerCurrentTime(time));
    } catch (error) {
      console.error('Error seeking audio:', error);
    }
  }

  public setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    store.dispatch(setAudioPlayerVolume(clampedVolume));
    try {
      SoundPlayer.setVolume(clampedVolume);
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }

  private startProgressTracking(): void {
    this.stopProgressTracking();
    this.progressInterval = setInterval(async () => {
      if (this.currentAudioPath) {
        try {
          const info = await SoundPlayer.getInfo();
          store.dispatch(setAudioPlayerCurrentTime(info.currentTime));
          this.emit('progress', info.currentTime, info.duration);
        } catch (error) {
          console.error('Error tracking progress:', error);
        }
      }
    }, 250); // Increased interval slightly for better battery performance
  }

  private stopProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  public release(): void {
    this.stop();
    this.removeEventListeners();
    this.stopProgressTracking();
    this.currentAudioPath = null;
    store.dispatch(resetAudioPlayer());
  }

  /**
   * Generic playback method
   */
  // public async playResource(resourceId: number): Promise<void> {
  //   const asset = this.psalmResources[resourceId];
  //   if (!asset) {
  //     const msg = `Audio resource for ID ${resourceId} not found`;
  //     this.emit('error', msg);
  //     return;
  //   }
  //   await this.loadAudio(asset);
  //   await this.play();
  // }

  // Simplified convenience methods mapping to playResource
  // public async playPsalm23() { return this.playResource(23); }
  // public async playPsalm24() { return this.playResource(24); }
  // public async playPsalm101() { return this.playResource(101); }
  // public async playPsalm102() { return this.playResource(102); }
  // public async playPsalm103() { return this.playResource(103); }
  // public async playPsalm104() { return this.playResource(104); }
  // public async playPsalm105() { return this.playResource(105); }
  // public async playPsalm106() { return this.playResource(106); }
}

export const audioPlayer = new AudioPlayerService();
export default audioPlayer;
