import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { AppColors } from '../../../constants/Color';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import Slider from '@react-native-community/slider';

interface PlayerConsoleProps {
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  formattedTime: string;
  formattedDuration: string;
  error: string | null;
  handlePlayPause: () => void;
  handleSeek: (value: number) => void;
  handleStop: () => void;
  handleSkipBack: () => void;
  handleSkipForward: () => void;
  handlePreviousChapter: () => void;
  handleNextChapter: () => void;
  onClose: () => void;
}

const PlayerConsole: React.FC<PlayerConsoleProps> = ({
  isPlaying,
  isLoading,
  progress,
  formattedTime,
  formattedDuration,
  error,
  handlePlayPause,
  handleSeek,
  handleStop,
  handleSkipBack,
  handleSkipForward,
  handlePreviousChapter,
  handleNextChapter,
  onClose,
}) => {

  // const currentSpeed = SPEED_OPTIONS[speedIndex];
  // const speedLabel =
  //   currentSpeed === 1.0 ? '1×' : `${currentSpeed}×`;

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.card} pointerEvents="box-none">

        <View style={styles.controlsRow} pointerEvents="auto">

          {/* <TouchableOpacity onPress={onClose} style={styles.iconBtn} hitSlop={styles.hitSlop}>
            <FontAwesome6
              name="bars"
              iconStyle="solid"
              color={AppColors.iconGrey}
              size={20}
            />
          </TouchableOpacity> */}

          <TouchableOpacity onPress={handlePreviousChapter} style={styles.iconBtn} hitSlop={styles.hitSlop}>
            <FontAwesome6
              name="backward-step"
              iconStyle="solid"
              color={AppColors.primaryDark}
              size={22}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSkipBack} style={styles.iconBtn} hitSlop={styles.hitSlop}>
            <View style={styles.skipWrapper}>
              <FontAwesome6
                name="rotate-left"
                iconStyle="solid"
                color={AppColors.primaryDark}
                size={26}
              />
              <Text style={styles.skipLabel}>10</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playBtn}
            onPress={handlePlayPause}
            disabled={isLoading}
            hitSlop={styles.hitSlop}>
            {isLoading ? (
              <ActivityIndicator color={AppColors.appTextWhite} size="small" />
            ) : (
              <FontAwesome6
                name={isPlaying ? 'pause' : 'play'}
                iconStyle="solid"
                color={AppColors.appTextWhite}
                size={20}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSkipForward} style={styles.iconBtn} hitSlop={styles.hitSlop}>
            <View style={styles.skipWrapper}>
              <FontAwesome6
                name="rotate-right"
                iconStyle="solid"
                color={AppColors.primaryDark}
                size={26}
              />
              <Text style={styles.skipLabel}>10</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNextChapter} style={styles.iconBtn} hitSlop={styles.hitSlop}>
            <FontAwesome6
              name="forward-step"
              iconStyle="solid"
              color={AppColors.primaryDark}
              size={22}
            />
          </TouchableOpacity>

          {/* <TouchableOpacity onPress={cycleSpeed} style={styles.iconBtn} hitSlop={styles.hitSlop}>
            {currentSpeed === 1.0 ? (
              <FontAwesome6
                name="gauge"
                iconStyle="solid"
                color={AppColors.primaryDark}
                size={22}
              />
            ) : (
              <View style={styles.speedLabelWrapper}>
                <Text style={styles.speedText}>{speedLabel}</Text>
              </View>
            )}
          </TouchableOpacity> */}
        </View>

        <View style={styles.progressRow} pointerEvents="auto">
          <Text style={styles.timeText}>{formattedTime}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={progress}
            onValueChange={handleSeek}
            minimumTrackTintColor={AppColors.primaryDark}
            maximumTrackTintColor={AppColors.lightGrey}
            thumbTintColor={AppColors.primaryDark}
            // thumbImage={require('../../../assets/images/thumb_circle.png')}
          />
          <Text style={styles.timeText}>{formattedDuration}</Text>
        </View>

        {error && (
          <Text style={styles.errorText}>
            {error.includes('not available')
              ? 'Audio not available'
              : `Error: ${error}`}
          </Text>
        )}
      <View style={{ height: 20 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  card: {
    backgroundColor: '#ffffff',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderColor: AppColors.lightGrey,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 8,
  },

  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  iconBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hitSlop: {
    top: 8,
    bottom: 8,
    left: 8,
    right: 8,
  },

  // Play button
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppColors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  skipWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipLabel: {
    position: 'absolute',
    fontSize: 8,
    fontWeight: '700',
    color: AppColors.primaryDark,
    marginTop: 4,
  },

  speedLabelWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: AppColors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppColors.primaryDark,
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  slider: {
    flex: 1,
    height: 28,
    // transform: Platform.OS === 'android' ? [{ scaleY: 2 }] : undefined,
  },
  timeText: {
    fontSize: 14,
    color: AppColors.primaryDark,
    minWidth: 30,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },

  errorText: {
    color: '#ff4444',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default PlayerConsole;
