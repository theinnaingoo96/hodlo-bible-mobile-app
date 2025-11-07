import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import Slider from '@react-native-community/slider';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Modal, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { testAudioLoading } from '../../utils/audioDebug';
import SoundPlayer from 'react-native-sound-player';

import ReaderHeader from '../../components/ReaderHeader';
import DatabaseService from '../../services/DataService';
import CloseIcon from '../../components/icons/CloseIcon';
import BottomSheet from '../../components/BottomSheet';
import ColorPicker from '../../components/ColorPicker';
import { AppColors } from '../../constants/Color';
import SplitReaderView from './View';
import { store } from '../../store/store';
import { setToast } from '../../store/slices/deviceSlice';
import { constants } from '../../constants/Data';
import { CurrentRead } from '../../types/reader';
import { setCurrent } from '../../store/slices/readerSlice';
import ReaderSetting from '../../components/ReaderSetting';

const Reader = ({ navigation, route }: any) => {
    const device = useSelector((state: any) => state.device);
    const reader = useSelector((state: any) => state.reader);
    const params = route.params;
    const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
    const [optionSheetVisible, setOptionSheetVisible] = useState(false);
    const [playerSheetVisible, setPlayerSheetVisible] = useState(false);
    const [fontSize, setFontSize] = useState(0.5);
    const [verses, setVerses] = useState();

    // Audio player hook
    const {
        isPlaying,
        isPaused,
        isStopped,
        duration,
        currentTime,
        volume,
        isLoading,
        error,
        play,
        pause,
        resume,
        stop,
        seekTo,
        setVolume,
        playPsalm23,
        playPsalm101,
        playPsalm102,
        playPsalm103,
        playPsalm104,
        playPsalm105,
        playPsalm106,
        progress,
        formattedTime,
        formattedDuration,
    } = useAudioPlayer();
    const [bookmarkModalVisible, setBookmarkModalVisible] = useState(false);
    const [bookmarkedVerse, setBookmarkedVerse] = useState({
        book_name: "",
        chapter_no: "",
        chapter_id: "",
        verse_id: "",
        verse_number: "",
        text_en: "",
        text_hd: "",
        text_mm: ""
    })
    const [dividerMode, setDividerMode] = useState('horizontal'); // horizontal or vertical
    const [selectedColor, setSelectedColor] = useState({ name: 'Red', hex: 'rgba(255, 59, 48, 0.7)', code: 'rgba(244, 67, 54, 0.2)' });
    const [currentVerse, setCurrentVerse] = useState(101)

    // Monitor currentTime updates
    // useEffect(() => {
    //     if (currentTime > 0) {
    //         console.log('currentTime updated:', currentTime, 'formattedTime:', formattedTime);
    //     }
    // }, [currentTime, formattedTime]);

    useEffect(() => {
        // console.log('verses from Reader 1', params);
        if (route.params.chapter) {
            fetchVerses();
        }
        Dimensions.addEventListener('change', ({ window: { width, height } }) => {
            if (width < height) {
                console.log("PORTRAIT")
            } else {
                console.log("LANDSCAPE")
            }
        })
    }, []);


    useEffect(() => {
        console.log('verses from Reader 2', verses, route.params);
        fetchVerses();
        SoundPlayer.addEventListener('FinishedPlaying', (data) => {
            console.log('FinishedPlaying', data);
            setCurrentVerse(currentVerse + 1);
            // setTimeout(() => {
            //     playPsalm23Audio()
            // }, 100);
        });
    }, []);

    // useEffect(() => {
    //     console.log('After verses has data', verses);
    // }, []);

    const fetchVerses = () => {
        // console.log('fetchVerses', route.params.chapter);
        DatabaseService.getInstance().getVersesByChapterId(route.params.chapterId).then((v: any) => {
            console.log('verses from fetchVerses', v);
            let temp_verses = v;
            DatabaseService.getInstance().getBookmarks().then(async (b: any) => {
                // console.log('bookmarks from fetchVerses', b);
                const temp_bookmarks = b;
                await temp_bookmarks.forEach((bookmark: any) => {
                    const index = temp_verses.findIndex((v: any) => v.id === bookmark.verse_id);
                    if (index !== -1) {
                        temp_verses[index].bookmark = true;
                        temp_verses[index].bookmark_color = bookmark.color;
                    }
                });
                if (temp_verses.length > 0) {
                    setVerses(temp_verses);
                }
                // console.log('verses from fetchVerses after', temp_verses);
            });
        });
    }

    const handleCreateBookmark = (verse: any) => {
        // console.log(verse);
        setBookmarkModalVisible(true);
        setBookmarkedVerse({
            book_name: params.book,
            chapter_no: params.chapter,
            chapter_id: verse.chapter_id,
            verse_id: verse.id,
            verse_number: verse.number,
            text_en: verse.text_en,
            text_hd: verse.text_hd,
            text_mm: verse.text_mm
        })
    };

    const handleConfirmBookmark = () => {
        DatabaseService.getInstance().addBookmark(bookmarkedVerse.verse_id, selectedColor.code).then(() => {
            setBookmarkModalVisible(false);
            setBottomSheetVisible(false);
            setOptionSheetVisible(false);
        })
    }

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

    const handleNextChapter = () => {
        const currentReaderData = reader.currentRead;
        // console.log('handleNextChapter', currentReaderData);
        if (currentReaderData.maxChapter > currentReaderData.chapterNumber) {
            store.dispatch(setToast({ show: true, message: 'Next Chapter - ' + currentReaderData.bookName + ' ' + (currentReaderData.chapterNumber + 1), type: 'change', duration: constants.toastDuration }));
            DatabaseService.getInstance().getChapterIdByBookIdAndChapterNumber(currentReaderData.bookId, currentReaderData.chapterNumber + 1).then((nextChapterId: any) => {
                // console.log('nextChapter', nextChapterId);
                const read: CurrentRead = {
                    bookName: currentReaderData.bookName,
                    bookId: currentReaderData.bookId,
                    chapterId: nextChapterId,
                    chapterNumber: currentReaderData.chapterNumber + 1,
                    verseId: 1,
                    verseNumber: 1,
                    maxChapter: currentReaderData.maxChapter,
                };
                store.dispatch(setCurrent(read));
                navigation.replace('Reader', { book: reader.currentRead.bookName, chapter: currentReaderData.chapterNumber + 1, chapterId: nextChapterId, verse: 1 });
            });
        } else {
            store.dispatch(setToast({ show: true, message: 'No More Chapters', type: 'change', duration: constants.toastDuration }));
        }
    }

    const handlePreviousChapter = () => {
        const currentReaderData = reader.currentRead;
        // console.log('handlePreviousChapter', currentReaderData);
        // console.log('navigation', navigation);

        if (currentReaderData.chapterNumber > 1) {
            store.dispatch(setToast({ show: true, message: 'Previous Chapter - ' + currentReaderData.bookName + ' ' + (currentReaderData.chapterNumber - 1), type: 'change', duration: constants.toastDuration }));
            DatabaseService.getInstance().getChapterIdByBookIdAndChapterNumber(currentReaderData.bookId, currentReaderData.chapterNumber - 1).then((previousChapterId: any) => {
                // console.log('previousChapter', previousChapterId);
                const read: CurrentRead = {
                    bookName: currentReaderData.bookName,
                    bookId: currentReaderData.bookId,
                    chapterId: previousChapterId,
                    chapterNumber: currentReaderData.chapterNumber - 1,
                    verseId: 1,
                    verseNumber: 1,
                    maxChapter: currentReaderData.maxChapter,
                };
                store.dispatch(setCurrent(read));
                navigation.replace('Reader', { book: reader.currentRead.bookName, chapter: currentReaderData.chapterNumber - 1, chapterId: previousChapterId, verse: 1 });
            });
        }
    }

    const onChangeDividerMode = (mode: any) => {
        // console.log('onChangeDividerMode', mode);
        setDividerMode(mode);
    }

    // Test audio loading
    const testAudio = async () => {
        console.log('Testing audio loading...');
        const result = await testAudioLoading();
        console.log('Audio test result:', result);
    };

    // Audio control functions
    const playAudio = async () => {
        try {
            // Check if audio player is available
            if (error && error.includes('not available')) {
                console.log('[AUDIO] Audio player not available, skipping audio playback');
                return;
            }
            // await playPsalm101();

            // First test audio loading
            // await testAudio();
            console.log('currentVerse', currentVerse);
            // Determine which Psalm to play based on current chapter
            const chapterNumber = currentVerse;
            switch (chapterNumber) {
                case 101:
                    await playPsalm101();
                    break;
                case 102:
                    await playPsalm102();
                    break;
                case 103:
                    await playPsalm103();
                    break;
                case 104:
                    await playPsalm104();
                    break;
                case 105:
                    await playPsalm105();
                    break;
                case 106:
                    await playPsalm106();
                    break;
                default:
                    // Default to Psalm 101 if chapter doesn't match
                    await playPsalm101();
            }
            // setCurrentVerse(chapterNumber);
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    };

    const playPsalm23Audio = async () => {
        try {
            if (error && error.includes('not available')) {
                console.log('[AUDIO] Audio player not available, skipping audio playback');
                return;
            }

            await playPsalm23();

        } catch (error) {
            console.error('Error playing audio:', error);
        }
    };

    const handlePlayPause = async () => {
        if (isPlaying) {
            pause();
        } else {
            if (currentTime == 0) {
                await playPsalm23();
            } else {
                resume()
            }
        }
    };

    const handleResume = async () => {

    }

    const handleStop = () => {
        stop();
    };

    const handleSeek = (value: number) => {
        console.log('handleSeek', value , duration);
        const newTime = value * duration;
        seekTo(newTime);
    };

    const handleVolumeChange = (value: number) => {
        setVolume(value);
    };

    const handleVerseClick = (verse: any) => {
        pause();
        console.log('handleVerseClick', playerSheetVisible);
        if (playerSheetVisible) {
            // Use the handleSeek function and convert audio_from to number of seconds if necessary
            let seekValue = verse.audio_from;
            if (typeof seekValue === 'string') {
                const [min, sec] = seekValue.split(':').map(Number);
                seekValue = min * 60 + sec;
            }
            // handleSeek expects 0-1 normalized value, so divide by duration (guard against division by zero)
            if (duration > 0) {
                const normalizedValue = seekValue / duration;
                handleSeek(normalizedValue);
            }
        }
    }

    const AudioVerseComponent = ({ verses }: any) => {
        // console.log('AudioVerseComponent', verses);
        // Define time ranges for each verse in the audio (Psalm 23:00)
        // const audio23 = [
        //     { from: '00:00', to: '00:05' }, // Verse 1
        //     { from: '00:05', to: '00:13' }, // Verse 2
        //     { from: '00:13', to: '00:24' }, // Verse 3
        //     { from: '00:24', to: '00:37' }, // Verse 4
        //     { from: '00:37', to: '00:48' }, // Verse 5
        //     { from: '00:48', to: '00:58' }  // Verse 6
        // ];

        // Convert time string (MM:SS) to seconds
        const timeToSeconds = (timeStr: string): number => {
            const [minutes, seconds] = timeStr.split(':').map(Number);
            return minutes * 60 + seconds;
        };

        // Find which verse should be displayed based on currentTime
        const getCurrentVerseIndex = (): number => {
            for (let i = 0; i < verses.length; i++) {
                const fromSeconds = timeToSeconds(verses[i].audio_from);
                const toSeconds = timeToSeconds(verses[i].audio_to);

                if (currentTime >= fromSeconds && currentTime <= toSeconds) {
                    return i;
                }
            }
            return -1; // No verse matches current time
        };

        const currentVerseIndex = getCurrentVerseIndex();

        // Display the verse if we have verses data and found a matching index
        if (!verses || !Array.isArray(verses) || verses.length === 0) {
            return null;
        }

        const verseToDisplay = currentVerseIndex >= 0 && currentVerseIndex < verses.length
            ? verses[currentVerseIndex]
            : null;

        return (
            <View style={styles.audioVerseContainer}>
                {verseToDisplay ? (
                    <View style={styles.audioVerseContent}>
                        <Text style={styles.verseNumber}>{verseToDisplay.number}</Text>
                        <Text style={styles.verseText}>{verseToDisplay.text_hd}</Text>
                    </View>
                ) : ""}
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar
                backgroundColor={constants.theme[reader.readerSetting.theme - 1].backgroundColor}
                barStyle={constants.theme[reader.readerSetting.theme - 1].fontColor === '#000000' ? "dark-content" : "light-content"}
                showHideTransition="fade" animated={true}
            />
            {/* device.theme ? AppColors.appBackgroundGrey : AppColors.appBackgroundDarkTint */}
            <View style={[styles.container, { backgroundColor: constants.theme[reader.readerSetting.theme - 1].backgroundColor }]}>
                <ReaderHeader title={params.book + " " + params.chapter} backButton={true} onTitlePress={() => { }}
                    dividerMode={dividerMode} setDividerMode={onChangeDividerMode} onSettingsPress={() => { setBottomSheetVisible(true) }}
                    onAudioReaderPress={() => { setPlayerSheetVisible(true); playPsalm23Audio() }} />

                <View style={[styles.contentContainer]}>
                    {
                        verses && <View style={{ flex: 1 }}>
                            <SplitReaderView verses={verses} onStartBookmark={handleCreateBookmark} onNextChapter={handleNextChapter} onPreviousChapter={handlePreviousChapter} dividerMode={dividerMode} onVerseClick={handleVerseClick} />
                        </View>
                    }
                </View>
                {
                    playerSheetVisible && (
                        // setPlayerSheetVisible(false); handleStop()

                        // onClose={() => {  }}
                        // sheetHeight={300}
                        // closeButton={false}

                        <View style={styles.playerSheetContainer} pointerEvents="box-none">
                            <View style={styles.playerSheetContent} pointerEvents="auto">
                                <View style={styles.bookmarkModalHeader}>
                                    <TouchableOpacity onPress={() => {setPlayerSheetVisible(false); handleStop()}}>
                                        <CloseIcon name="cross" color={AppColors.appTextBlack} />
                                    </TouchableOpacity>
                                </View>
                                <AudioVerseComponent verses={verses} />
                                <View style={styles.playerContainer}>
                                <View style={styles.playerControls}>
                                    <TouchableOpacity style={styles.controlButton} onPress={handleStop}>
                                        <FontAwesome6 name="backward-step" iconStyle="solid" color={AppColors.appTextWhite} size={18} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.playButton, isPlaying && styles.playingButton]}
                                        onPress={handlePlayPause}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <FontAwesome6 name="spinner" iconStyle="solid" color={AppColors.appTextWhite} size={18} />
                                        ) : (
                                            <FontAwesome6
                                                name={isPlaying ? "pause" : "play"}
                                                iconStyle="solid"
                                                color={AppColors.appTextWhite}
                                                size={18}
                                            />
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.controlButton} onPress={handleStop}>
                                        <FontAwesome6 name="forward-step" iconStyle="solid" color={AppColors.appTextWhite} size={18} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.progressContainer}>
                                    <Text style={styles.timeText}>{formattedTime}</Text>
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
                                    <Text style={styles.timeText}>{formattedDuration}</Text>
                                </View>

                                {error && (
                                    <Text style={styles.errorText}>
                                        {error.includes('not available')
                                            ? 'Audio player not available'
                                            : `Audio Error: ${error}`
                                        }
                                    </Text>
                                )}

                                {/* <View style={styles.volumeContainer}>
                                <Text style={styles.volumeLabel}>Volume</Text>
                                <Slider
                                    style={styles.volumeSlider}
                                    minimumValue={0}
                                    maximumValue={1}
                                    value={0.5}
                                    minimumTrackTintColor="#000"
                                    maximumTrackTintColor="#ddd"
                                    thumbTintColor="#000"
                                />
                            </View> */}
                                </View>
                            </View>
                        </View>
                    )
                }
                <BottomSheet visible={optionSheetVisible}
                    onClose={() => { setOptionSheetVisible(false) }}
                    sheetHeight={250}
                    closeButton={false}
                >
                    <View>
                        <View style={styles.contentsArea} />
                        <TouchableOpacity style={styles.optionContainer} onPress={() => { setBottomSheetVisible(true) }}>
                            <Text style={styles.optionTitle}>Reader Setting</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.optionContainer} onPress={() => { setBottomSheetVisible(true) }}>
                            <Text style={styles.optionTitle}>Start Bookmark</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.optionContainer} onPress={() => { setBottomSheetVisible(true) }}>
                            <Text style={styles.optionTitle}>Audio Reader</Text>
                        </TouchableOpacity>
                    </View>
                </BottomSheet>
                <BottomSheet visible={bottomSheetVisible} onClose={() => { setBottomSheetVisible(false) }} sheetHeight={500}>
                    <ReaderSetting />
                </BottomSheet>
                <Modal transparent visible={bookmarkModalVisible} animationType="fade">
                    <View style={styles.bookmarkModalContainer}>
                        <View style={styles.bookmarkModalContentContainer}>
                            <View style={styles.bookmarkModalHeader}>
                                <TouchableOpacity onPress={() => setBookmarkModalVisible(false)}>
                                    <CloseIcon name="cross" color={AppColors.appTextBlack} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.bookmarkModalContent}>
                                <Text style={styles.bookmarkModalContentTitle}>{bookmarkedVerse.book_name + " " + bookmarkedVerse.chapter_no + ":" + bookmarkedVerse.verse_number}</Text>
                                <Text style={styles.bookmarkModalContentItemText}>
                                    {bookmarkedVerse.text_hd}
                                </Text>
                                <ColorPicker
                                    selectedColor={selectedColor.hex}
                                    style={styles.colorPicker}
                                    onSelect={(color) => setSelectedColor(color)} />
                                {/* <View style={styles.bookmarkModalContentList}>
                                    <TouchableOpacity style={styles.bookmarkModalContentItem}>
                                        <Text style={styles.bookmarkModalContentItemText}>Bookmark 1</Text>
                                    </TouchableOpacity>
                                </View> */}
                            </View>
                            <View style={styles.bookmarkModalFooter}>
                                <TouchableOpacity style={styles.bookmarkModalCancelButton} onPress={() => setBookmarkModalVisible(false)}>
                                    <Text style={styles.bookmarkModalFooterButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.bookmarkModalOKButton} onPress={handleConfirmBookmark}>
                                    <Text style={styles.bookmarkModalFooterButtonText}>OK</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
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
        color: AppColors.appTextBlack
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
    bookmarkModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000080',
    },
    bookmarkModalContentContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '90%'
    },
    bookmarkModalHeader: {
        flexDirection: 'row',
        // justifyContent: 'space-between',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '100%',
        padding: 10,
    },
    bookmarkModalTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: AppColors.appTextBlack,
    },
    bookmarkModalCloseButton: {
        fontSize: 16,
        color: AppColors.appTextBlack,
    },
    bookmarkModalContent: {
        // flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        // backgroundColor: 'red'//AppColors.appTextWhite,
    },
    bookmarkModalContentTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: AppColors.appTextBlack,
        marginBottom: 13
    },
    bookmarkModalContentList: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookmarkModalContentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: 10,
    },
    bookmarkModalFooter: {
        flexDirection: 'row',
        gap: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',

        // padding: 10,
    },
    bookmarkModalOKButton: {
        backgroundColor: AppColors.primaryDark,
        padding: 10,
        borderRadius: 5,
        width: '45%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookmarkModalCancelButton: {
        backgroundColor: AppColors.lightGrey,
        padding: 10,
        borderRadius: 5,
        width: '45%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookmarkModalFooterButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bookmarkModalContentItemText: {
        fontSize: 16,
        color: AppColors.appTextBlack,
        marginBottom: 35
    },
    colorPicker: {
        marginBottom: 25
    }
    ,
    playerContainer: {
        padding: 16
    },
    playerControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    controlButton: {
        padding: 10,
        backgroundColor: AppColors.primaryDark,
        borderRadius: 5,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    controlButtonText: {
        color: AppColors.appTextBlack,
        fontSize: 14
    },
    playButton: {
        // padding: 15,
        backgroundColor: AppColors.primaryDark,
        borderRadius: 30,
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    playingButton: {
        backgroundColor: AppColors.primary,
    },
    playButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    errorText: {
        color: '#ff4444',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
        fontFamily: 'Pretendard-Regular',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20
    },
    progressBar: {
        flex: 1,
        marginHorizontal: 10
    },
    timeText: {
        color: AppColors.appTextBlack,
        fontSize: 12
    },
    volumeContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    volumeLabel: {
        color: AppColors.appTextBlack,
        fontSize: 14,
        width: 60
    },
    volumeSlider: {
        flex: 1
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
        flexDirection: 'row'
    },
    playerSheetContainer: {
        // position: 'absolute',
        // bottom: 0,
        // left: 0,
        // right: 0,
        // zIndex: 1000,
    },
    playerSheetContent: {
        backgroundColor: 'white',
        height: 320,
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
    }
});

export default Reader;