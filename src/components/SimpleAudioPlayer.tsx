import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { AppColors } from '../constants/Color';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface SimpleAudioPlayerProps {
  psalmNumber: number;
  style?: any;
}

export default function SimpleAudioPlayer({ psalmNumber, style }: SimpleAudioPlayerProps) {
  const {
    isPlaying,
    isLoading,
    error,
    playPsalm101,
    playPsalm102,
    playPsalm103,
    playPsalm104,
    playPsalm105,
    playPsalm106,
    pause,
    stop,
  } = useAudioPlayer();

  const handlePlayPause = async () => {
    if (isPlaying) {
      pause();
    } else {
      try {
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
        console.error('Error playing audio:', error);
      }
    }
  };

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>Audio Error</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.playButton, isPlaying && styles.playingButton]}
        onPress={handlePlayPause}
        disabled={isLoading}
      >
        <Icon 
          name={isPlaying ? "pause" : "play-arrow"} 
          size={24} 
          color={isPlaying ? AppColors.primary : AppColors.appTextBlack} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.stopButton}
        onPress={stop}
        disabled={!isPlaying && !isLoading}
      >
        <Icon 
          name="stop" 
          size={20} 
          color={AppColors.appTextGrey} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.appTextGrey + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  playingButton: {
    backgroundColor: AppColors.primary + '20',
  },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.appTextGrey + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#ff4444',
    textAlign: 'center',
  },
});
