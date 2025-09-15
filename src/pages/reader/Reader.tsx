import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import Slider from '@react-native-community/slider';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Modal, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

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
    const [fontSize, setFontSize] = useState(0.5);
    const [verses, setVerses] = useState();
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
        // console.log('verses from Reader 2', verses, route.params.chapter);
        fetchVerses();
    }, []);

    // useEffect(() => {
    //     console.log('After verses has data', verses);
    // }, []);

    const fetchVerses = () => {
        // console.log('fetchVerses', route.params.chapter);
        DatabaseService.getInstance().getVersesByChapterId(route.params.chapterId).then((v: any) => {
            // console.log('verses from fetchVerses', v.length);
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
                onAudioReaderPress={() => { setBottomSheetVisible(true) }}/>

                <View style={[styles.contentContainer]}>
                    {
                        verses && <View style={{ flex: 1 }}>
                            <SplitReaderView verses={verses} onStartBookmark={handleCreateBookmark} onNextChapter={handleNextChapter} onPreviousChapter={handlePreviousChapter} dividerMode={dividerMode}/>
                        </View>
                    }
                </View>
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
        height: '100%',
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
});

export default Reader;