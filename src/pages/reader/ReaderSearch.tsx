import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

import { AppColors } from '../../constants/Color';
import SearchSnippet from '../../components/SearchSnippet';
import RecentIcon from '../../components/icons/setting/RecentIcon';
import CloseIcon from '../../components/icons/CloseIcon';
import DatabaseService from '../../services/DatabaseService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LANGUAGE_OPTIONS = [
  { code: 'hd', name: 'Ho Dlo' },
  { code: 'en', name: 'English' },
  { code: 'mm', name: 'Myanmar' },
];

const ReaderSearch = ({ }) => {
  const device = useSelector((state: any) => state.device);
  const navigation = useNavigation<any>();
  const inputRef = useRef<TextInput>(null);

  const initialLang =
    (device.selectedLanguages && device.selectedLanguages[0]) ||
    device.language ||
    'hd';
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    ['hd', 'en', 'mm'].includes(initialLang) ? initialLang : 'hd',
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    getHistory();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const getHistory = async () => {
    setSearchQuery('');
    setSearchResults([]);
    DatabaseService.getInstance()
      .getSearchHistory()
      .then((results: any) => setSearchHistory(results))
      .catch((err: any) => console.error('Search history error:', err));
  };

  const handleHistoryDelete = (id: number) => {
    DatabaseService.getInstance()
      .clearSearchHistoryById(id)
      .then(() => getHistory());
  };

  const performSearch = (query: string, lang: string) => {
    if (!query || query.trim() === '') return;
    setIsLoading(true);
    DatabaseService.getInstance()
      .getVersesByKeyword(query.trim(), lang)
      .then((results: any) => {
        setSearchResults(results.length > 0 ? results : []);
        setIsLoading(false);
      })
      .catch((err: any) => {
        console.error('Search error:', err);
        setIsLoading(false);
      });
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

  const handleResultPress = (item: any) => {
    if (!searchQuery || searchQuery.trim() === '') return;
    DatabaseService.getInstance()
      .addSearchHistory(searchQuery, item.verse_id)
      .then(() => {
        navigation.navigate(
          'Reader' as never,
          {
            book: item.book,
            chapter: item.chapter,
            chapterId: item.chapter,
            verse: item.verse_id,
          } as never,
        );
      })
      .catch((err: any) => console.error('Add history error:', err));
  };

  const textColor = device.theme ? AppColors.appTextBlack : AppColors.appTextWhite;
  const bgColor = device.theme ? AppColors.appBackgroundGrey : AppColors.appBackgroundDarkTint;

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

  // ── Render helpers ────────────────────────────────────────────────────────

  const renderHistoryItem = ({ item }: any) => (
    <View style={styles.historyItemContainer}>
      <TouchableOpacity
        style={styles.historyItemContent}
        onPress={() => handleHistoryPress(item)}>
        <RecentIcon name="recent" color={AppColors.iconGrey} style={styles.historyIcon} />
        <View style={styles.historyItemText}>
          <Text style={[styles.historyQuery, { color: textColor }]}>
            {item.search_query}
          </Text>
          <Text style={[styles.historyLocation, { color: textColor }]}>
            {item.book + ' ' + item.chapter + ':' + item.verse}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleHistoryDelete(item.id)}>
        <CloseIcon name="cross" color={textColor} />
      </TouchableOpacity>
    </View>
  );

  const renderSearchResult = ({ item }: any) => (
    <TouchableOpacity
      style={styles.resultContainer}
      onPress={() => handleResultPress(item)}>
      <SearchSnippet
        rawText={getVerseText(item)}
        keyword={searchQuery}
        theme={device.theme}
      />
      <Text style={[styles.resultLocation, { color: textColor }]}>
        {getBookDisplay(item) + ' ' + item.chapter + ':' + item.verse}
      </Text>
    </TouchableOpacity>
  );

  const currentLangLabel =
    LANGUAGE_OPTIONS.find(l => l.code === selectedLanguage)?.name || 'Ho Dlo';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor, paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={[styles.header, { backgroundColor: device.theme ? '#fff' : AppColors.appBackgroundDark }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <FontAwesome6
              name="arrow-left"
              iconStyle="solid"
              color={AppColors.primaryDark}
              size={20}
            />
          </TouchableOpacity>

          {/* Search input inline in header */}
          <TextInput
            ref={inputRef}
            style={[
              styles.searchInput,
              {
                color: textColor,
                backgroundColor: device.theme ? AppColors.appBackgroundGrey : AppColors.appBackgroundDarkTint,
              },
            ]}
            placeholder={`Search ${currentLangLabel} verses…`}
            placeholderTextColor={AppColors.appTextGrey}
            value={searchQuery}
            onChangeText={text => {
              setSearchQuery(text);
              if (text.length === 0) setSearchResults([]);
            }}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            autoCorrect={false}
          />

          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={getHistory} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <FontAwesome6
                name="xmark"
                iconStyle="solid"
                color={AppColors.appTextGrey}
                size={16}
              />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.searchBtn}
            onPress={handleSearchSubmit}>
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* ── Language Filter Row ────────────────────────────────────── */}
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
                      color: isSelected
                        ? '#fff'
                        : textColor,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}>
                  {lang.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Body ───────────────────────────────────────────────────── */}
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={AppColors.primary} />
          </View>
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            contentContainerStyle={styles.resultsList}
            renderItem={renderSearchResult}
            keyExtractor={(_item, i) => 'sr-' + i}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={() => (
              <View style={styles.centered}>
                <Text style={[styles.emptyText, { color: textColor }]}>No results found</Text>
              </View>
            )}
          />
        ) : (
          <View style={styles.historySection}>
            <Text style={[styles.historyTitle, { color: textColor }]}>Recent</Text>
            <FlatList
              data={searchHistory}
              renderItem={renderHistoryItem}
              keyExtractor={(_item, i) => 'sh-' + i}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    fontSize: 15,
    backgroundColor: AppColors.appBackgroundGrey,
  },
  searchBtn: {
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: AppColors.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // ── Language filter ───────────────────────────────────────────────────────
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
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

  // ── History ───────────────────────────────────────────────────────────────
  historySection: {
    flex: 1,
    padding: 16,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  historyItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  historyItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIcon: {
    width: 24,
    height: 24,
  },
  historyItemText: {
    marginLeft: 14,
  },
  historyQuery: {
    fontSize: 14,
    color: AppColors.appTextGrey,
  },
  historyLocation: {
    fontSize: 15,
    color: AppColors.appTextBlack,
    marginTop: 2,
  },

  // ── Results ───────────────────────────────────────────────────────────────
  resultsList: {
    padding: 16,
  },
  resultContainer: {
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultLocation: {
    fontSize: 13,
    textAlign: 'right',
    marginTop: 4,
    color: AppColors.appTextGrey,
    fontFamily: 'Pretendard-Regular',
  },

  // ── States ────────────────────────────────────────────────────────────────
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: AppColors.appTextGrey,
  },
});

export default ReaderSearch;
