# Audio Player Service

A comprehensive audio player service for playing Psalm audio files in your React Native app.

## Features

- ✅ Play, pause, stop, and seek audio
- ✅ Volume control
- ✅ Progress tracking
- ✅ Multiple Psalm support (101-106)
- ✅ React hooks for easy integration
- ✅ TypeScript support
- ✅ Error handling
- ✅ Loading states

## Files Created

1. **`src/services/AudioPlayerService.ts`** - Core audio player service
2. **`src/hooks/useAudioPlayer.ts`** - React hook for easy integration
3. **`src/components/AudioPlayer.tsx`** - Full-featured audio player component
4. **`src/components/SimpleAudioPlayer.tsx`** - Minimal audio player component
5. **`src/components/PsalmAudioExample.tsx`** - Example usage component

## Quick Start

### 1. Basic Usage with Hook

```tsx
import React from 'react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

function MyComponent() {
  const {
    isPlaying,
    play,
    pause,
    stop,
    playPsalm101,
    formattedTime,
    formattedDuration
  } = useAudioPlayer();

  return (
    <View>
      <Text>Status: {isPlaying ? 'Playing' : 'Paused'}</Text>
      <Text>Time: {formattedTime} / {formattedDuration}</Text>
      <Button title="Play Psalm 101" onPress={playPsalm101} />
      <Button title={isPlaying ? 'Pause' : 'Play'} onPress={isPlaying ? pause : play} />
      <Button title="Stop" onPress={stop} />
    </View>
  );
}
```

### 2. Using the Audio Player Component

```tsx
import AudioPlayer from '../components/AudioPlayer';

function MyScreen() {
  return (
    <View>
      <AudioPlayer 
        psalmNumber={101}
        showControls={true}
        showProgress={true}
        showVolume={true}
      />
    </View>
  );
}
```

### 3. Using the Simple Audio Player

```tsx
import SimpleAudioPlayer from '../components/SimpleAudioPlayer';

function MyReader() {
  return (
    <View>
      <Text>Psalm 101</Text>
      <SimpleAudioPlayer psalmNumber={101} />
    </View>
  );
}
```

## API Reference

### AudioPlayerService

#### Methods

- `play()` - Start playing audio
- `pause()` - Pause audio
- `stop()` - Stop audio and reset position
- `seekTo(time: number)` - Seek to specific time in seconds
- `setVolume(volume: number)` - Set volume (0-1)
- `loadAudio(audioPath: string)` - Load new audio file
- `playPsalm101()` - Play Psalm 101
- `playPsalm102()` - Play Psalm 102
- `playPsalm103()` - Play Psalm 103
- `playPsalm104()` - Play Psalm 104
- `playPsalm105()` - Play Psalm 105
- `playPsalm106()` - Play Psalm 106
- `release()` - Clean up resources

#### State

```typescript
interface AudioPlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  isStopped: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  isLoading: boolean;
  error: string | null;
}
```

### useAudioPlayer Hook

Returns all the service methods plus:

- `progress` - Progress as a number between 0-1
- `formattedTime` - Current time as "M:SS" string
- `formattedDuration` - Duration as "M:SS" string

### AudioPlayer Component Props

```typescript
interface AudioPlayerProps {
  psalmNumber?: number;        // Psalm number (101-106)
  showControls?: boolean;      // Show play/pause/stop buttons
  showProgress?: boolean;      // Show progress bar and time
  showVolume?: boolean;        // Show volume control
  style?: any;                 // Custom styles
}
```

## Integration Examples

### In Reader Component

```tsx
// Add to your Reader.tsx
import SimpleAudioPlayer from '../components/SimpleAudioPlayer';

// In your render method
<View style={styles.audioContainer}>
  <Text style={styles.audioLabel}>Listen to Psalm {chapterNumber}</Text>
  <SimpleAudioPlayer psalmNumber={chapterNumber} />
</View>
```

### In Main Navigation

```tsx
// Add to your main navigation
import PsalmAudioExample from '../components/PsalmAudioExample';

// Add as a screen
<Stack.Screen 
  name="AudioPlayer" 
  component={PsalmAudioExample} 
  options={{ title: 'Psalm Audio' }}
/>
```

## Audio Files

The service expects audio files in the following location:
- `assets/audio/Psalm-00101.m4a`
- `assets/audio/Psalm-00102.m4a`
- `assets/audio/Psalm-00103.m4a`
- `assets/audio/Psalm-00104.m4a`
- `assets/audio/Psalm-00105.m4a`
- `assets/audio/Psalm-00106.m4a`

## Dependencies

- `react-native-sound` - Audio playback
- `react-native-vector-icons` - Icons (MaterialIcons)

## Error Handling

The service includes comprehensive error handling:

- Audio loading errors
- Playback errors
- Network errors (if applicable)
- File not found errors

Errors are reported through the `error` state and callbacks.

## Performance Notes

- Audio files are loaded on-demand
- Progress tracking updates every 100ms
- Memory is cleaned up when component unmounts
- Use `release()` method to clean up resources

## Troubleshooting

### Common Issues

1. **Audio not playing**: Check if audio file exists and is properly bundled
2. **No sound**: Check device volume and audio permissions
3. **TypeScript errors**: Ensure all dependencies are properly installed
4. **Memory leaks**: Always call `release()` when component unmounts

### Debug Mode

Enable debug logging by setting:
```typescript
// In AudioPlayerService.ts
console.log('Debug mode enabled');
```

## License

This audio player service is part of your HoDlo Bible Mobile App project.
