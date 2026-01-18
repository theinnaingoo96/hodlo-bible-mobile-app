import SoundPlayer from 'react-native-sound-player';
import { AppColors } from '../constants/Color';
import { debugAudioPath } from '../utils/audioDebug';
import { store } from '../store/store';
import {
  setAudioPlayerState,
  setAudioPlayerPlaying,
  setAudioPlayerPaused,
  setAudioPlayerStopped,
  setAudioPlayerDuration,
  setAudioPlayerCurrentTime,
  setAudioPlayerVolume,
  setAudioPlayerLoading,
  setAudioPlayerError,
  resetAudioPlayer,
} from '../store/slices/readerSlice';

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

export interface AudioPlayerCallbacks {
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onLoad?: (duration: number) => void;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

class AudioPlayerService {
  private callbacks: AudioPlayerCallbacks = {};
  private progressInterval: NodeJS.Timeout | null = null;
  private currentAudioPath: string | null = null;

  // Centralized mapping for Psalm audio resources
  private psalmResources: { [key: number]: any } = {
    101: require('../assets/audio/Psalm-00101.m4a'),
    102: require('../assets/audio/Psalm-00102.m4a'),
    103: require('../assets/audio/Psalm-00103.m4a'),
    104: require('../assets/audio/Psalm-00104.m4a'),
    105: require('../assets/audio/Psalm-00105.m4a'),
    106: require('../assets/audio/Psalm-00106.m4a'),
  };

  constructor() {
    try {
      this.initializeSoundPlayer();
    } catch (error) {
      console.error('Error initializing AudioPlayerService:', error);
      store.dispatch(setAudioPlayerState({ 
        error: 'Failed to initialize audio player', 
        isLoading: false 
      }));
    }
  }

  private initializeSoundPlayer() {
    try {
      // Set up event listeners for react-native-sound-player
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
    // Listen for finished playing
    SoundPlayer.addEventListener('FinishedPlaying', (data) => {
      store.dispatch(setAudioPlayerStopped(true));
      store.dispatch(setAudioPlayerCurrentTime(0));
      this.callbacks.onEnd?.();
      this.stopProgressTracking();
    });

    // Listen for finished loading
    SoundPlayer.addEventListener('FinishedLoading', (data) => {
      const state = store.getState().reader.audioPlayer;
      store.dispatch(setAudioPlayerState({ 
        isLoading: false,
        error: null 
      }));
      this.callbacks.onLoad?.(state.duration);
    });

    // Listen for setup errors
    SoundPlayer.addEventListener('OnSetupError', (data) => {
      store.dispatch(setAudioPlayerState({ 
        error: 'Setup error occurred', 
        isLoading: false 
      }));
      this.callbacks.onError?.('Setup error occurred');
    });
  }

  public getState(): AudioPlayerState {
    return store.getState().reader.audioPlayer;
  }

  public setCallbacks(callbacks: AudioPlayerCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public async loadAudio(audioPath: any): Promise<void> {
    return new Promise(async (resolve, reject) => {
      store.dispatch(setAudioPlayerState({ isLoading: true, error: null }));
      
      try {
        // Enhanced debugging for audio path
        console.log('=== Audio Path Debug ===');
        console.log('audioPath:', audioPath);
        console.log('audioPath type:', typeof audioPath);
        console.log('audioPath constructor:', audioPath?.constructor?.name);
        console.log('audioPath keys:', audioPath && typeof audioPath === 'object' ? Object.keys(audioPath) : 'N/A');
        console.log('========================');
        
        // Handle different types of audio paths for react-native-sound-player
        let soundSource: any;
        
        if (typeof audioPath === 'string') {
          soundSource = audioPath;
          console.log('Using string path:', soundSource);
        } else if (audioPath && typeof audioPath === 'object') {
          // Handle require() objects - they might be resource IDs or objects with properties
          if (typeof audioPath === 'number') {
            // This is likely a resource ID from require()
            soundSource = audioPath;
            console.log('Using resource ID:', soundSource);
          } else if (audioPath.uri) {
            soundSource = audioPath.uri;
            console.log('Using uri from object:', soundSource);
          } else if (audioPath.path) {
            soundSource = audioPath.path;
            console.log('Using path from object:', soundSource);
          } else {
            // Use the object directly as fallback
            soundSource = audioPath;
            console.log('Using object directly as fallback:', soundSource);
          }
        } else if (typeof audioPath === 'number') {
          // Direct resource ID
          soundSource = audioPath;
          console.log('Using direct resource ID:', soundSource);
        } else if (audioPath === null || audioPath === undefined) {
          throw new Error('Audio path is null or undefined');
        } else {
          // Try to convert to string as last resort
          soundSource = String(audioPath);
          console.log('Converting to string:', soundSource);
        }

        console.log('Final soundSource:', soundSource);
        console.log('Final soundSource type:', typeof soundSource);

        // Load audio using react-native-sound-player
        try {
          if (typeof soundSource === 'number') {
            // Load asset by resource ID
            SoundPlayer.loadAsset(soundSource);
            this.currentAudioPath = `asset_${soundSource}`;
          } else if (typeof soundSource === 'string') {
            if (soundSource.startsWith('http')) {
              // Load URL
              SoundPlayer.loadUrl(soundSource);
              this.currentAudioPath = soundSource;
            } else {
              // Load file by name and type
              const fileName = soundSource.split('/').pop()?.split('.')[0] || 'audio';
              const fileType = soundSource.split('.').pop() || 'm4a';
              SoundPlayer.loadSoundFile(fileName, fileType);
              this.currentAudioPath = soundSource;
            }
          } else {
            throw new Error('Unsupported audio source type');
          }

          // Get duration after loading
          try {
            const info = await SoundPlayer.getInfo();
            store.dispatch(setAudioPlayerDuration(info.duration));
            store.dispatch(setAudioPlayerState({ 
              isLoading: false,
              error: null 
            }));
            this.callbacks.onLoad?.(info.duration);
            resolve();
          } catch (infoError) {
            console.log('Could not get audio info, but audio may still be loaded');
            store.dispatch(setAudioPlayerState({ 
              isLoading: false,
              error: null 
            }));
            this.callbacks.onLoad?.(0);
            resolve();
          }
        } catch (soundError: any) {
          console.error('Error loading audio:', soundError);
          store.dispatch(setAudioPlayerState({ 
            error: `Failed to load audio: ${soundError.message}`, 
            isLoading: false 
          }));
          this.callbacks.onError?.(`Failed to load audio: ${soundError.message}`);
          reject(soundError);
        }
      } catch (error: any) {
        console.error('Error in loadAudio:', error);
        store.dispatch(setAudioPlayerState({ 
          error: `Failed to load audio: ${error.message}`, 
          isLoading: false 
        }));
        this.callbacks.onError?.(`Failed to load audio: ${error.message}`);
        reject(error);
      }
    });
  }

  public async play(): Promise<void> {
    if (!this.currentAudioPath) {
      this.callbacks.onError?.('No audio loaded');
      return;
    }

    try {
      SoundPlayer.play();
      store.dispatch(setAudioPlayerPlaying(true));
      this.callbacks.onPlay?.();
      this.startProgressTracking();
    } catch (error: any) {
      const errorMessage = 'Playback failed';
      store.dispatch(setAudioPlayerError(errorMessage));
      this.callbacks.onError?.(errorMessage);
      throw new Error(errorMessage);
    }
  }

  public pause(): void {
    if (!this.currentAudioPath) return;

    try {
      SoundPlayer.pause();
      store.dispatch(setAudioPlayerPaused(true));
      this.callbacks.onPause?.();
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
      this.callbacks.onPlay?.();
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
      store.dispatch(setAudioPlayerCurrentTime(0));
      this.callbacks.onStop?.();
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

  public async getDuration(): Promise<number> {
    try {
      const info = await SoundPlayer.getInfo();
      return info.duration || 0;
    } catch (error) {
      console.error('Error getting duration:', error);
      return 0;
    }
  }

  public async getCurrentTime(): Promise<number> {
    try {
      const info = await SoundPlayer.getInfo();
      return info.currentTime || 0;
    } catch (error) {
      console.error('Error getting current time:', error);
      return 0;
    }
  }

  private startProgressTracking(): void {
    this.stopProgressTracking();
    this.progressInterval = setInterval(async () => {
      const state = store.getState().reader.audioPlayer;
      if (this.currentAudioPath && state.isPlaying) {
        try {
          const currentTime = await this.getCurrentTime();          
          store.dispatch(setAudioPlayerCurrentTime(currentTime));
          this.callbacks.onProgress?.(currentTime, state.duration);
        } catch (error) {
          console.error('Error tracking progress:', error);
        }
      }
    }, 100);
  }

  private stopProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  public release(): void {
    this.stop();
    this.stopProgressTracking();
    this.currentAudioPath = null;
    store.dispatch(resetAudioPlayer());
  }

  // Helper method to load audio with fallback
  private async loadAudioWithFallback(requirePath: any, psalmName: string): Promise<void> {
    try {
      console.log(`Loading ${psalmName}...`);
      debugAudioPath(requirePath, psalmName);
      await this.loadAudio(requirePath);
      await this.play();
    } catch (error) {
      console.error(`Error playing ${psalmName}:`, error);
      this.callbacks.onError?.(`Failed to play ${psalmName}`);
    }
  }

  public async playAudioWithPath(path: string): Promise<void> {
    try {
      console.log('=== Playing Audio with Path ===');
      // const _path = '../assets/audio/' + path
      // const audioPath = require(_path);
      await this.loadAudioWithFallback(path, 'Psalm 23');
    } catch (error) {
      console.error('Error playing Psalm 23:', error);
      this.callbacks.onError?.('Failed to play Psalm 23');
    }
  }

  public async playPsalm23(): Promise<void> {
    try {
      console.log('=== Playing Psalm 23 ===');
      const audioPath = require('../assets/audio/psalms2300.wav');
      await this.loadAudioWithFallback(audioPath, 'Psalm 23');
    } catch (error) {
      console.error('Error playing Psalm 23:', error);
      this.callbacks.onError?.('Failed to play Psalm 23');
    }
  }

  public async playPsalm24(): Promise<void> {
    try {
      console.log('=== Playing Psalm 24 ===');
      const audioPath = require('../assets/audio/psalms2400.mp3');
      await this.loadAudioWithFallback(audioPath, 'Psalm 24');
    } catch (error) {
      console.error('Error playing Psalm 24:', error);
      this.callbacks.onError?.('Failed to play Psalm 24');
    }
  }

  // Convenience methods for specific Psalm audio
  public async playPsalm101(): Promise<void> {
    try {
      console.log('=== Playing Psalm 23 ===');
      const audioPath = require('../assets/audio/Psalm-00101.m4a');
      await this.loadAudioWithFallback(audioPath, 'Psalm 101');
    } catch (error) {
      console.error('Error playing Psalm 101:', error);
      this.callbacks.onError?.('Failed to play Psalm 101');
    }
  }

  public async playPsalm102(): Promise<void> {
    try {
      console.log('=== Playing Psalm 102 ===');
      const audioPath = this.psalmResources[102];
      await this.loadAudioWithFallback(audioPath, 'Psalm 102');
    } catch (error) {
      console.error('Error playing Psalm 102:', error);
      this.callbacks.onError?.('Failed to play Psalm 102');
    }
  }

  public async playPsalm103(): Promise<void> {
    try {
      console.log('=== Playing Psalm 103 ===');
      const audioPath = this.psalmResources[103];
      await this.loadAudioWithFallback(audioPath, 'Psalm 103');
    } catch (error) {
      console.error('Error playing Psalm 103:', error);
      this.callbacks.onError?.('Failed to play Psalm 103');
    }
  }

  public async playPsalm104(): Promise<void> {
    try {
      console.log('=== Playing Psalm 104 ===');
      const audioPath = this.psalmResources[104];
      await this.loadAudioWithFallback(audioPath, 'Psalm 104');
    } catch (error) {
      console.error('Error playing Psalm 104:', error);
      this.callbacks.onError?.('Failed to play Psalm 104');
    }
  }

  public async playPsalm105(): Promise<void> {
    try {
      console.log('=== Playing Psalm 105 ===');
      const audioPath = this.psalmResources[105];
      await this.loadAudioWithFallback(audioPath, 'Psalm 105');
    } catch (error) {
      console.error('Error playing Psalm 105:', error);
      this.callbacks.onError?.('Failed to play Psalm 105');
    }
  }

  public async playPsalm106(): Promise<void> {
    try {
      console.log('=== Playing Psalm 106 ===');
      const audioPath = this.psalmResources[106];
      await this.loadAudioWithFallback(audioPath, 'Psalm 106');
    } catch (error) {
      console.error('Error playing Psalm 106:', error);
      this.callbacks.onError?.('Failed to play Psalm 106');
    }
  }
}

// Export singleton instance with error handling
let audioPlayerInstance: AudioPlayerService | null = null;

try {
  audioPlayerInstance = new AudioPlayerService();
} catch (error) {
  console.error('Failed to create AudioPlayerService:', error);
  // Create a fallback instance that handles errors gracefully
  audioPlayerInstance = {
    getState: () => {
      try {
        return store.getState().reader.audioPlayer;
      } catch (error) {
        return {
      isPlaying: false,
      isPaused: false,
      isStopped: true,
      duration: 0,
      currentTime: 0,
      volume: 1.0,
      isLoading: false,
      error: 'Audio player not available',
        };
      }
    },
    setCallbacks: () => {},
    play: async () => { throw new Error('Audio player not available'); },
    pause: () => {},
    resume: () => {},
    stop: () => {},
    seekTo: () => {},
    setVolume: () => {},
    loadAudio: async () => { throw new Error('Audio player not available'); },
    playPsalm23: async () => { throw new Error('Audio player not available'); },
    playPsalm101: async () => { throw new Error('Audio player not available'); },
    playPsalm102: async () => { throw new Error('Audio player not available'); },
    playPsalm103: async () => { throw new Error('Audio player not available'); },
    playPsalm104: async () => { throw new Error('Audio player not available'); },
    playPsalm105: async () => { throw new Error('Audio player not available'); },
    playPsalm106: async () => { throw new Error('Audio player not available'); },
    release: () => {},
  } as any;
}

export const audioPlayer = audioPlayerInstance;
export default audioPlayer;
