import React, { useEffect, useRef } from 'react';
import {
  Modal,
  Animated,
  StyleSheet,
  Dimensions,
  Text,
  View,
  TouchableWithoutFeedback,
} from 'react-native';

interface CustomToastProps {
  visible: boolean;
  message: string;
  onHide: () => void;
  duration?: number;
}

const { width } = Dimensions.get('window');

const CustomToast: React.FC<CustomToastProps> = ({
  visible,
  message,
  onHide,
  duration = 2000,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide
      const timeout = setTimeout(() => hideToast(), duration);
      return () => clearTimeout(timeout);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 30,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onHide());
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onHide}
    >
      <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => hideToast()}>
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.toastContainer,
              {
                opacity,
                transform: [{ translateY }],
              },
            ]}
          >
            <View style={styles.glassBox}>
              <Text style={styles.toastText}>{message}</Text>
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CustomToast;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  toastContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  glassBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    // filter: 'blur(5px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 12,
    maxWidth: width * 0.8,
    zIndex: 10000,
  },
  toastText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
