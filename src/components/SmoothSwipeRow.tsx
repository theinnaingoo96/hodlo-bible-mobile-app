import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import DatabaseService from '../services/DatabaseService';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TRASH_THRESHOLD = -80;

const SmoothSwipeRow = forwardRef(({ item, onDelete, onOpen }: { item: any, onDelete: (id: number) => void, onOpen: (id: number) => void }, ref) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const rowOpened = useRef(false);

  useImperativeHandle(ref, () => ({
    close: (isDeleting = false) => {
      animateClose(isDeleting);
    },
    itemId: item.id
  }));

  const animateOpen = () => {
    rowOpened.current = true;
    Animated.spring(translateX, {
      toValue: TRASH_THRESHOLD,
      useNativeDriver: true,
      bounciness: 5,
    }).start();
    onOpen && onOpen(item.id);
  };

  const animateClose = (isDeleting = false) => {
    rowOpened.current = false;
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: isDeleting ? 80 : 40,
        friction: 8,
      }),
      isDeleting
        ? Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true })
        : Animated.delay(0)
    ]).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        onOpen && onOpen(item.id);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0 && !rowOpened.current) {
          translateX.setValue(0);
        } else {
          const newX = rowOpened.current ? TRASH_THRESHOLD + gestureState.dx : gestureState.dx;
          translateX.setValue(newX > 0 ? 0 : newX);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -40 || gestureState.vx < -0.5) {
          animateOpen();
        } else {
          animateClose();
        }
      },
    })
  ).current;

  const handleDeletePress = () => {
    animateClose(true);

    setTimeout(() => {
      onDelete(item.id);
    }, 250);
  };

  const handleOnPress = () => {
    console.log('Detail', item);
    DatabaseService.getInstance().getVersesById(item.verse_id).then((result: any) => {
      console.log('Verse', result);
    });
  }

  return (
    <View style={styles.container}>
      {/* BACKGROUND ACTIONS */}
      <View style={styles.deleteBackground}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeletePress}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* FOREGROUND CONTENT */}
      <Animated.View
        style={[
          styles.mainContent,
          { transform: [{ translateX }], opacity }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity style={styles.itemRow} onPress={handleOnPress}>
          <View style={[styles.dot, { backgroundColor: item.color }]} />
          <View style={styles.textContainer}>
            <Text style={styles.bookTitle}>{item.book} {item.chapter}:{item.verse}</Text>
            <Text style={styles.timeText}>{item.created_at}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FF3B30',
    overflow: 'hidden',
    height: 60,
    justifyContent: 'center',
    marginBottom: 1,
    borderRadius: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  deleteBackground: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 10,
  },
  deleteButton: {
    width: 45,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 10,
  },
  mainContent: {
    width: SCREEN_WIDTH,
    height: '100%',
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    borderRadius: 10,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 15 },
  bookTitle: { fontSize: 16, fontWeight: '600' },
  timeText: { fontSize: 12, color: '#888' },
});

export default SmoothSwipeRow;