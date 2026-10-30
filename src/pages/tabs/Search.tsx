import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';

import RecentIcon from '../../components/icons/setting/RecentIcon';
import SearchSnippet from '../../components/SearchSnippet';
import CloseIcon from '../../components/icons/CloseIcon';
import { AppColors } from '../../constants/Color';
import { setLoading } from '../../store/slices/deviceSlice';
import DatabaseService from '../../services/DatabaseService';

const LANGUAGE_OPTIONS = [
    { code: 'hd', name: 'Ho Dlo' },
    { code: 'en', name: 'English' },
    { code: 'mm', name: 'Myanmar' },
];

const Search = ({ navigation }: any) => {
    const device = useSelector((state: any) => state.device);
    const isFocused = useIsFocused();
    const dispatch = useDispatch();

    const initialLang =
        (device.selectedLanguages && device.selectedLanguages[0]) ||
        device.language ||
        'hd';
    const [selectedLanguage, setSelectedLanguage] = useState<string>(
        ['hd', 'en', 'mm'].includes(initialLang) ? initialLang : 'hd',
    );

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchHistory, setSearchHistory] = useState([]);

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", async (_e: any) => {
            getHistory();
        });

        return () => unsubscribe();
    }, [isFocused]);

    const getHistory = async () => {
        setSearchQuery('');
        setSearchResults([]);
        DatabaseService.getInstance().getSearchHistory().then((results: any) => {
            setSearchHistory(results);
        }).catch((error) => {
            console.error('Error getting history:', error);
        });
    };

    const handleHistoryDelete = (id: number) => {
        DatabaseService.getInstance().clearSearchHistoryById(id).then(() => {
            getHistory();
        });
    };

    const performSearch = (query: string, lang: string) => {
        if (query !== null && query !== undefined && query.trim() !== '') {
            dispatch(setLoading(true));
            DatabaseService.getInstance().getVersesByKeyword(query.trim(), lang).then((results: any) => {
                if (results.length > 0) {
                    setSearchResults(results);
                } else {
                    setSearchResults([]);
                }
                dispatch(setLoading(false));
            }).catch((error) => {
                dispatch(setLoading(false));
                console.error('Error searching:', error);
            });
        }
    };

    const handleSearchSubmit = () => {
        performSearch(searchQuery, selectedLanguage);
    };

    const handleLanguageChange = (langCode: string) => {
        setSelectedLanguage(langCode);
        if (searchQuery && searchQuery.trim() !== '') {
            performSearch(searchQuery, langCode);
        }
    };

    const handleHistoryPress = (item: any) => {
        setSearchQuery(item.search_query);
        performSearch(item.search_query, selectedLanguage);
    };

    const textColor = device.theme ? AppColors.appTextBlack : AppColors.appTextWhite;

    const getVerseText = (item: any) => {
        if (selectedLanguage === 'en') return item.text_en || item.text_hd;
        if (selectedLanguage === 'mm') return item.text_mm || item.text_hd;
        return item.text_hd;
    };

    const getBookDisplay = (item: any) => {
        if (selectedLanguage === 'mm' && item.book_mm) return item.book_mm;
        if (selectedLanguage === 'hd' && item.book_hd) return item.book_hd;
        return item.book;
    };

    const renderHistoryItem = (item: any) => (
        <View style={styles.historyItemContainer}>
            <TouchableOpacity style={styles.historyItemContentContainer} onPress={() => handleHistoryPress(item)}>
                <RecentIcon name="recent" color={AppColors.iconGrey} style={styles.historyItemIcon} />
                <View style={styles.historyItemTextContainer}>
                    <Text style={[styles.historyItemText, { color: textColor }]}>{item.search_query}</Text>
                    <Text style={[styles.historyItemLocation, { color: textColor }]}>{item.book + " " + item.chapter + ":" + item.verse}</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.historyItemDeleteButton} onPress={() => handleHistoryDelete(item.id)}>
                <CloseIcon name="cross" color={textColor} />
            </TouchableOpacity>
        </View>
    );

    const handleSearchResultPress = (item: any) => {
        if (searchQuery !== '' && searchQuery !== null && searchQuery !== undefined) {
            DatabaseService.getInstance().addSearchHistory(searchQuery, item.verse_id).then(() => {
                navigation.navigate('Reader', { book: item.book, chapter: item.chapter, chapterId: item.chapter, verse: item.verse_id });
            }).catch((error) => {
                console.error('Error inserting search history:', error);
            });
        }
    };

    const renderSearchResult = (item: any) => (
        <TouchableOpacity style={styles.searchResultContainer} onPress={() => handleSearchResultPress(item)}>
            <SearchSnippet rawText={getVerseText(item)} keyword={searchQuery} theme={device.theme} />
            <Text style={[styles.searchResultLocationText, { color: textColor }]}>
                {getBookDisplay(item) + " " + item.chapter + ":" + item.verse}
            </Text>
        </TouchableOpacity>
    );

    const currentLangLabel =
        LANGUAGE_OPTIONS.find(l => l.code === selectedLanguage)?.name || 'Ho Dlo';

    return (
        <View style={[styles.container, { backgroundColor: device.theme ? AppColors.appBackgroundGrey : AppColors.appBackgroundDarkTint }]}>
            <View style={[styles.searchContainer, { backgroundColor: device.theme ? 'white' : AppColors.appBackgroundDark }]}>
                <TextInput
                    style={[
                        styles.searchBar,
                        {
                            color: textColor,
                            backgroundColor: device.theme ? AppColors.appTextWhite : AppColors.appBackgroundDarkTint,
                        },
                    ]}
                    placeholder={`Search ${currentLangLabel} verses…`}
                    placeholderTextColor={AppColors.appTextGrey}
                    value={searchQuery}
                    onChangeText={(text) => {
                        setSearchQuery(text);
                        if (text.length === 0) {
                            setSearchResults([]);
                        }
                    }}
                    onSubmitEditing={handleSearchSubmit}
                    returnKeyType="search"
                />
                <View style={styles.clearButtonContainer}>
                    {
                        searchQuery.length > 0 && (
                            <TouchableOpacity style={styles.clearButton} onPress={() => {
                                getHistory();
                            }}>
                                <CloseIcon name="cross" color={AppColors.appTextBlack} />
                            </TouchableOpacity>
                        )
                    }
                    <TouchableOpacity style={styles.searchButton} onPress={handleSearchSubmit}>
                        <Text style={styles.searchButtonText}>Search</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Language filter row */}
            <View
                style={[
                    styles.filterRow,
                    {
                        backgroundColor: device.theme ? '#fff' : AppColors.appBackgroundDark,
                        borderBottomColor: device.theme ? AppColors.lightGrey : '#333',
                    },
                ]}>
                <Text style={[styles.filterLabel, { color: AppColors.appTextGrey }]}>Language:</Text>
                {LANGUAGE_OPTIONS.map(lang => {
                    const isSelected = selectedLanguage === lang.code;
                    return (
                        <TouchableOpacity
                            key={lang.code}
                            style={[
                                styles.filterChip,
                                {
                                    backgroundColor: isSelected
                                        ? AppColors.primary
                                        : device.theme
                                        ? '#F2F2F4'
                                        : AppColors.appBackgroundDarkTint,
                                    borderColor: isSelected
                                        ? AppColors.primary
                                        : device.theme
                                        ? AppColors.lightGrey
                                        : '#444',
                                },
                            ]}
                            onPress={() => handleLanguageChange(lang.code)}>
                            <Text
                                style={[
                                    styles.filterChipText,
                                    {
                                        color: isSelected ? '#fff' : textColor,
                                        fontWeight: isSelected ? '700' : '500',
                                    },
                                ]}>
                                {lang.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {
                searchResults.length > 0 ? (
                    <FlatList
                        data={searchResults}
                        contentContainerStyle={styles.searchResultsContainer}
                        renderItem={({ item }: any) => renderSearchResult(item)}
                        keyExtractor={(_item: any, index: number) => "search-result-" + index.toString()}
                        keyboardShouldPersistTaps="handled"
                        ListEmptyComponent={() => (
                            <View style={styles.emptySearchResultsContainer}>
                                <Text style={styles.emptySearchResultsText}>No results found</Text>
                            </View>
                        )}
                    />) : (
                    <View style={styles.historyContainer}>
                        <Text style={[styles.historyTitle, { color: textColor }]}>Recent</Text>
                        <FlatList
                            data={searchHistory}
                            renderItem={({ item }: any) => renderHistoryItem(item)}
                            keyExtractor={(_item: any, index: number) => "search-history-" + index.toString()}
                            keyboardShouldPersistTaps="handled"
                        />
                    </View>
                )
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.appBackgroundGrey,
    },
    text: {
        fontSize: 20,
        color: AppColors.appTextBlack,
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: 'white',
    },
    searchBar: {
        flex: 1,
        height: 40,
        paddingHorizontal: 16,
        paddingRight: 100,
        backgroundColor: AppColors.appTextWhite,
        borderRadius: 14,
        borderWidth: 0.5,
        borderColor: AppColors.primary,
    },
    searchButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: AppColors.primary,
        paddingHorizontal: 16,
        borderTopRightRadius: 14,
        borderBottomRightRadius: 14,
        height: 40,
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
        borderBottomWidth: 1,
    },
    filterLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginRight: 4,
    },
    filterChip: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 16,
        borderWidth: 1,
    },
    filterChipText: {
        fontSize: 13,
    },
    historyContainer: {
        flex: 1,
        padding: 16,
    },
    historyTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    historyItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    historyItemContentContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    historyItemTextContainer: {
        flexDirection: 'column',
        marginLeft: 16,
    },
    historyItemIcon: {
        width: 24,
        height: 24,
    },
    historyItemText: {
        fontSize: 14,
        color: AppColors.appTextGrey,
    },
    historyItemLocation: {
        fontSize: 16,
        color: AppColors.appTextBlack,
        marginBottom: 4,
    },
    emptyHistoryText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#999',
    },
    searchResultsContainer: {
        padding: 16,
    },
    searchResultContainer: {
        marginBottom: 16,
    },
    searchResultText: {
        fontSize: 16,
        color: AppColors.appTextBlack,
        fontFamily: "Pretendard-Regular",
        lineHeight: 24,
    },
    searchResultLocationText: {
        fontSize: 14,
        color: AppColors.appTextBlack,
        fontFamily: "Pretendard-Regular",
        lineHeight: 16,
        width: '100%',
        textAlign: 'right',
    },
    emptySearchResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptySearchResultsText: {
        fontSize: 16,
        color: AppColors.appTextBlack,
    },
    clearButton: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
    },
    historyItemDeleteButton: {},
    clearButtonContainer: {
        zIndex: 1000,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 16,
        top: 16,
        flexDirection: 'row',
        gap: 5,
    },
});

export default Search;
