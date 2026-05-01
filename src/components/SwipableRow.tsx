import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DELETE_BUTTON_WIDTH = 80;

const SwipeableRow = ({ item, onDelete }: { item: any, onDelete: (id: number) => void }) => {
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        // Snap to either 0 (closed) or the width of the delete button (open)
        snapToOffsets={[0, DELETE_BUTTON_WIDTH]}
        disableIntervalMomentum={true}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. THE MAIN CONTENT (Full Width) */}
        <View style={styles.mainContent}>
          <View style={styles.dot} />
          <View>
            <Text style={styles.bookTitle}>{item.book_name} {item.chapter_number}</Text>
            <Text style={styles.timeText}>{item.completed_at}</Text>
          </View>
        </View>

        {/* 2. THE DELETE ACTION */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            onDelete(item.id);
            // Optionally close the row after delete
            scrollViewRef.current?.scrollTo({ x: 0, animated: true } as any);
          }}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 1, // Border between items
  },
  scrollContent: {
    // Width = Device Width + the hidden delete button width
    width: SCREEN_WIDTH + DELETE_BUTTON_WIDTH,
  },
  mainContent: {
    width: SCREEN_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  deleteButton: {
    backgroundColor: '#FF3B30', // Standard iOS Red
    width: DELETE_BUTTON_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CD964',
    marginRight: 15,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    color: '#888',
  },
});

export default SwipeableRow;