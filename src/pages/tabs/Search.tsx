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

const Search = ({ navigation }: any) => {
    const device = useSelector((state: any) => state.device);
    const isFocused = useIsFocused();
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchHistory, setSearchHistory] = useState([]);

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", async (e: any) => {
            getHistory();
        })

        return () => unsubscribe();
    }, [isFocused])

    // useFocusEffect(
    //     useCallback(() => {
    //         getHistory();
    //     }, [])
    // );

    const getHistory = async () => {
        setSearchQuery('');
        setSearchResults([]);
        DatabaseService.getInstance().getSearchHistory().then((results: any) => {
            setSearchHistory(results);
        }).catch((error) => {
            console.error('Error getting history:', error);
        });
    }

    const handleHistoryDelete = (id: number) => {
        DatabaseService.getInstance().clearSearchHistoryById(id).then(() => {
            getHistory();
        });
    }

    const handleSearchSubmit = async () => {
        if (searchQuery !== null && searchQuery !== undefined && searchQuery !== '') {
            dispatch(setLoading(true));
            DatabaseService.getInstance().getVersesByKeyword(searchQuery).then((results: any) => {
                if (results.length > 0) {
                    setSearchResults(results);
                } else {
                    setSearchResults([]);
                }
                dispatch(setLoading(false));
            }).catch((error) => {
                dispatch(setLoading(false));
                console.error('Error searching:', error);
            })
        }
    };
    const handleHistoryPress = (item: any) => {
        setSearchQuery(item.search_query);
    };

    const renderHistoryItem = (item: any) => (
        <View style={styles.historyItemContainer}>
            <TouchableOpacity style={styles.historyItemContentContainer} onPress={() => handleHistoryPress(item)}>
                <RecentIcon name="recent" color={AppColors.iconGrey} style={styles.historyItemIcon} />
                <View style={styles.historyItemTextContainer}>
                    <Text style={[styles.historyItemText, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>{item.search_query}</Text>
                    <Text style={[styles.historyItemLocation, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>{item.book + " " + item.chapter + ":" + item.verse}</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.historyItemDeleteButton} onPress={() => handleHistoryDelete(item.id)}>
                <CloseIcon name="cross" color={device.theme ? AppColors.appTextBlack : AppColors.appTextWhite} />
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
            <SearchSnippet rawText={item.text_hd} keyword={searchQuery} theme={device.theme} />
            <Text style={[styles.searchResultLocationText, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>{item.book + " " + item.chapter + ":" + item.verse}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: device.theme ? AppColors.appBackgroundGrey : AppColors.appBackgroundDarkTint }]}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Please type any keywords to search"
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
            {
                searchResults.length > 0 ? (
                    <FlatList
                        data={searchResults}
                        contentContainerStyle={styles.searchResultsContainer}
                        renderItem={({ item }: any) => renderSearchResult(item)}
                        keyExtractor={(item: any, index: number) => "search-result-" + index.toString()}
                        ListEmptyComponent={() => (
                            <View style={styles.emptySearchResultsContainer}>
                                <Text style={styles.emptySearchResultsText}>No results found</Text>
                            </View>
                        )}
                    />) : (
                    <View style={styles.historyContainer}>
                        <Text style={[styles.historyTitle, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>Recent</Text>
                        <FlatList
                            data={searchHistory}
                            renderItem={({ item }: any) => renderHistoryItem(item)}
                            keyExtractor={(item: any, index: number) => "search-history-" + index.toString()}
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
        backgroundColor: 'white',
    },
    searchBar: {
        flex: 1,
        height: 40,
        paddingHorizontal: 16,
        backgroundColor: AppColors.appTextWhite,
        // borderTopLeftRadius: 14,
        // borderBottomLeftRadius: 14,
        // borderTopRightRadius: 0,
        // borderBottomRightRadius: 0,
        borderRadius: 14,
        borderWidth: 0.5,
        borderColor: AppColors.primary,
    },
    searchButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: AppColors.primary,
        paddingHorizontal: 16,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: 14,
        borderBottomRightRadius: 14,
        height: 40,
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: 'bold',
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
        // marginTop: 6,
        // position: 'absolute',
        // right: 95,
        // top: 10,
        // height: "100%",
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        // backgroundColor: 'white',
    },
    historyItemDeleteButton: {
        // position: 'absolute',
        // right: 16,
        // top: 16,
    },
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
    }
});

export default Search; 