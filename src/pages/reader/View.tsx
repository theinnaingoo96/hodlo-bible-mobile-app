import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import {
  StyleSheet,
  View,
  Dimensions,
  PanResponder,
  Animated,
  CursorValue,
  TouchableOpacity,
  Text,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Alert,
} from 'react-native';

import TermsIcon from '../../components/icons/setting/UpdateIcon';
import CustomAlert from '../../components/CustomAlert';
import { AppColors } from '../../constants/Color';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { constants } from '../../constants/Data';
import {
  setCurrentVerse,
  setReadingProgress,
} from '../../store/slices/readerSlice';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import DatabaseService from '../../services/DatabaseService';
import { VerseComponent, ChapterEndFooterComponent } from './ReaderComponents';

interface SplitReaderViewProps {
  verses: any[];
  // onStartBookmark: (verse: any) => void;
  // onRemoveBookmark: (id: number) => void;
  onLongPress: (verse: any) => void;
  onNextChapter: () => void;
  onPreviousChapter: () => void;
  dividerMode: string;
  onVerseClick: (verse: any) => void;
  selectedVerse: any;
}

const SplitReaderView: React.FC<SplitReaderViewProps> = ({
  verses,
  // onStartBookmark,
  // onRemoveBookmark,
  onLongPress,
  onNextChapter,
  onPreviousChapter,
  dividerMode,
  onVerseClick,
  selectedVerse,
}) => {
  const device = useSelector((state: any) => state.device);
  const deviceHeight = Dimensions.get('window').height;
  const deviceWidth = Dimensions.get('window').width;
  const reader = useSelector((state: any) => state.reader);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [offset, setOffset] = useState(0);
  const [topHeight, setTopHeight] = useState(40);
  const [bottomHeight, setBottomHeight] = useState(40);
  const [leftWidth, setLeftWidth] = useState(40);
  const [rightWidth, setRightWidth] = useState(40);
  const [isDividerClicked, setIsDividerClicked] = useState(false);
  const [isViewChangeAlertVisible, setIsViewChangeAlertVisible] =
    useState(false);
  // const [dividerMode, setDividerMode] = useState('horizontal'); // horizontal or vertical
  const [localVerses, setLocalVerses] = useState<any[]>([]);
  const topRef = useRef<FlatList>(null);
  const bottomRef = useRef<FlatList>(null);
  const leftRef = useRef<FlatList>(null);
  const rightRef = useRef<FlatList>(null);
  const singleRef = useRef<FlatList>(null);
  const isSyncing = useRef(false);
  const isUserInteracting = useRef(false);
  const [activeVerseIndex, setActiveVerseIndex] = useState(-1);

  const topHeights = useRef({ content: 1, layout: 1 });
  const bottomHeights = useRef({ content: 1, layout: 1 });
  const leftHeights = useRef({ content: 1, layout: 1 });
  const rightHeights = useRef({ content: 1, layout: 1 });
  // const leftWidths = useRef({ content: 1, layout: 1 });
  // const rightWidths = useRef({ content: 1, layout: 1 });

  const fadeAnim = useRef(new Animated.Value(0)).current; // Opacity
  const translateY = useRef(new Animated.Value(20)).current; // Position
  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  const [itemLayouts, setItemLayouts] = useState<any>({});

  const {
    isPlaying,
    isPaused,
    isStopped,
    duration,
    currentTime,
    volume,
    isLoading,
    error,
  } = useAudioPlayer();

  useEffect(() => {
    showFAB();
    setTopHeight(deviceHeight / 2);
    setBottomHeight(deviceHeight / 2);
    setLeftWidth(deviceWidth / 2);
    setRightWidth(deviceWidth / 2);

    const currentVerse = reader.currentRead.verseId;
    const targetIndex = verses.findIndex(x => x.id === currentVerse);
    // console.log(reader.currentRead, targetIndex);
  }, []);

  // Helper to convert MM:SS or milliseconds to seconds
  const timeToSeconds = (timeStr: any): number => {
    if (timeStr === undefined || timeStr === null || timeStr === '') return 0;

    // If it's already a number, check if it's likely milliseconds
    if (typeof timeStr === 'number') {
      return timeStr > 10000 ? timeStr / 1000 : timeStr;
    }

    const str = timeStr.toString();
    if (str.includes(':')) {
      const parts = str.split(':').map(Number);
      if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
      }
      return parts[0] || 0;
    }

    const num = Number(str);
    if (isNaN(num)) return 0;
    return num > 10000 ? num / 1000 : num;
  };

  useEffect(() => {
    if (!isPlaying || isStopped || !verses || verses.length === 0) {
      if (activeVerseIndex !== -1) setActiveVerseIndex(-1);
      return;
    }

    const newIndex = verses.findIndex(v => {
      const from = timeToSeconds(v.audio_from);
      const to = timeToSeconds(v.audio_to);

      if (from === 0 && to === 0) return false;

      // Add a small buffer (0.1s) to make highlighting feel more responsive
      return currentTime >= from && currentTime < to;
    });

    if (newIndex !== -1 && newIndex !== activeVerseIndex) {
      setActiveVerseIndex(newIndex);

      if (!isUserInteracting.current) {
        scrollToIndex(newIndex, true);
      }
    }
  }, [currentTime, isPlaying, isStopped, verses]);

  // Auto-scroll to target index when layouts are available
  // useEffect(() => {
  //     if (Object.keys(itemLayouts).length === 0) return;

  //     const currentVerse = reader.currentRead.verseId;
  //     const targetIndex = verses.findIndex((x) => x.id === currentVerse);

  //     if (targetIndex >= 0) {
  //         scrollToIndex(targetIndex);
  //     }
  // }, [itemLayouts,verses]);

  useEffect(() => {
    // console.log('verses from View', verses);
    setLocalVerses(verses);
  }, [verses]);

  const verticalPanResponder = useRef(
    PanResponder.create({
      //   onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: (e, gestureState) => {
        setOffset(e.nativeEvent.pageY);
        setIsDividerClicked(true);
      },

      onPanResponderMove: (e, gestureState) => {
        const newBottomHeight =
          gestureState.moveY > deviceHeight - 40
            ? 40
            : deviceHeight - gestureState.moveY;
        setBottomHeight(newBottomHeight);
        setOffset(e.nativeEvent.pageY);
      },

      onPanResponderRelease: (e, gestureState) => {
        setOffset(e.nativeEvent.pageY);
        setIsDividerClicked(false);
      },
    }),
  ).current;

  const horizontalPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: (e, gestureState) => {
        setOffset(e.nativeEvent.pageX);
        setIsDividerClicked(true);
      },

      onPanResponderMove: (e, gestureState) => {
        const newLeftWidth =
          gestureState.moveX > deviceWidth - 40
            ? 40
            : deviceWidth - gestureState.moveX;
        setLeftWidth(newLeftWidth);
        setOffset(e.nativeEvent.pageX);
      },

      onPanResponderRelease: (e, gestureState) => {
        setOffset(e.nativeEvent.pageX);
        setIsDividerClicked(false);
      },
    }),
  ).current;

  const handleViewChange = () => {
    // console.log('handleViewChange');
    // setDividerMode(dividerMode == "horizontal" ? "vertical" : "horizontal");
    setIsViewChangeAlertVisible(false);
  };

  const getScrollRatio = (scrollY: number, from: any, to: any) => {
    const fromScrollable = from.content - from.layout;
    const toScrollable = to.content - to.layout;
    if (fromScrollable <= 0 || toScrollable <= 0) {
      return 0;
    }
    return (scrollY / fromScrollable) * toScrollable;
  };

  const handleLayout = (e: any, index: number) => {
    const { y } = e.nativeEvent.layout;
    // console.log("handleLayout", index, e.nativeEvent);
    setItemLayouts((prev: any) => ({ ...prev, [index]: y }));
  };

  const scrollToIndex = (index: number, animated: boolean = true) => {
    console.log('scroll to index', index);
    if (index < 0 || index >= verses.length) {
      return;
    }

    // Add a small delay to ensure layout is complete
    setTimeout(() => {
      if (device.language !== 'en' && device.language !== 'mm') {
        // Single view mode
        singleRef.current?.scrollToIndex({ index, animated });
      } else if (dividerMode === 'horizontal') {
        // Horizontal split view
        topRef.current?.scrollToIndex({ index, animated });
        bottomRef.current?.scrollToIndex({ index, animated });
      } else {
        // Vertical split view
        leftRef.current?.scrollToIndex({ index, animated });
        rightRef.current?.scrollToIndex({ index, animated });
      }
    }, 100);
  };

  // Public method to scroll to any verse by index
  const scrollToVerseIndex = (index: number) => {
    scrollToIndex(index, true);
  };

  const onSingleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    let currentIndex = 0;

    // find the last index whose offset <= current scroll position
    for (let i = 0; i < verses.length; i++) {
      if (itemLayouts[i] !== undefined && offsetY >= itemLayouts[i]) {
        currentIndex = i + 2;
      }
    }

    // Ensure we don't go out of bounds
    currentIndex = Math.max(0, Math.min(currentIndex, verses.length - 1));

    // Check if verse exists before accessing its properties
    if (verses[currentIndex]) {
      dispatch(
        setCurrentVerse({
          verseId: verses[currentIndex].id,
          verseNumber: verses[currentIndex].number,
        }),
      );
      // console.log("Current index:", currentIndex, verses[currentIndex]);
    }
    // console.log(itemLayouts);
  };

  const onTopScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    // console.log('onTopScroll', e);
    if (isSyncing.current) {
      return;
    }
    const scrollY = e.nativeEvent.contentOffset.y;
    const syncedY = getScrollRatio(
      scrollY,
      topHeights.current,
      bottomHeights.current,
    );

    isSyncing.current = true;
    bottomRef.current?.scrollToOffset({ offset: syncedY, animated: false });
    setTimeout(() => (isSyncing.current = false), 10);
  };

  const onBottomScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    // console.log('onBottomScroll', e);
    if (isSyncing.current) {
      return;
    }
    const scrollY = e.nativeEvent.contentOffset.y;
    const syncedY = getScrollRatio(
      scrollY,
      bottomHeights.current,
      topHeights.current,
    );

    isSyncing.current = true;
    topRef.current?.scrollToOffset({ offset: syncedY, animated: false });
    setTimeout(() => (isSyncing.current = false), 10);
  };

  const onLeftScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    // console.log('onLeftScroll', e);
    if (isSyncing.current) {
      return;
    }
    const scrollY = e.nativeEvent.contentOffset.y;
    const syncedY = getScrollRatio(
      scrollY,
      leftHeights.current,
      rightHeights.current,
    );

    isSyncing.current = true;
    rightRef.current?.scrollToOffset({ offset: syncedY, animated: false });
    setTimeout(() => (isSyncing.current = false), 10);
  };
  const onRightScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    // console.log('onRightScroll', e);
    if (isSyncing.current) {
      return;
    }
    const scrollY = e.nativeEvent.contentOffset.y;
    const syncedY = getScrollRatio(
      scrollY,
      rightHeights.current,
      leftHeights.current,
    );

    isSyncing.current = true;
    leftRef.current?.scrollToOffset({ offset: syncedY, animated: false });
    setTimeout(() => (isSyncing.current = false), 10);
  };

  const showFAB = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideFAB = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onCompleteChapter = () => {
    DatabaseService.getInstance()
      .updateChapterCompletedAt(reader.currentRead.chapterId)
      .then((result: any) => {
        if (result) {
          DatabaseService.getInstance()
            .calcReadingProgress()
            .then((progress: any) => {
              dispatch(setReadingProgress(progress));
            });
        }
      });
  };

  // const handleScroll = () => {
  //     hideFAB();
  //     if (hideTimer.current) clearTimeout(hideTimer.current);
  //     hideTimer.current = setTimeout(() => {
  //         showFAB();
  //     }, 300);
  // };

  return (
    <View
      style={[
        styles.content,
        { flexDirection: dividerMode === 'horizontal' ? 'column' : 'row' },
      ]}>
      {device.language !== 'en' && device.language !== 'mm' ? (
        <FlatList
          ref={singleRef}
          data={verses}
          extraData={{ activeVerseIndex, selectedVerse, readerSetting: reader.readerSetting }}
          keyExtractor={(item) => `single-view-${item.id}`}
          renderItem={({ item, index }) => (
            <VerseComponent
              verse={item}
              language={'hd'}
              index={index}
              activeVerseIndex={activeVerseIndex}
              selectedVerse={selectedVerse}
              readerSetting={reader.readerSetting}
              onVerseClick={onVerseClick}
              onLongPress={onLongPress}
            />
          )}
          onScrollBeginDrag={() => {
            isUserInteracting.current = true;
            hideFAB();
          }}
          onScrollEndDrag={() => {
            isUserInteracting.current = false;
            showFAB();
          }}
          onMomentumScrollEnd={() => {
            isUserInteracting.current = false;
            showFAB();
          }}
          onScroll={onSingleScroll}
          style={{ height: topHeight }}
          scrollEventThrottle={16}
          onEndReached={onCompleteChapter}
          ListFooterComponent={() => <ChapterEndFooterComponent bookName={reader.currentRead.bookName} chapterNumber={reader.currentRead.chapterNumber} readerSetting={reader.readerSetting} />}
        />
      ) : dividerMode === 'horizontal' ? (
        <>
          <Animated.View
            style={[
              { minHeight: 40, flex: 1 },
              { height: topHeight, width: Dimensions.get('window').width },
            ]}>
            <FlatList
              ref={topRef}
              data={verses}
              extraData={{ activeVerseIndex, selectedVerse, readerSetting: reader.readerSetting }}
              keyExtractor={(item) => `top-${item.id}`}
              renderItem={({ item, index }) => (
                <VerseComponent
                  verse={item}
                  language={'hd'}
                  index={index}
                  activeVerseIndex={activeVerseIndex}
                  selectedVerse={selectedVerse}
                  readerSetting={reader.readerSetting}
                  onVerseClick={onVerseClick}
                  onLongPress={onLongPress}
                />
              )}
              style={{ flex: 1 }}
              scrollEnabled={true}
              onScroll={onTopScroll}
              onScrollBeginDrag={() => {
                isUserInteracting.current = true;
                hideFAB();
              }}
              onScrollEndDrag={() => {
                isUserInteracting.current = false;
                showFAB();
              }}
              onMomentumScrollEnd={() => {
                isUserInteracting.current = false;
                showFAB();
              }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={(w, h) => (topHeights.current.content = h)}
              onLayout={e =>
                (topHeights.current.layout = e.nativeEvent.layout.height)
              }
              onEndReached={onCompleteChapter}
              ListFooterComponent={() => <ChapterEndFooterComponent bookName={reader.currentRead.bookName} chapterNumber={reader.currentRead.chapterNumber} readerSetting={reader.readerSetting} />}
            />
          </Animated.View>
          <View
            style={[
              {
                height: 20,
                backgroundColor: '#aaa',
                justifyContent: 'center',
                alignItems: 'center',
              },
              isDividerClicked
                ? { backgroundColor: '#666' }
                : { backgroundColor: '#e2e2e2' },
            ]}
            {...verticalPanResponder.panHandlers}>
            <View style={styles.ellipsisButton}>
              <View style={styles.dragHandle} />
            </View>
          </View>
          <Animated.View style={[{ minHeight: 40 }, { height: bottomHeight }]}>
            <FlatList
              ref={bottomRef}
              data={verses}
              extraData={{ activeVerseIndex, selectedVerse, readerSetting: reader.readerSetting }}
              keyExtractor={(item) => `bottom-${item.id}`}
              renderItem={({ item, index }) => (
                <VerseComponent
                  verse={item}
                  language={device.language}
                  index={index}
                  activeVerseIndex={activeVerseIndex}
                  selectedVerse={selectedVerse}
                  readerSetting={reader.readerSetting}
                  onVerseClick={onVerseClick}
                  onLongPress={onLongPress}
                />
              )}
              style={{ flex: 1 }}
              scrollEnabled={true}
              onScroll={onBottomScroll}
              onScrollBeginDrag={() => {
                isUserInteracting.current = true;
                hideFAB();
              }}
              onScrollEndDrag={() => {
                isUserInteracting.current = false;
                showFAB();
              }}
              onMomentumScrollEnd={() => {
                isUserInteracting.current = false;
                showFAB();
              }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={(w, h) =>
                (bottomHeights.current.content = h)
              }
              onLayout={e =>
                (bottomHeights.current.layout = e.nativeEvent.layout.height)
              }
              ListFooterComponent={() => <ChapterEndFooterComponent bookName={reader.currentRead.bookName} chapterNumber={reader.currentRead.chapterNumber} readerSetting={reader.readerSetting} />}
            />
          </Animated.View>
        </>
      ) : (
        <>
          <Animated.View style={[{ minWidth: 40, flex: 1 }, { width: leftWidth }]}>
            <FlatList
              ref={leftRef}
              data={verses}
              extraData={{ activeVerseIndex, selectedVerse, readerSetting: reader.readerSetting }}
              keyExtractor={(item) => `left-${item.id}`}
              renderItem={({ item, index }) => (
                <VerseComponent
                  verse={item}
                  language={'hd'}
                  index={index}
                  activeVerseIndex={activeVerseIndex}
                  selectedVerse={selectedVerse}
                  readerSetting={reader.readerSetting}
                  onVerseClick={onVerseClick}
                  onLongPress={onLongPress}
                />
              )}
              style={{ flex: 1 }}
              scrollEnabled={true}
              onScroll={onLeftScroll}
              onScrollBeginDrag={() => {
                isUserInteracting.current = true;
                hideFAB();
              }}
              onScrollEndDrag={() => {
                isUserInteracting.current = false;
                showFAB();
              }}
              onMomentumScrollEnd={() => {
                isUserInteracting.current = false;
                showFAB();
              }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={(w, h) => (leftHeights.current.content = h)}
              onLayout={e =>
                (leftHeights.current.layout = e.nativeEvent.layout.height)
              }
              onEndReached={onCompleteChapter}
              ListFooterComponent={() => <ChapterEndFooterComponent bookName={reader.currentRead.bookName} chapterNumber={reader.currentRead.chapterNumber} readerSetting={reader.readerSetting} />}
            />
          </Animated.View>
          <View
            style={[
              styles.dividerVertical,
              isDividerClicked
                ? { backgroundColor: '#666' }
                : { backgroundColor: '#e2e2e2' },
            ]}
            {...horizontalPanResponder.panHandlers}>
            <View style={styles.ellipsisButtonVertical}>
              <View style={styles.dragHandleVertical} />
            </View>
          </View>
          <Animated.View style={[{ minWidth: 40 }, { width: rightWidth }]}>
            <FlatList
              ref={rightRef}
              data={verses}
              extraData={{ activeVerseIndex, selectedVerse, readerSetting: reader.readerSetting }}
              keyExtractor={(item) => `right-${item.id}`}
              renderItem={({ item, index }) => (
                <VerseComponent
                  verse={item}
                  language={device.language}
                  index={index}
                  activeVerseIndex={activeVerseIndex}
                  selectedVerse={selectedVerse}
                  readerSetting={reader.readerSetting}
                  onVerseClick={onVerseClick}
                  onLongPress={onLongPress}
                />
              )}
              style={{ flex: 1 }}
              scrollEnabled={true}
              onScroll={onRightScroll}
              onScrollBeginDrag={() => {
                isUserInteracting.current = true;
                hideFAB();
              }}
              onScrollEndDrag={() => {
                isUserInteracting.current = false;
                showFAB();
              }}
              onMomentumScrollEnd={() => {
                isUserInteracting.current = false;
                showFAB();
              }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={(w, h) => (rightHeights.current.content = h)}
              onLayout={e =>
                (rightHeights.current.layout = e.nativeEvent.layout.height)
              }
              ListFooterComponent={() => <ChapterEndFooterComponent bookName={reader.currentRead.bookName} chapterNumber={reader.currentRead.chapterNumber} readerSetting={reader.readerSetting} />}
            />
          </Animated.View>
        </>
      )}
      <Animated.View
        style={[
          styles.fabContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY }],
            bottom: 20 + insets.bottom,
          },
        ]}>
        <TouchableOpacity
          style={[
            styles.fabLeft,
            {
              backgroundColor: device.theme
                ? AppColors.primaryDark
                : AppColors.appTextWhite,
            },
          ]}
          onPress={onPreviousChapter}>
          <FontAwesome6
            name="angle-left"
            iconStyle="solid"
            color={
              device.theme ? AppColors.appTextWhite : AppColors.primaryDark
            }
            size={15}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.fabLeft,
            {
              backgroundColor: device.theme
                ? AppColors.primaryDark
                : AppColors.appTextWhite,
            },
          ]}
          onPress={onNextChapter}>
          <FontAwesome6
            name="angle-right"
            iconStyle="solid"
            color={
              device.theme ? AppColors.appTextWhite : AppColors.primaryDark
            }
            size={15}
          />
        </TouchableOpacity>
      </Animated.View>
      {/* <CustomAlert
                visible={isViewChangeAlertVisible}
                title="Change Split View"
                message={"Are you sure you want change view to " + (dividerMode == "horizontal" ? "vertical?" : "horizontal?")}
                onClose={() => setIsViewChangeAlertVisible(false)}
                onConfirm={handleViewChange}
            /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: '100%',
  },
  divider: {
    height: 20,
    width: '100%',
    backgroundColor: '#aaa',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'row-resize' as CursorValue,
  },
  dividerVertical: {
    height: '100%',
    width: 20,
    backgroundColor: '#aaa',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'row-resize' as CursorValue,
  },
  dragHandle: {
    width: '50%',
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
  },
  ellipsisButton: {
    width: '20%',
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ellipsisButtonVertical: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragHandleVertical: {
    width: 4,
    height: '50%',
    backgroundColor: '#444',
    borderRadius: 2,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  fabLeft: {
    borderRadius: 30,
    elevation: 4,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabRight: {
    backgroundColor: '#ff3b30',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    elevation: 4,
  },
  fabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SplitReaderView;
