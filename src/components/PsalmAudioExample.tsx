import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AudioPlayer from './AudioPlayer';
import { AppColors } from '../constants/Color';

export default function PsalmAudioExample() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Psalm Audio Player</Text>
      <Text style={styles.subtitle}>Listen to the Psalms in audio format</Text>
      
      <View style={styles.psalmContainer}>
        <Text style={styles.psalmTitle}>Psalm 101</Text>
        <AudioPlayer 
          psalmNumber={101}
          showControls={true}
          showProgress={true}
          showVolume={true}
        />
      </View>

      <View style={styles.psalmContainer}>
        <Text style={styles.psalmTitle}>Psalm 102</Text>
        <AudioPlayer 
          psalmNumber={102}
          showControls={true}
          showProgress={true}
          showVolume={true}
        />
      </View>

      <View style={styles.psalmContainer}>
        <Text style={styles.psalmTitle}>Psalm 103</Text>
        <AudioPlayer 
          psalmNumber={103}
          showControls={true}
          showProgress={true}
          showVolume={true}
        />
      </View>

      <View style={styles.psalmContainer}>
        <Text style={styles.psalmTitle}>Psalm 104</Text>
        <AudioPlayer 
          psalmNumber={104}
          showControls={true}
          showProgress={true}
          showVolume={true}
        />
      </View>

      <View style={styles.psalmContainer}>
        <Text style={styles.psalmTitle}>Psalm 105</Text>
        <AudioPlayer 
          psalmNumber={105}
          showControls={true}
          showProgress={true}
          showVolume={true}
        />
      </View>

      <View style={styles.psalmContainer}>
        <Text style={styles.psalmTitle}>Psalm 106</Text>
        <AudioPlayer 
          psalmNumber={106}
          showControls={true}
          showProgress={true}
          showVolume={true}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.appTextBlack,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Pretendard-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.appTextGrey,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Pretendard-Regular',
  },
  psalmContainer: {
    marginBottom: 24,
  },
  psalmTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.appTextBlack,
    marginBottom: 8,
    fontFamily: 'Pretendard-SemiBold',
  },
});
