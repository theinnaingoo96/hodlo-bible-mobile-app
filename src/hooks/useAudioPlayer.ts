import { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { audioPlayer, PlayerEventType } from '../services/AudioPlayerService';

export interface UseAudioPlayerReturn {
  // State from Redux
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

  // Convenience methods
  playPsalm23: () => Promise<void>;
  playPsalm24: () => Promise<void>;
  playPsalm101: () => Promise<void>;
  playPsalm102: () => Promise<void>;
  playPsalm103: () => Promise<void>;
  playPsalm104: () => Promise<void>;
  playPsalm105: () => Promise<void>;
  playPsalm106: () => Promise<void>;

  // Progress helpers
  progress: number;
  formattedTime: string;
  formattedDuration: string;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const audioState = useSelector((state: any) => state.reader.audioPlayer);
  useEffect(() => {
    const unsubError = audioPlayer.addListener('error', (msg) => {
      console.error('[Audio Hook Error]', msg);
    });

    return () => {
      unsubError();
    };
  }, []);

  // Action methods
  const play = useCallback(async () => {
    await audioPlayer.play();
  }, []);

  const pause = useCallback(() => {
    audioPlayer.pause();
  }, []);

  const resume = useCallback(() => {
    audioPlayer.resume();
  }, []);

  const stop = useCallback(() => {
    audioPlayer.stop();
  }, []);

  const seekTo = useCallback((time: number) => {
    audioPlayer.seekTo(time);
    audioPlayer.play();
  }, []);

  const setVolume = useCallback((volume: number) => {
    audioPlayer.setVolume(volume);
  }, []);

  const loadAudio = useCallback(async (audioPath: string) => {
    await audioPlayer.loadAudio(audioPath);
  }, []);

  // Convenience methods
  const playPsalm23 = useCallback(async () => audioPlayer.playPsalm23(), []);
  const playPsalm24 = useCallback(async () => audioPlayer.playPsalm24(), []);
  const playPsalm101 = useCallback(async () => audioPlayer.playPsalm101(), []);
  const playPsalm102 = useCallback(async () => audioPlayer.playPsalm102(), []);
  const playPsalm103 = useCallback(async () => audioPlayer.playPsalm103(), []);
  const playPsalm104 = useCallback(async () => audioPlayer.playPsalm104(), []);
  const playPsalm105 = useCallback(async () => audioPlayer.playPsalm105(), []);
  const playPsalm106 = useCallback(async () => audioPlayer.playPsalm106(), []);

  // Helper functions
  const progress = audioState.duration > 0 ? audioState.currentTime / audioState.duration : 0;

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formattedTime = formatTime(audioState.currentTime);
  const formattedDuration = formatTime(audioState.duration);

  return {
    ...audioState,
    play,
    pause,
    resume,
    stop,
    seekTo,
    setVolume,
    loadAudio,
    playPsalm23,
    playPsalm24,
    playPsalm101,
    playPsalm102,
    playPsalm103,
    playPsalm104,
    playPsalm105,
    playPsalm106,
    progress,
    formattedTime,
    formattedDuration,
  };
}
