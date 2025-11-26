import { useState, useEffect, useCallback, useRef } from 'react';
import { audioPlayer, AudioPlayerState, AudioPlayerCallbacks } from '../services/AudioPlayerService';

export interface UseAudioPlayerReturn {
  // State
  isPlaying: boolean;
  isPaused: boolean;
  isStopped: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  resume: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  loadAudio: (audioPath: string) => Promise<void>;

  // Convenience methods for Psalms
  // playAudioWithPath: (path: string) => Promise<void>;
  playPsalm23: () => Promise<void>;
  playPsalm24: () => Promise<void>;
  playPsalm101: () => Promise<void>;
  playPsalm102: () => Promise<void>;
  playPsalm103: () => Promise<void>;
  playPsalm104: () => Promise<void>;
  playPsalm105: () => Promise<void>;
  playPsalm106: () => Promise<void>;

  // Progress helpers
  progress: number; // 0-1
  formattedTime: string;
  formattedDuration: string;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [state, setState] = useState<AudioPlayerState>(() => {
    try {
      return audioPlayer ? audioPlayer.getState() : {
        isPlaying: false,
        isPaused: false,
        isStopped: true,
        duration: 0,
        currentTime: 0,
        volume: 1.0,
        isLoading: false,
        error: 'Audio player not initialized',
      };
    } catch (error) {
      console.error('Error getting initial audio player state:', error);
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
  });

  const callbacksRef = useRef<AudioPlayerCallbacks>({});

  // Update state when audio player state changes
  useEffect(() => {
    if (!audioPlayer) {
      console.error('AudioPlayer is not available');
      return;
    }

    const updateState = () => {
      try {
        if (audioPlayer) {
          const newState = audioPlayer.getState();
          setState(newState);
        }
      } catch (error) {
        console.error('Error updating audio player state:', error);
      }
    };

    // Set up callbacks with explicit setState calls to ensure React updates
    callbacksRef.current = {
      onPlay: () => {
        updateState();
      },
      onPause: () => {
        updateState();
      },
      onStop: () => {
        updateState();
      },
      onLoad: (duration: number) => {
        updateState();
      },
      onProgress: (currentTime: number, duration: number) => {
        // Force state update with explicit currentTime and duration
        setState(prevState => ({
          ...prevState,
          currentTime,
          duration,
        }));
      },
      onEnd: () => {
        updateState();
      },
      onError: (error: string) => {
        updateState();
      },
    };

    try {
      if (audioPlayer) {
        audioPlayer.setCallbacks(callbacksRef.current);
        // Initial state update
        updateState();
      }
    } catch (error) {
      console.error('Error setting up audio player callbacks:', error);
    }

    // Cleanup
    return () => {
      try {
        if (audioPlayer) {
          audioPlayer.setCallbacks({});
        }
      } catch (error) {
        console.error('Error cleaning up audio player callbacks:', error);
      }
    };
  }, []);

  // Action methods
  const play = useCallback(async () => {
    if (!audioPlayer) {
      console.error('AudioPlayer is not available');
      return;
    }
    try {
      await audioPlayer.play();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, []);

  const pause = useCallback(() => {
    if (!audioPlayer) {
      console.error('AudioPlayer is not available');
      return;
    }
    try {
      audioPlayer.pause();
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  }, []);

  const resume = useCallback(() => {
    if (!audioPlayer) {
      console.error('AudioPlayer is not available');
      return;
    }
    try {
      audioPlayer.resume();
    } catch (error) {
      console.error('Error resuming audio:', error);
    }
  }, [])

  const stop = useCallback(() => {
    if (!audioPlayer) {
      console.error('AudioPlayer is not available');
      return;
    }
    try {
      audioPlayer.stop();
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }, []);

  const seekTo = useCallback((time: number) => {
    if (!audioPlayer) {
      console.error('AudioPlayer is not available');
      return;
    }
    try {
      audioPlayer.seekTo(time);
      audioPlayer.play();
    } catch (error) {
      console.error('Error seeking audio:', error);
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (!audioPlayer) {
      console.error('AudioPlayer is not available');
      return;
    }
    try {
      audioPlayer.setVolume(volume);
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }, []);

  const loadAudio = useCallback(async (audioPath: string) => {
    if (!audioPlayer) {
      console.error('AudioPlayer is not available');
      return;
    }
    try {
      await audioPlayer.loadAudio(audioPath);
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  }, []);

  const playAudioWithPath = useCallback(async (path: string) => {
    if (!audioPlayer) {
      console.error('AudioPlayer is not available');
      return;
    }
    try {
      if (path == '23') {
        await audioPlayer.playPsalm23();
      } else {
        await audioPlayer.playPsalm24();
      }
    } catch (error) {
      console.error('Error playing audio with path:', error);
    }
  }, []);

  const playPsalm23 = useCallback(async () => {
    if (!audioPlayer) {
      console.error('AudioPlayer is not available');
      return;
    }
    try {
      await audioPlayer.playPsalm23();
    } catch (error) {
      console.error('Error playing Psalm 23:', error);
    }
  }, []);

  const playPsalm24 = useCallback(async () => {
    if (!audioPlayer) {
      console.error('AudioPlayer is not available');
      return;
    }
    try {
      await audioPlayer.playPsalm24();
    } catch (error) {
      console.error('Error playing Psalm 23:', error);
    }
  }, [])

  // Convenience methods for Psalms
  const playPsalm101 = useCallback(async () => {
    if (!audioPlayer) {
      console.error('AudioPlayer is not available');
      return;
    }
    try {
      await audioPlayer.playPsalm101();
    } catch (error) {
      console.error('Error playing Psalm 101:', error);
    }
  }, []);

  const playPsalm102 = useCallback(async () => {
    if (!audioPlayer) {
      console.error('AudioPlayer is not available');
      return;
    }
    try {
      await audioPlayer.playPsalm102();
    } catch (error) {
      console.error('Error playing Psalm 102:', error);
    }
  }, []);

  const playPsalm103 = useCallback(async () => {
    if (!audioPlayer) {
      console.error('AudioPlayer is not available');
      return;
    }
    try {
      await audioPlayer.playPsalm103();
    } catch (error) {
      console.error('Error playing Psalm 103:', error);
    }
  }, []);

  const playPsalm104 = useCallback(async () => {
    if (!audioPlayer) {
      console.error('AudioPlayer is not available');
      return;
    }
    try {
      await audioPlayer.playPsalm104();
    } catch (error) {
      console.error('Error playing Psalm 104:', error);
    }
  }, []);

  const playPsalm105 = useCallback(async () => {
    if (!audioPlayer) {
      console.error('AudioPlayer is not available');
      return;
    }
    try {
      await audioPlayer.playPsalm105();
    } catch (error) {
      console.error('Error playing Psalm 105:', error);
    }
  }, []);

  const playPsalm106 = useCallback(async () => {
    if (!audioPlayer) {
      console.error('AudioPlayer is not available');
      return;
    }
    try {
      await audioPlayer.playPsalm106();
    } catch (error) {
      console.error('Error playing Psalm 106:', error);
    }
  }, []);

  // Helper functions
  const progress = state.duration > 0 ? state.currentTime / state.duration : 0;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formattedTime = formatTime(state.currentTime);
  const formattedDuration = formatTime(state.duration);

  return {
    // State
    isPlaying: state.isPlaying,
    isPaused: state.isPaused,
    isStopped: state.isStopped,
    duration: state.duration,
    currentTime: state.currentTime,
    volume: state.volume,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    play,
    pause,
    resume,
    stop,
    seekTo,
    setVolume,
    loadAudio,
    // playAudioWithPath,
    // playPsalm24,
    // Convenience methods
    playPsalm23,
    playPsalm24,
    playPsalm101,
    playPsalm102,
    playPsalm103,
    playPsalm104,
    playPsalm105,
    playPsalm106,

    // Helpers
    progress,
    formattedTime,
    formattedDuration,
  };
}
