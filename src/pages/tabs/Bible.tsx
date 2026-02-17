import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';

import ChevonDownIcon from '../../components/icons/ChevonDownIcon';
import ChevonUpIcon from '../../components/icons/ChevonUpIcon';
import { setCurrent } from '../../store/slices/readerSlice';
import DatabaseService from '../../services/DataService';
import { useDispatch, useSelector } from 'react-redux';
import { AppColors } from '../../constants/Color';
import { CurrentRead } from '../../types/reader';

const Bible = ({ navigation }: any) => {
    const dispatch = useDispatch();
    const reader = useSelector((state: any) => state.reader);
    const device = useSelector((state: any) => state.device);
    const [activeTab, setActiveTab] = useState<'old' | 'new'>('old');
    const [verses, setVerses] = useState<any[]>([]);
    const [selectedBook, setSelectedBook] = useState('');
    const [selectedBookObj, setSelectedBookObj] = useState<any>(null);
    const [selectedChapter, setSelectedChapter] = useState(1);
    const [bookList, setBookList] = useState<any[]>([]);
    const [chapterList, setChapterList] = useState<any[]>([]);
    const [oldTestamentBooks, setOldTestamentBooks] = useState<any[]>([]);
    const [newTestamentBooks, setNewTestamentBooks] = useState<any[]>([]);

    useEffect(() => {
        // console.log('Bible useEffect');
        loadBooks();
    }, []);

    const loadBooks = async () => {
        try {
            DatabaseService.getInstance().getAllBooks().then((result: any) => {
                setBookList(result || []);
                setOldTestamentBooks(result.filter((book: any) => book.testament === 'OT'));
                setNewTestamentBooks(result.filter((book: any) => book.testament === 'NT'));
            });
        } catch (error) {
            console.error('Error loading books:', error);
        }
    };

    const handleChapterPress = (book: any, chapter: any) => {  
        // console.log('handleChapterPress', book, chapter);
        const currentReaderData = reader.currentRead;
        const readerData: CurrentRead = {       
            bookName: book.name,
            bookId: book.id,
            chapterId: chapter.id,
            chapterNumber: chapter.number,
            verseId: 1,
            verseNumber: 1,
            maxChapter: book.count,
            progress: currentReaderData.progress
        };
        // console.log('handleChapterPress', readerData);
        dispatch(setCurrent(readerData));
        navigation.navigate('Reader', { book: book.name, chapter: chapter.number, chapterId: chapter.id, verse: 1 });
    };

    const loadChapters = async (book: any, bookId: any) => {
        // console.log('loadChapters', book, bookId, selectedBookObj?.id);
        if ( selectedBook === book.name) {
            setChapterList([]);
            setSelectedBook('');
            setSelectedBookObj(null);
            return;
        }
        setSelectedBook(book.name);
        setSelectedBookObj(book);
        try {
            DatabaseService.getInstance().getChaptersByBookId(book.id).then((result: any) => {
                // console.log('result >', result);
                setChapterList(result || []);
            });
        } catch (error) {
            console.error('Error loading chapters:', error);
        }
    };

    const renderNotChapter = ({ item }: { item: any }) => (
        <View style={styles.chapterContainer}>
            <Text style={styles.chapterTitle}>Chapter {item.chapter}: {item.chapter_title}</Text>
            {item.verses.map((verse: any, index: number) => (
                <View key={index} style={styles.verseContainer}>
                    <Text style={styles.verseNumber}>{verse.verse}</Text>
                    <View style={styles.verseTextContainer}>
                        <Text style={styles.verseText}>{verse.text_en}</Text>
                        <Text style={styles.verseTextMM}>{verse.text_mm}</Text>
                    </View>
                </View>
            ))}
        </View>
    );

    const renderChapter = ({ item }: { item: any }) => (
        <View style={styles.chpContainer}>
            <Text style={styles.chpTitle}>{item.chapter}</Text>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={[styles.container, { backgroundColor: device.theme ? AppColors.appBackgroundGrey : AppColors.appBackgroundDarkTint }]}>
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'old' && styles.activeTab]}
                        onPress={() => {
                            setActiveTab('old');
                            setSelectedBook('');
                            setSelectedBookObj(null);
                        }}
                    >
                        <Text style={device.theme ? activeTab === 'old' ? styles.activeTabText : styles.tabText : activeTab === 'old' ? styles.activeTabTextDark : styles.tabTextDark}>
                            Old Testament
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'new' && styles.activeTab]}
                        onPress={() => {
                            setActiveTab('new');
                            setSelectedBook('');
                            setSelectedBookObj(null);
                        }}
                    >
                        <Text style={device.theme ? activeTab === 'new' ? styles.activeTabText : styles.tabText : activeTab === 'new' ? styles.activeTabTextDark : styles.tabTextDark}>
                            New Testament
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal={false} style={[styles.bookScrollView, { backgroundColor: device.theme ? AppColors.appBackgroundGrey : AppColors.appBackgroundDarkTint }]}>
                    {bookList && bookList.length > 0 && (activeTab === 'old' ? oldTestamentBooks : newTestamentBooks).map((book: any, index: number) => (
                        <View key={index + 'book'}>
                            <TouchableOpacity
                                style={[styles.bookButton, selectedBook === book && styles.selectedBookButton]}
                                onPress={() => loadChapters(book, index)}
                            >
                                <Text style={[styles.bookText, selectedBook === book && styles.selectedBookText, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>
                                    {book.name}
                                </Text>
                                <Text style={[styles.countText, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>
                                    {book.count}
                                </Text>
                                {
                                    selectedBook === book.name ? (
                                        <ChevonUpIcon name="down" color={device.theme ? AppColors.tabTextGrey : AppColors.appTextWhite} style={styles.downIconStyle} />
                                    )
                                        : (
                                            <ChevonDownIcon name="up" color={device.theme ? AppColors.tabTextGrey : AppColors.appTextWhite} style={styles.downIconStyle} />
                                        )
                                }
                            </TouchableOpacity>
                            {
                                selectedBook === book.name && (
                                    <View style={styles.chapterListContainer}>
                                        {
                                            chapterList.map((chp, index) => (
                                                <TouchableOpacity key={index + 'chapter'} style={[styles.chpContainer, { backgroundColor: device.theme ? AppColors.appTextWhite : AppColors.appBackgroundDark }]}
                                                    onPress={() => handleChapterPress(book, chp)}>
                                                    <Text style={[styles.chpTitle, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>{chp.number}</Text>
                                                </TouchableOpacity>
                                            ))
                                        }
                                    </View>
                                )
                            }
                        </View>
                    ))}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: '100%',
        // backgroundColor: AppColors.appBackgroundGrey,
    },
    tabContainer: {
        // flex: 1,
        height: 60,
        flexDirection: 'row',
        // backgroundColor: AppColors.appBackgroundGrey,
        paddingTop: 10,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: "#00000000",
    },
    activeTab: {
        borderBottomColor: AppColors.primary,
    },
    tabText: {
        fontSize: 16,
        color: AppColors.appTextBlack,
    },
    tabTextDark: {
        fontSize: 16,
        color: AppColors.appTextGrey,
    },
    activeTabText: {
        fontSize: 17,
        color: AppColors.primary,
        fontWeight: 'bold',
    },
    activeTabTextDark: {
        fontSize: 17,
        color: AppColors.appTextWhite,
        fontWeight: 'bold',
    },
    bookScrollView: {
        flex: 1,
        // backgroundColor: AppColors.appBackgroundGrey,
        // flexDirection: 'column',
    },
    bookButton: {
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: 16,
        // backgroundColor: AppColors.appTextWhite
    },
    selectedBookButton: {
        backgroundColor: AppColors.primary,
    },
    bookText: {
        color: AppColors.appTextBlack,
        fontSize: 14,
    },
    countText: {
        fontSize: 12,
        color: AppColors.appTextBlack,
        position: 'absolute',
        right: 50,
        bottom: 0,
        height: "100%",
        verticalAlign: 'middle',
    },
    selectedBookText: {
        color: AppColors.appBackgroundGrey,
    },
    versesList: {
        flex: 1,
        padding: 10,
        backgroundColor: AppColors.appBackgroundGrey,
        height: '100%',
    },
    chapterContainer: {
        marginBottom: 20,
    },
    chapterTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: AppColors.appTextBlack,
        marginBottom: 10,
    },
    verseContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    verseNumber: {
        fontSize: 14,
        color: AppColors.primary,
        marginRight: 10,
        fontWeight: 'bold',
    },
    verseTextContainer: {
        flex: 1,
    },
    verseText: {
        fontSize: 16,
        color: AppColors.appTextBlack,
        marginBottom: 5,
    },
    verseTextMM: {
        fontSize: 16,
        color: AppColors.appTextBlack,
        fontStyle: 'italic',
    },
    downIconStyle: {
        position: 'absolute',
        right: 16,
        bottom: 0,
        height: "100%",
        justifyContent: 'center',
    },
    chapterListContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
        gap: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chpContainer: {
        width: 60,
        height: 60, // Makes the item a square
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: AppColors.primary,
        // backgroundColor: AppColors.appTextWhite,
        borderRadius: 10,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.25,
        // shadowRadius: 3.84,
        // elevation: 3,
    },
    chpTitle: {
        fontSize: 16,
        color: '#333',
    },
});

export default Bible; 