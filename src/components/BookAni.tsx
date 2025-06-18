import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const BookAni = () => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.cross, animatedStyle]}>
        <View style={styles.vertical} />
        <View style={styles.horizontal} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cross: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vertical: {
    width: 7,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  horizontal: {
    position: 'absolute',
    top: 18,
    width: 30,
    height: 7,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
});

export default BookAni;
