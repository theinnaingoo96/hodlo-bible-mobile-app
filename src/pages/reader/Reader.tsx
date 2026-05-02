import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import Slider from '@react-native-community/slider';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Modal,
  Dimensions,
  Alert,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

import { setCurrent } from '../../store/slices/readerSlice';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import ReaderSetting from '../../components/ReaderSetting';
import { testAudioLoading } from '../../utils/audioDebug';
import { setToast } from '../../store/slices/deviceSlice';
import ReaderHeader from '../../components/ReaderHeader';
import DatabaseService from '../../services/DatabaseService';
import CloseIcon from '../../components/icons/CloseIcon';
import BottomSheet from '../../components/BottomSheet';
import ColorPicker from '../../components/ColorPicker';
import { AppColors } from '../../constants/Color';
import { constants } from '../../constants/Data';
import { CurrentRead } from '../../types/reader';
import { store } from '../../store/store';
import SplitReaderView from './View';
import ShareModal from '../../components/modals/ShareModal';
import OptionModal from '../../components/modals/OptionModal';
import { getAudioChapter } from '../../services/ApiService';
import audioPlayer from '../../services/AudioPlayerService';
import fileDownloadService from '../../services/FileDownloadService';
import { setDownloadProgress } from '../../store/slices/deviceSlice';
import CustomLoading from '../../components/CustomLoading';

const Reader = ({ navigation, route }: any) => {
  const device = useSelector((state: any) => state.device);
  const reader = useSelector((state: any) => state.reader);
  const params = route.params;
  const insets = useSafeAreaInsets();
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [optionSheetVisible, setOptionSheetVisible] = useState(false);
  const [playerSheetVisible, setPlayerSheetVisible] = useState(false);
  const [fontSize, setFontSize] = useState(0.5);
  const [verses, setVerses] = useState();
  const [selectedVerse, setSelectedVerse] = useState<any>(null);

  // Audio player state from Redux
  const audioPlayerState = reader.audioPlayer;
  const {
    isPlaying,
    isPaused,
    isStopped,
    duration,
    currentTime,
    volume,
    isLoading,
    error,
  } = audioPlayerState;

  const {
    play,
    pause,
    resume,
    stop,
    seekTo,
    setVolume,
    playPsalm23,
    playPsalm24,
    playPsalm101,
    playPsalm102,
    playPsalm103,
    playPsalm104,
    playPsalm105,
    playPsalm106,
  } = useAudioPlayer();

  const progress = duration > 0 ? currentTime / duration : 0;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formattedTime = formatTime(currentTime);
  const formattedDuration = formatTime(duration);
  const [highlightModalVisible, sethighlightModalVisible] = useState(false);
  const [bookmarkModalVisible, setBookmarkModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [optionModalVisible, setOptionModalVisible] = useState(false);
  const [highlightedVerse, setHighlightedVerse] = useState({
    book_name: '',
    chapter_no: '',
    chapter_id: '',
    verse_id: '',
    verse_number: '',
    text_en: '',
    text_hd: '',
    text_mm: '',
  });
  const [bookmarkedVerse, setBookmarkedVerse] = useState({
    book_name: '',
    chapter_no: '',
    chapter_id: '',
    verse_id: '',
    verse_number: '',
    text_en: '',
    text_hd: '',
    text_mm: '',
  });
  const [dividerMode, setDividerMode] = useState('horizontal'); // horizontal or vertical
  const [selectedColor, setSelectedColor] = useState({
    name: 'Red',
    hex: 'rgba(255, 59, 48, 0.7)',
    code: 'rgba(244, 67, 54, 0.2)',
  });
  const [currentVerse, setCurrentVerse] = useState(params.chapter || 101);
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [chapterMasterId, setChapterMasterId] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgressValue, setDownloadProgressValue] = useState(0);
  const [transitionLoading, setTransitionLoading] = useState(false);

  // Monitor currentTime updates
  // useEffect(() => {
  //     if (currentTime > 0) {
  //         console.log('currentTime updated:', currentTime, 'formattedTime:', formattedTime);
  //     }
  // }, [currentTime, formattedTime]);

  useEffect(() => {
    if (route.params.chapter) {
      fetchVerses();
      fetchChapterMasterId();
    }
    Dimensions.addEventListener('change', ({ window: { width, height } }) => {
      if (width < height) {
        console.log('PORTRAIT');
      } else {
        console.log('LANDSCAPE');
      }
    });
  }, [route.params, highlightModalVisible, bookmarkModalVisible]);

  // useEffect(() => {
  //   console.log('verses from Reader 2', verses, route.params);
  //   // fetchVerses();
  // }, []);

  // useEffect(() => {
  //   // console.log('progress', progress);
  // }, [currentTime, duration]);

  useEffect(() => {
    if (params.autoPlay) {
      fetchChapterMasterId();
      console.log('[AUDIO] Auto-playing next chapter...', params);
      const timer = setTimeout(() => {
        handleAudioReaderPress();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [params.chapterId]);

  useEffect(() => {
    const unsubscribe = audioPlayer.addListener('end', () => {
      console.log('[AUDIO] Audio finished. Transitioning to next chapter...');
      handleNextChapter(true);
    });

    return () => {
      unsubscribe();
    };
  }, [verses]);

  const fetchChapterMasterId = () => {
    DatabaseService.getInstance()
      .getChapterMasterId(route.params.chapterId)
      .then((chapterMasterId: any) => {
        console.log('chapterMasterId from fetchChapterMasterId', route.params.chapterId, chapterMasterId);
        setChapterMasterId(chapterMasterId);
      });
  };

  const fetchVerses = () => {
    DatabaseService.getInstance()
      .getVersesByChapterId(route.params.chapterId)
      .then((v: any) => {
        let temp_verses = v;
        DatabaseService.getInstance()
          .getHighlights()
          .then(async (h: any) => {
            const temp_highlights = h;
            await temp_highlights.forEach((highlight: any) => {
              const index = temp_verses.findIndex(
                (v: any) => v.id === highlight.verse_id,
              );
              if (index !== -1) {
                temp_verses[index].highlight = true;
                temp_verses[index].highlight_color = highlight.color;
              }
            });
            DatabaseService.getInstance()
              .getBookmarks()
              .then(async (b: any) => {
                const t_bookmarks = b;
                await t_bookmarks.forEach((bookmark: any) => {
                  const index = temp_verses.findIndex(
                    (v: any) => v.id === bookmark.verse_id,
                  );
                  if (index !== -1) {
                    temp_verses[index].bookmark = true;
                    temp_verses[index].bookmark_note = bookmark.note;
                  }
                });
                if (temp_verses.length > 0) {
                  setVerses(temp_verses);
                }
              });
          });
      });
  };

  const handleCreateBookmark = (verse: any) => {
    setBookmarkModalVisible(true);
    setBookmarkedVerse({
      book_name: params.book,
      chapter_no: params.chapter,
      chapter_id: verse.chapter_id,
      verse_id: verse.id,
      verse_number: verse.number,
      text_en: verse.text_en,
      text_hd: verse.text_hd,
      text_mm: verse.text_mm,
    });
  };

  const handleRemoveBookmark = (id: number) => {
    Alert.alert(
      'Remove Bookmark',
      'Are you sure you want to remove this bookmark?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          onPress: () => {
            DatabaseService.getInstance()
              .clearBookmarkById(id)
              .then((result: any) => {
                console.log('result', result);
                setBookmarkModalVisible(false);
                setBottomSheetVisible(false);
                setOptionSheetVisible(false);
                fetchVerses();
                store.dispatch(
                  setToast({
                    show: true,
                    message: 'Bookmark removed',
                    type: 'change',
                    duration: constants.toastDuration,
                  }),
                );
              });
          },
        },
      ],
    );
  };

  const handleConfirmBookmark = () => {
    DatabaseService.getInstance()
      .addBookmark(bookmarkedVerse.verse_id, bookmarkNote)
      .then(() => {
        setBookmarkModalVisible(false);
        setBottomSheetVisible(false);
        setOptionSheetVisible(false);
      });
  };

  const handleCreateHighlight = (verse: any) => {
    sethighlightModalVisible(true);
    setHighlightedVerse({
      book_name: params.book,
      chapter_no: params.chapter,
      chapter_id: verse.chapter_id,
      verse_id: verse.id,
      verse_number: verse.number,
      text_en: verse.text_en,
      text_hd: verse.text_hd,
      text_mm: verse.text_mm,
    });
  };

  const handleRemoveHighlight = (id: number) => {
    Alert.alert(
      'Remove Highlight',
      'Are you sure you want to remove this highlight?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          onPress: () => {
            DatabaseService.getInstance()
              .clearHighlightById(id)
              .then((result: any) => {
                sethighlightModalVisible(false);
                setBottomSheetVisible(false);
                setOptionSheetVisible(false);
                fetchVerses();
                store.dispatch(
                  setToast({
                    show: true,
                    message: 'Highlight removed',
                    type: 'change',
                    duration: constants.toastDuration,
                  }),
                );
              });
          },
        },
      ],
    );
  };

  const handleConfirmHighlight = () => {
    DatabaseService.getInstance()
      .addHighlight(highlightedVerse.verse_id, selectedColor.code)
      .then(() => {
        sethighlightModalVisible(false);
        setBottomSheetVisible(false);
        setOptionSheetVisible(false);
      });
  };

  // const swipeGesture = Gesture.Pan()
  //     .onEnd((event) => {
  //         if (event.translationX > 0) {
  //             console.log('Swiped right!');
  //         } else if (event.translationX < 0) {
  //             console.log('Swiped left!');
  //         }
  //         if (event.translationY > 0) {
  //             console.log('Swiped down!');
  //         } else if (event.translationY < 0) {
  //             console.log('Swiped up!');
  //         }
  //     });

  // const swipeGesture = Gesture.Pan()
  //     .onEnd((event) => {
  //         const { velocityX, translationX, translationY } = event;

  //         // Only handle horizontal swipes, ignore vertical scrolling
  //         if (Math.abs(translationX) > Math.abs(translationY) && Math.abs(translationX) > 50 && Math.abs(velocityX) > 500) {
  //             const currentReaderData = reader.currentRead;
  //             if (translationX < 0) {
  //                 console.log('Swiped left Next Chapter!', route.params);
  //                 console.log('reader', reader);

  //                 DatabaseService.getInstance().getBooksById(currentReaderData.bookId).then((b: any) => {
  //                     console.log('book from getBooksById', b);
  //                     if (b[0].count > currentReaderData.chapterNumber) {
  //                         DatabaseService.getInstance().getChapterIdByBookIdAndChapterNumber(currentReaderData.bookId, currentReaderData.chapterNumber + 1).then((nextChapterId: any) => {
  //                             console.log('nextChapter', nextChapterId);
  //                             navigation.replace('Reader', { book: reader.currentRead.bookName, chapter: currentReaderData.chapterNumber + 1, chapterId: nextChapterId, verse: 1 });
  //                         });
  //                         // navigate to next chapter
  //                         //
  //                     }
  //                 });
  //                 //   onSwipeLeft?.(); // go to next
  //             } else {
  //                 console.log('Swiped right!');
  //                 //   onSwipeRight?.(); // go to previous
  //             }
  //         }
  //     })
  //     .minPointers(1)
  //     .maxPointers(1)
  //     .runOnJS(true) // allows running JS logic in gesture
  //     .activeOffsetX([-10, 10]) // Only activate for horizontal movement
  //     .failOffsetY([-10, 10]); // Fail if vertical movement exceeds threshold

  const handleNextChapter = (autoPlay = false) => {
    const currentReaderData = reader.currentRead;
    if (currentReaderData.maxChapter > currentReaderData.chapterNumber) {
      setTransitionLoading(true);
      store.dispatch(
        setToast({
          show: true,
          message:
            'Next Chapter - ' +
            currentReaderData.bookName +
            ' ' +
            (currentReaderData.chapterNumber + 1),
          type: 'change',
          duration: constants.toastDuration,
        }),
      );
      DatabaseService.getInstance()
        .getChapterIdByBookIdAndChapterNumber(
          currentReaderData.bookId,
          currentReaderData.chapterNumber + 1,
        )
        .then((nextChapterId: any) => {
          const read: CurrentRead = {
            bookName: currentReaderData.bookName,
            bookId: currentReaderData.bookId,
            chapterId: nextChapterId,
            chapterNumber: currentReaderData.chapterNumber + 1,
            verseId: 1,
            verseNumber: 1,
            maxChapter: currentReaderData.maxChapter,
            progress: currentReaderData.progress,
          };
          store.dispatch(setCurrent(read));
          navigation.replace('Reader', {
            book: reader.currentRead.bookName,
            chapter: currentReaderData.chapterNumber + 1,
            chapterId: nextChapterId,
            verse: 1,
            autoPlay: autoPlay, // Pass the flag
          });
        })
        .finally(() => {
          setTransitionLoading(false);
        });
    } else {
      store.dispatch(
        setToast({
          show: true,
          message: 'No More Chapters',
          type: 'change',
          duration: constants.toastDuration,
        }),
      );
    }
  };

  const handlePreviousChapter = () => {
    const currentReaderData = reader.currentRead;
    if (currentReaderData.chapterNumber > 1) {
      store.dispatch(
        setToast({
          show: true,
          message:
            'Previous Chapter - ' +
            currentReaderData.bookName +
            ' ' +
            (currentReaderData.chapterNumber - 1),
          type: 'change',
          duration: constants.toastDuration,
        }),
      );
      DatabaseService.getInstance()
        .getChapterIdByBookIdAndChapterNumber(
          currentReaderData.bookId,
          currentReaderData.chapterNumber - 1,
        )
        .then((previousChapterId: any) => {
          const read: CurrentRead = {
            bookName: currentReaderData.bookName,
            bookId: currentReaderData.bookId,
            chapterId: previousChapterId,
            chapterNumber: currentReaderData.chapterNumber - 1,
            verseId: 1,
            verseNumber: 1,
            maxChapter: currentReaderData.maxChapter,
            progress: currentReaderData.progress,
          };
          store.dispatch(setCurrent(read));
          navigation.replace('Reader', {
            book: reader.currentRead.bookName,
            chapter: currentReaderData.chapterNumber - 1,
            chapterId: previousChapterId,
            verse: 1,
          });
        });
    }
  };

  const onChangeDividerMode = (mode: any) => {
    setDividerMode(mode);
  };

  /*
  // OLD FLOW - Blocked to use new API download flow
  const playPsalmAudio = async () => {
    console.log('playPsalmAudio', params.book);

    if (
      params.book == 'Psalms' &&
      (params.chapter == 23 || params.chapter == 24)
    ) {
      setPlayerSheetVisible(true);
      try {
        if (
          reader.audioPlayer.error &&
          reader.audioPlayer.error.includes('not available')
        ) {
          console.log(
            ' [AUDIO] Audio player not available, skipping audio playback',
          );
          return;
        }
        if (params.chapter == 23) {
          await playPsalm23();
        } else {
          await playPsalm24();
        }
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    } else {
      store.dispatch(
        setToast({
          show: true,
          message: 'Audio Reader is not available for this book',
          type: 'change',
          duration: constants.toastDuration,
        }),
      );
    }
  };
  */

  // const playPsalm24Audio = async () => {
  //     try {
  //         if (error && error.includes('not available')) {
  //             console.log('[AUDIO] Audio player not available, skipping audio playback');
  //             return;
  //         }

  //         await playPsalm24();

  //     } catch (error) {
  //         console.error('Error playing audio:', error);
  //     }
  // };

  const handlePlayPause = async () => {
    if (isPlaying) {
      pause();
    } else {
      if (currentTime == 0) {
        await play();
      } else {
        resume();
      }
    }
  };

  const handleStop = () => {
    stop();
  };

  const handleSeek = (value: number) => {
    console.log('handleSeek', value, duration);
    const newTime = value * duration;
    seekTo(newTime);
  };

  const handleVerseClick = async (verse: any) => {
    if (selectedVerse?.id === verse?.id) {
      setSelectedVerse(null);
    } else {
      setSelectedVerse(verse);
    }
    if (verse.audio_from) {
      if (!playerSheetVisible) {
        await handleAudioReaderPress();
      }
      let seekValue = 0;
      const rawFrom = verse.audio_from;

      if (typeof rawFrom === 'string' && rawFrom.includes(':')) {
        const [min, sec] = rawFrom.split(':').map(Number);
        seekValue = min * 60 + sec;
      } else {
        seekValue = Number(rawFrom);
        if (seekValue > 10000) {
          seekValue = seekValue / 1000;
        }
      }
      if (duration > 0) {
        const normalizedValue = seekValue / duration;
        handleSeek(normalizedValue);
      } else {
        setTimeout(() => {
          const currentDuration = store.getState().reader.audioPlayer.duration;
          if (currentDuration > 0) {
            handleSeek(seekValue / currentDuration);
          }
        }, 500);
      }
    }
  };

  const handleCopytoClickboard = (index: number) => {
    if (selectedVerse) {
      let text = '';
      if (index == 0) {
        text = selectedVerse.text_hd;
      } else if (index == 1) {
        text = selectedVerse.text_en;
      } else if (index == 2) {
        text = selectedVerse.text_mm;
      } else if (index == 3) {
        text =
          selectedVerse.text_hd +
          '\n\n' +
          selectedVerse['text_' + (device.language === 'hodlo' ? 'hd' : device.language)];
      } else {
        text = selectedVerse['text_' + (device.language === 'hodlo' ? 'hd' : device.language)];
      }
      Clipboard.setString(text || '');
    }
    store.dispatch(
      setToast({
        show: true,
        message: `${index == 3
          ? 'Both versions'
          : index == 2
            ? 'Myanmar version'
            : index == 1
              ? 'English version'
              : 'Ho Dlo version'
          } copied to clipboard`,
        type: 'success',
        duration: constants.toastDuration,
      }),
    );
  };

  const handleSharePress = () => {
    setShareModalVisible(true);
  };

  const handleLongPress = (verse: any) => {
    setOptionModalVisible(true);
    setSelectedVerse(verse);
  };

  const handleAudioReaderPress = async () => {
    console.log('[AUDIO] handleAudioReaderPress', chapterMasterId);

    try {
      const audioReader = await DatabaseService.getInstance().getAudioReader(
        chapterMasterId
      );
      console.log('[AUDIO] audioReader', audioReader);

      let localFileExists = false;
      let finalPath = '';

      if (audioReader && audioReader.audio_path) {
        finalPath = fileDownloadService.getDownloadPath(audioReader.audio_path);
        localFileExists = await fileDownloadService.fileExists(
          audioReader.audio_path,
        );
        console.log('[AUDIO] localFileExists', localFileExists);
        if (localFileExists) {
          console.log('[AUDIO] Audio file exists locally. Loading...');
          await audioPlayer.loadAudio(finalPath);
          setPlayerSheetVisible(true);
          handlePlayPause();
        } else {
          downloadAudio();
        }
      } else {
        downloadAudio();
      }
    } catch (err: any) {
      console.error('[AUDIO] Error in handleAudioReaderPress:', err);
      setIsDownloading(false);
      store.dispatch(
        setToast({
          show: true,
          message: err.message || 'Error downloading audio',
          type: 'error',
          duration: 4000,
        }),
      );
    }
  };

  const downloadAudio = async () => {
    setIsDownloading(true);
    setDownloadProgressValue(0);

    store.dispatch(
      setToast({
        show: true,
        message: 'Downloading Bible audio for offline use...',
        type: 'change',
        duration: 3000,
      }),
    );

    const apiResult = await getAudioChapter(params.chapterId);
    console.log('apiResult', apiResult, chapterMasterId);
    if (apiResult.audioUrl) {
      if (apiResult?.verses && apiResult.verses.length > 0) {
        await DatabaseService.getInstance().updateVersesAudioData(apiResult.verses);
        fetchVerses();
      }

      const downloadUrl = apiResult?.audioUrl || apiResult?.url;
      if (!downloadUrl) {
        throw new Error('Audio not available for this chapter');
      }

      let fullDownloadUrl = downloadUrl;
      if (downloadUrl.startsWith('/')) {
        fullDownloadUrl = `https://api.gathengpudlo.com/api${downloadUrl}`;
      }

      const downloadResult = await fileDownloadService.downloadFile(
        fullDownloadUrl,
        `${params.book}_${params.chapter}.m4a`,
        progressData => {
          setDownloadProgressValue(progressData.progress);
          store.dispatch(setDownloadProgress(progressData.progress));
        },
      );
      await DatabaseService.getInstance().updateChapterAudioPath(
        chapterMasterId,
        downloadResult.fileName,
      );

      setIsDownloading(false);

      store.dispatch(
        setToast({
          show: true,
          message: 'Download complete!',
          type: 'success',
          duration: 2000,
        }),
      );

      await audioPlayer.loadAudio(downloadResult.path);
      setPlayerSheetVisible(true);
      handlePlayPause();
    } else {
      setIsDownloading(false);
      store.dispatch(
        setToast({
          show: true,
          message: 'Audio not available for this chapter',
          type: 'error',
          duration: 2000,
        }),
      );
    }
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <StatusBar
        backgroundColor={
          constants.theme[reader.readerSetting.theme - 1].backgroundColor
        }
        barStyle={
          constants.theme[reader.readerSetting.theme - 1].fontColor ===
            '#000000'
            ? 'dark-content'
            : 'light-content'
        }
        showHideTransition="fade"
        animated={true}
        translucent={true}
      />
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              constants.theme[reader.readerSetting.theme - 1].backgroundColor,
          },
        ]}>
        <ReaderHeader
          title={params.book + ' ' + params.chapter}
          backButton={true}
          onTitlePress={() => { }}
          dividerMode={dividerMode}
          selectedVerse={selectedVerse}
          setDividerMode={onChangeDividerMode}
          onSettingsPress={() => {
            setBottomSheetVisible(true);
          }}
          onAudioReaderPress={() => {
            handleAudioReaderPress();
          }}
          onAddHighlightPress={() => {
            if (selectedVerse) {
              handleCreateHighlight(selectedVerse);
            }
          }}
          onRemoveHighlightPress={() => {
            if (selectedVerse) {
              handleRemoveHighlight(selectedVerse.id);
            }
          }}
          onAddBookmarkPress={() => {
            if (selectedVerse) {
              handleCreateBookmark(selectedVerse);
            }
          }}
          onRemoveBookmarkPress={() => {
            if (selectedVerse) {
              handleRemoveBookmark(selectedVerse.id);
            }
          }}
          onCopytoClickboard={(index: number) => handleCopytoClickboard(index)}
          onSharePress={() => handleSharePress()}
        />

        <View style={[styles.contentContainer]}>
          {verses && (
            <View style={{ flex: 1, zIndex: 1 }}>
              <SplitReaderView
                verses={verses}
                // onStartBookmark={() => {}}
                // onRemoveBookmark={() => {}}
                onNextChapter={handleNextChapter}
                onPreviousChapter={handlePreviousChapter}
                dividerMode={dividerMode}
                onVerseClick={handleVerseClick}
                selectedVerse={selectedVerse}
                onLongPress={handleLongPress}
              />
            </View>
          )}
        </View>
        {playerSheetVisible && (
          <View style={styles.playerSheetContainer} pointerEvents="box-none">
            <View style={styles.playerSheetContent} pointerEvents="box-none">
              <View style={styles.highlightModalHeader} pointerEvents="auto">
                <TouchableOpacity
                  onPress={() => {
                    setPlayerSheetVisible(false);
                    handleStop();
                  }}>
                  <CloseIcon name="cross" color={AppColors.appTextBlack} />
                </TouchableOpacity>
              </View>

              <View style={styles.playerContainer} pointerEvents="auto">
                <View style={styles.playerControls}>
                  <TouchableOpacity
                    style={[
                      styles.playButton,
                      isPlaying && styles.playingButton,
                    ]}
                    onPress={handlePlayPause}
                    disabled={isLoading}>
                    {isLoading ? (
                      <FontAwesome6
                        name="spinner"
                        iconStyle="solid"
                        color={AppColors.appTextWhite}
                        size={18}
                      />
                    ) : (
                      <FontAwesome6
                        name={isPlaying ? 'pause' : 'play'}
                        iconStyle="solid"
                        color={AppColors.appTextWhite}
                        size={18}
                      />
                    )}
                  </TouchableOpacity>

                  <View style={styles.progressContainer}>
                    <Slider
                      style={styles.progressBar}
                      minimumValue={0}
                      maximumValue={1}
                      value={progress}
                      onValueChange={handleSeek}
                      minimumTrackTintColor={AppColors.primary}
                      maximumTrackTintColor={AppColors.appTextGrey}
                      thumbTintColor={AppColors.primary}
                    />
                    <View style={styles.timeContainer}>
                      <Text style={styles.timeText}>{formattedTime}</Text>
                      <Text style={styles.timeText}>{formattedDuration}</Text>
                    </View>
                  </View>
                </View>

                {error && (
                  <Text style={styles.errorText}>
                    {error.includes('not available')
                      ? 'Audio player not available'
                      : `Audio Error: ${error}`}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
        <BottomSheet
          visible={optionSheetVisible}
          onClose={() => {
            setOptionSheetVisible(false);
          }}
          sheetHeight={250}
          closeButton={false}>
          <View>
            <View style={styles.contentsArea} />
            <TouchableOpacity
              style={styles.optionContainer}
              onPress={() => {
                setBottomSheetVisible(true);
              }}>
              <Text style={styles.optionTitle}>Reader Setting</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionContainer}
              onPress={() => {
                setBottomSheetVisible(true);
              }}>
              <Text style={styles.optionTitle}>Start Bookmark</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionContainer}
              onPress={() => {
                setBottomSheetVisible(true);
              }}>
              <Text style={styles.optionTitle}>Audio Reader</Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>
        <BottomSheet
          visible={bottomSheetVisible}
          onClose={() => {
            setBottomSheetVisible(false);
          }}
          sheetHeight={500}>
          <ReaderSetting />
        </BottomSheet>
        <Modal
          transparent
          visible={highlightModalVisible}
          animationType="fade"
          statusBarTranslucent={true}>
          <View style={styles.highlightModalContainer}>
            <View style={styles.highlightModalContentContainer}>
              <View style={styles.highlightModalHeader}>
                <TouchableOpacity
                  onPress={() => sethighlightModalVisible(false)}>
                  <CloseIcon name="cross" color={AppColors.appTextBlack} />
                </TouchableOpacity>
              </View>
              <View style={styles.highlightModalContent}>
                <Text style={styles.highlightModalContentTitle}>
                  {highlightedVerse.book_name +
                    ' ' +
                    highlightedVerse.chapter_no +
                    ':' +
                    highlightedVerse.verse_number}
                </Text>
                <Text style={styles.highlightModalContentItemText}>
                  {highlightedVerse.text_hd}
                </Text>
                <ColorPicker
                  selectedColor={selectedColor.hex}
                  style={styles.colorPicker}
                  onSelect={color => setSelectedColor(color)}
                />
              </View>
              <View style={styles.highlightModalFooter}>
                <TouchableOpacity
                  style={styles.highlightModalCancelButton}
                  onPress={() => sethighlightModalVisible(false)}>
                  <Text style={styles.highlightModalFooterButtonText}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.highlightModalOKButton}
                  onPress={handleConfirmHighlight}>
                  <Text style={styles.highlightModalFooterButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          transparent
          visible={bookmarkModalVisible}
          animationType="fade"
          statusBarTranslucent={true}>
          <View style={styles.highlightModalContainer}>
            <View style={styles.highlightModalContentContainer}>
              <View style={styles.highlightModalHeader}>
                <TouchableOpacity
                  onPress={() => setBookmarkModalVisible(false)}>
                  <CloseIcon name="cross" color={AppColors.appTextBlack} />
                </TouchableOpacity>
              </View>
              <View style={styles.highlightModalContent}>
                <Text style={styles.highlightModalContentTitle}>
                  {bookmarkedVerse.book_name +
                    ' ' +
                    bookmarkedVerse.chapter_no +
                    ':' +
                    bookmarkedVerse.verse_number}
                </Text>
                <Text style={styles.highlightModalContentItemText}>
                  {bookmarkedVerse.text_hd}
                </Text>
                <Text style={styles.bookmarkNoteTitle}>Note</Text>
                <TextInput
                  placeholder="Enter bookmark note"
                  value={bookmarkNote}
                  onChangeText={setBookmarkNote}
                  numberOfLines={4}
                  multiline={true}
                  style={styles.bookmarkNoteInput}
                />
              </View>
              <View style={styles.highlightModalFooter}>
                <TouchableOpacity
                  style={styles.highlightModalCancelButton}
                  onPress={() => setBookmarkModalVisible(false)}>
                  <Text style={styles.highlightModalFooterButtonText}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.highlightModalOKButton}
                  onPress={handleConfirmBookmark}>
                  <Text style={styles.highlightModalFooterButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          transparent
          visible={shareModalVisible}
          animationType="fade"
          statusBarTranslucent={true}
          onRequestClose={() => setShareModalVisible(false)}>
          <ShareModal
            setShareModalVisible={setShareModalVisible}
            selectedVerse={selectedVerse}
            bookName={params.book}
            chapterNumber={params.chapter}
          />
        </Modal>
        <Modal
          transparent
          visible={optionModalVisible}
          animationType="fade"
          statusBarTranslucent={true}
          onRequestClose={() => setOptionModalVisible(false)}>
          <OptionModal
            onHighlightPress={() => {
              setOptionModalVisible(false);
              handleCreateHighlight(selectedVerse);
            }}
            onBookmarkPress={() => {
              setOptionModalVisible(false);
              handleCreateBookmark(selectedVerse);
            }}
            setOptionModalVisible={setOptionModalVisible}
          />
        </Modal>

        {/* Download Progress Overlay */}
        {isDownloading && (
          <View style={styles.downloadOverlay}>
            <View style={styles.downloadProgressCard}>
              <Text style={styles.downloadTitle}>Downloading Chapter Audio</Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${downloadProgressValue * 100}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressPercent}>
                {Math.round(downloadProgressValue * 100)}%
              </Text>
              <Text style={styles.downloadSubtext}>
                Saving for offline playback...
              </Text>
            </View>
          </View>
        )}
        <CustomLoading visible={transitionLoading} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'white',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    // paddingTop: 55,
  },
  contentContainer: {
    flex: 1,
    // backgroundColor: 'blue',
    width: '100%',
    zIndex: 1,
    // height: '100%',
    // paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  optionContainer: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.lightGrey,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  optionTitle: {
    fontSize: 16,
    color: AppColors.appTextBlack,
  },
  contentsArea: {
    width: 35,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppColors.lightGrey,
    position: 'absolute',
    top: -10,
    left: '50%',
    transform: [{ translateX: -17.5 }],
  },
  highlightModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000080',
  },
  highlightModalContentContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  highlightModalHeader: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    paddingHorizontal: 10,
  },
  highlightModalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: AppColors.appTextBlack,
  },
  highlightModalCloseButton: {
    fontSize: 16,
    color: AppColors.appTextBlack,
  },
  highlightModalContent: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    // backgroundColor: 'red'//AppColors.appTextWhite,
  },
  highlightModalContentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.appTextBlack,
    marginBottom: 13,
  },
  highlightModalContentList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightModalContentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 10,
  },
  highlightModalFooter: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',

    // padding: 10,
  },
  highlightModalOKButton: {
    backgroundColor: AppColors.primaryDark,
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightModalCancelButton: {
    backgroundColor: AppColors.lightGrey,
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightModalFooterButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  highlightModalContentItemText: {
    fontSize: 16,
    color: AppColors.appTextBlack,
    marginBottom: 35,
  },
  colorPicker: {
    marginBottom: 25,
  },
  playerContainer: {
    padding: 16,
  },
  playerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  controlButton: {
    padding: 10,
    backgroundColor: AppColors.primaryDark,
    borderRadius: 5,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonText: {
    color: AppColors.appTextBlack,
    fontSize: 14,
  },
  playButton: {
    // padding: 15,
    backgroundColor: AppColors.primaryDark,
    borderRadius: 30,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playingButton: {
    backgroundColor: AppColors.primary,
  },
  playButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Pretendard-Regular',
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 10,
  },
  progressBar: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 5,
  },
  timeText: {
    color: AppColors.appTextBlack,
    fontSize: 12,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeLabel: {
    color: AppColors.appTextBlack,
    fontSize: 14,
    width: 60,
  },
  volumeSlider: {
    flex: 1,
  },
  verseNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.primaryTint,
    marginTop: 2,
  },
  verseText: {
    fontSize: 16,
    color: AppColors.appTextBlack,
    lineHeight: 27,
  },
  audioVerseContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: AppColors.lightGrey,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    minHeight: 130,
  },
  audioVerseContent: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  playerSheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: 120,
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  playerSheetContent: {
    backgroundColor: 'white',
    height: 120,
    paddingTop: 0,
    borderColor: AppColors.lightGrey,
    borderWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookmarkNoteTitle: {
    fontSize: 16,
    color: AppColors.appTextBlack,
    marginBottom: 5,
  },
  bookmarkNoteInput: {
    borderWidth: 1,
    borderColor: AppColors.lightGrey,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    width: '100%',
    height: 100,
    textAlignVertical: 'top',
  },
  downloadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadProgressCard: {
    backgroundColor: 'white',
    width: '80%',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  downloadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.appTextBlack,
    marginBottom: 16,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    backgroundColor: AppColors.lightGrey,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: AppColors.primary,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: AppColors.primaryDark,
    marginBottom: 8,
  },
  downloadSubtext: {
    fontSize: 12,
    color: AppColors.darkGrey,
  },
});

export default Reader;
