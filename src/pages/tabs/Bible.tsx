import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';

import { getChaptersByBook, getVersesByBook } from '../../services/DatabaseService';
import { NEW_TESTAMENT_BOOKS, OLD_TESTAMENT_BOOKS } from '../../assets/seeder/data';
import ChevonDownIcon from '../../components/icons/ChevonDownIcon';
import ChevonUpIcon from '../../components/icons/ChevonUpIcon';
import { AppColors } from '../../constants/Color';
import { useSelector } from 'react-redux';

const Bible = ({ navigation }: any) => {
    const device = useSelector((state: any) => state.device);
    const [activeTab, setActiveTab] = useState<'old' | 'new'>('old');
    const [verses, setVerses] = useState<any[]>([]);
    const [selectedBook, setSelectedBook] = useState('');
    const [selectedChapter, setSelectedChapter] = useState(1);
    const [bookList, setBookList] = useState<any[]>([]);
    const [chapterList, setChapterList] = useState<any[]>([]);

    useEffect(() => {
        // loadVerses(selectedBook);
    }, []);

    const loadVerses = async (book: string) => {
        setSelectedBook(book);
        console.log('loadVerses', book);
        try {
            const result = await getVersesByBook(book);
            setBookList(result || []);
            setChapterList(result[0].chapters || []);
            console.log('bookList', result);

        } catch (error) {
            console.error('Error loading verses:', error);
        }
    };

    const handleChapterPress = (book: string, chapter: any) => {
        console.log('handleChapterPress', book, chapter);
        navigation.navigate('Reader', { book: book, chapter: chapter.chapter, verse: 1 });
    };

    const loadChapters = async (book: string, bookId: any) => {
        setSelectedBook(book);
        try {
            const result = await getChaptersByBook(book);
            console.log('result >', result);
            setChapterList(result || []);
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
        <View style={[styles.container, { backgroundColor: device.theme ? AppColors.appBackgroundGrey : AppColors.appBackgroundDarkTint }]}>
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'old' && styles.activeTab]}
                    onPress={() => {
                        setActiveTab('old');
                        setSelectedBook('');
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
                    }}
                >
                    <Text style={device.theme ? activeTab === 'new' ? styles.activeTabText : styles.tabText : activeTab === 'new' ? styles.activeTabTextDark : styles.tabTextDark}>
                        New Testament
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal={false} style={[styles.bookScrollView, { backgroundColor: device.theme ? AppColors.appBackgroundGrey : AppColors.appBackgroundDarkTint }]}>
                {(activeTab === 'old' ? OLD_TESTAMENT_BOOKS : NEW_TESTAMENT_BOOKS).map((book, index) => (
                    <View key={index + 'book'}>
                        <TouchableOpacity
                            style={[styles.bookButton, selectedBook === book && styles.selectedBookButton]}
                            onPress={() => loadChapters(book, index)}
                        >
                            <Text style={[styles.bookText, selectedBook === book && styles.selectedBookText, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>
                                {book}
                            </Text>
                            {
                                selectedBook === book ? (
                                    <ChevonUpIcon name="down" color={device.theme ? AppColors.tabTextGrey : AppColors.appTextWhite} style={styles.downIconStyle} />
                                )
                                    : (
                                        <ChevonDownIcon name="up" color={device.theme ? AppColors.tabTextGrey : AppColors.appTextWhite} style={styles.downIconStyle} />
                                    )
                            }
                        </TouchableOpacity>
                        {
                            selectedBook === book && (
                                <View style={styles.chapterListContainer}>
                                    {
                                        chapterList.map((chp, index) => (
                                            <TouchableOpacity key={index + 'chapter'} style={[styles.chpContainer, { backgroundColor: device.theme ? AppColors.appTextWhite : AppColors.appBackgroundDark }]}
                                                onPress={() => handleChapterPress(book, chp)}>
                                                <Text style={[styles.chpTitle, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>{chp.chapter}</Text>
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