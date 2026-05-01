import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { AppColors } from '../constants/Color';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface AudioPlayerProps {
  psalmNumber?: number;
  showControls?: boolean;
  showProgress?: boolean;
  showVolume?: boolean;
  style?: any;
}

export default function AudioPlayer({
  psalmNumber = 101,
  showControls = true,
  showProgress = true,
  showVolume = true,
  style,
}: AudioPlayerProps) {
  const {
    isPlaying,
    isPaused,
    isStopped,
    duration,
    currentTime,
    volume,
    isLoading,
    error,
    play,
    pause,
    stop,
    seekTo,
    setVolume,
    playPsalm101,
    playPsalm102,
    playPsalm103,
    playPsalm104,
    playPsalm105,
    playPsalm106,
    progress,
    formattedTime,
    formattedDuration,
  } = useAudioPlayer();

  const handlePlayPause = async () => {
    if (isPlaying) {
      pause();
    } else {
      try {
        // Play specific Psalm based on number
        switch (psalmNumber) {
          case 101:
            await playPsalm101();
            break;
          case 102:
            await playPsalm102();
            break;
          case 103:
            await playPsalm103();
            break;
          case 104:
            await playPsalm104();
            break;
          case 105:
            await playPsalm105();
            break;
          case 106:
            await playPsalm106();
            break;
          default:
            await playPsalm101();
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to play audio');
      }
    }
  };

  const handleSeek = (value: number) => {
    const newTime = value * duration;
    seekTo(newTime);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
  };

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Psalm {psalmNumber}</Text>
      
      {showProgress && (
        <View style={styles.progressContainer}>
          <Text style={styles.timeText}>{formattedTime}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={progress}
            onValueChange={handleSeek}
            minimumTrackTintColor={AppColors.primary}
            maximumTrackTintColor={AppColors.appTextGrey}
            thumbTintColor={AppColors.primary}
          />
          <Text style={styles.timeText}>{formattedDuration}</Text>
        </View>
      )}

      {showControls && (
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, styles.stopButton]}
            onPress={stop}
            disabled={isStopped}
          >
            <Icon name="stop" size={24} color={isStopped ? AppColors.appTextGrey : AppColors.appTextBlack} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.playButton]}
            onPress={handlePlayPause}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={AppColors.primary} />
            ) : (
              <Icon 
                name={isPlaying ? "pause" : "play-arrow"} 
                size={32} 
                color={AppColors.primary} 
              />
            )}
          </TouchableOpacity>
        </View>
      )}

      {showVolume && (
        <View style={styles.volumeContainer}>
          <Icon name="volume-up" size={20} color={AppColors.appTextBlack} />
          <Slider
            style={styles.volumeSlider}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            onValueChange={handleVolumeChange}
            minimumTrackTintColor={AppColors.primary}
            maximumTrackTintColor={AppColors.appTextGrey}
            thumbTintColor={AppColors.primary}
          />
          <Icon name="volume-down" size={20} color={AppColors.appTextBlack} />
        </View>
      )}

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {isLoading ? 'Loading...' : 
           isPlaying ? 'Playing' : 
           isPaused ? 'Paused' : 
           isStopped ? 'Stopped' : 'Ready'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.appTextBlack,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeText: {
    fontSize: 12,
    color: AppColors.appTextBlack,
    fontFamily: 'Pretendard-Regular',
    minWidth: 40,
    textAlign: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  sliderThumb: {
    backgroundColor: AppColors.primary,
    width: 20,
    height: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  controlButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  stopButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.appTextGrey + '20',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: AppColors.primary + '20',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  volumeSlider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  volumeThumb: {
    backgroundColor: AppColors.primary,
    width: 16,
    height: 16,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: AppColors.appTextGrey,
    fontFamily: 'Pretendard-Regular',
  },
  errorText: {
    fontSize: 14,
    color: '#ff4444',
    textAlign: 'center',
    fontFamily: 'Pretendard-Regular',
  },
});
