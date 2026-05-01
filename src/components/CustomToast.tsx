import React, { useEffect, useRef } from 'react';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { View, Text, StyleSheet, Animated, Modal, Dimensions } from 'react-native';

import { setToast } from '../store/slices/deviceSlice';
import { ToastType } from '../types/data';
import { store } from '../store/store';
import { constants } from '../constants/Data';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

export const CustomToast = ({ visible, message, type, duration }: {
  visible: boolean;
  message: string;
  type: ToastType;
  duration: number;
}) => {
  const fadeAnim = new Animated.Value(0);
  const opacity = useRef(new Animated.Value(0)).current;
  const device = useSelector((state: any) => state.device);

  useEffect(() => {
    if (visible) {
      store.dispatch(setToast({ show: true, message: message, type: type || 'success', duration: duration || constants.toastDuration }));
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            store.dispatch(setToast({ show: false, message: '', type: 'success', duration: constants.toastDuration }));
          });
        }, duration);
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    // <Animated.View pointerEvents="none" style={[styles.toastContainer, { opacity }]}>
    //   <View style={styles.toast}>
    //     <Text style={styles.text}>{message}</Text>
    //   </View>
    // </Animated.View>
    <Animated.View pointerEvents="none" style={[styles.container, { opacity }]}>
      <View style={[styles.toast, { backgroundColor: device.theme ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)' }]}>
        {/* <Ionicons name={icon as any} size={20} color="#fff" style={{ marginRight: 8 }} /> */}
        <FontAwesome6 iconStyle="solid" name={constants.toast[type].icon as any} size={20} color={constants.toast[type].color} style={{ marginRight: 8 }} />
        <View>
          {/* {title && <Text style={styles.title}>{title}</Text>} */}
          <Text style={[styles.message, { color: device.theme ? '#fff' : '#000' }]}>{message}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // toastContainer: {
  //   position: 'absolute',
  //   bottom: 60,
  //   width: width,
  //   alignItems: 'center',
  //   zIndex: 9999,
  // },
  // toast: {
  //   backgroundColor: 'rgba(0,0,0,0.8)',
  //   paddingVertical: 10,
  //   paddingHorizontal: 20,
  //   borderRadius: 10,
  // },
  // text: {
  //   color: 'white',
  //   fontSize: 14,
  // },
  container: {
    position: 'absolute',
    bottom: 60,
    width: width,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    maxWidth: width * 0.9,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  message: {
    // color: '#fff',
    fontSize: 13,
  },
});
