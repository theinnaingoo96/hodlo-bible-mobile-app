import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { AppColors } from '../../constants/Color';
import { constants } from '../../constants/Data';

interface VerseComponentProps {
  verse: any;
  language: string;
  index: number;
  activeVerseIndex: number;
  selectedVerse: any;
  readerSetting: any;
  onVerseClick: (verse: any) => void;
  onLongPress: (verse: any) => void;
}

export const VerseComponent = React.memo(({
  verse,
  language,
  index,
  activeVerseIndex,
  selectedVerse,
  readerSetting,
  onVerseClick,
  onLongPress
}: VerseComponentProps) => {
  const isActive = activeVerseIndex === index;
  const isSelected = selectedVerse?.id === verse.id;

  return (
    <View
      style={[
        { flex: 1 },
        isSelected && {
          backgroundColor: constants.theme[readerSetting.theme - 1].highlightColor,
        },
        isActive && {
          backgroundColor: readerSetting.theme === 1
            ? 'rgba(212, 175, 55, 0.15)' // Warmer for Light
            : 'rgba(212, 175, 55, 0.3)',  // Stronger for Dark
        }
      ]}>
      {isActive && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 3,
            bottom: 3,
            width: 4,
            backgroundColor: AppColors.primary,
            borderTopRightRadius: 4,
            borderBottomRightRadius: 4,
            elevation: 2, // Shadow for Android
            shadowColor: '#000', // Shadow for iOS
            shadowOffset: { width: 1, height: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 1,
          }}
        />
      )}
      {
        verse['subtitle_' + language] &&
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
        }}>
          <Text style={styles.subTitle}>{verse['subtitle_' + language]}</Text>
        </View>
      }
      <TouchableOpacity
        style={styles.verseContainer}
        onLongPress={() => onLongPress(verse)}
        onPress={() => onVerseClick(verse)}>
        <View>
          <Text
            style={[
              styles.verseNumber,
              {
                color: verse.bookmark
                  ? AppColors.primaryTint
                  : AppColors.primaryDark,
              },
            ]}>
            {verse.number}
          </Text>
          {verse.bookmark && (
            <FontAwesome6
              name="bookmark"
              iconStyle="solid"
              color={AppColors.primaryTint}
              size={15}
            />
          )}
        </View>
        <Text style={{ paddingLeft: 5, paddingRight: 15 }}>
          <Text
            style={[
              styles.verseText,
              {
                fontSize: readerSetting.fontSize,
                lineHeight: readerSetting.fontSize * 1.5,
                fontFamily:
                  constants.fontFamily[readerSetting.fontFamily - 1]
                    .regular,
                color:
                  constants.theme[readerSetting.theme - 1].fontColor,
                backgroundColor: verse.highlight
                  ? verse.highlight_color
                  : 'transparent',
              },
            ]}>
            {verse['text_' + language]}
          </Text>
        </Text>
      </TouchableOpacity>
      {language === 'hd' && <View style={{ height: 3 }} />}
    </View>
  );
});

interface ChapterEndFooterProps {
  bookName: string;
  chapterNumber: number;
  readerSetting: any;
}

export const ChapterEndFooterComponent = ({ bookName, chapterNumber, readerSetting }: ChapterEndFooterProps) => {
  return (
    <View style={styles.footerWrapper}>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.ornament}>❦</Text>
        <View style={styles.line} />
      </View>

      <Text
        style={[
          styles.endOfText,
          {
            fontFamily:
              constants.fontFamily[readerSetting.fontFamily - 1]
                .regular,
          },
        ]}>
        Conclusion of {bookName} Chapter{' '}
        {chapterNumber}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  verseContainer: {
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  verseNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.primaryTint,
    marginTop: 2,
  },
  verseText: {
    color: AppColors.appTextBlack,
    lineHeight: 27,
    paddingLeft: 5,
    marginLeft: 5,
    marginRight: 15,
  },
  footerWrapper: {
    paddingTop: 60,
    paddingBottom: 80,
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1CDC0',
  },
  ornament: {
    paddingHorizontal: 15,
    fontSize: 20,
    color: '#A6A295',
  },
  endOfText: {
    fontSize: 16,
    color: '#7C786A',
    fontStyle: 'italic',
    marginBottom: 40,
  },
  subTitle: {
    fontSize: 14,
    // fontWeight: 'bold',
    color: AppColors.appTextBlack,
    marginTop: 5,
    marginBottom: 5,
  },
});
