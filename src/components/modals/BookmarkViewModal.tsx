import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import CloseIcon from '../icons/CloseIcon';
import {AppColors} from '../../constants/Color';

const BookmarkViewModal = ({
  setBookmarkViewModalVisible,
  selectedBookmark,
  bookName,
  chapterNumber,
}: {
  setBookmarkViewModalVisible: (visible: boolean) => void;
  selectedBookmark: any;
  bookName: string;
  chapterNumber: number;
}) => {
  useEffect(() => {
    console.log('selectedBookmark from BookmarkViewModal', selectedBookmark);
  }, [selectedBookmark]);

  const handleOKPress = () => {
    setBookmarkViewModalVisible(false);
  };

  return (
    <View style={styles.bookmarkModalContainer}>
      <View style={styles.bookmarkModalContentContainer}>
        <View style={styles.bookmarkModalHeader}>
          <TouchableOpacity onPress={handleOKPress}>
            <CloseIcon name="cross" color={AppColors.appTextBlack} />
          </TouchableOpacity>
        </View>
        <View style={styles.bookmarkModalContent}>
          <Text style={styles.bookmarkModalContentTitle}>
            {bookName} {chapterNumber}:{selectedBookmark.verse}
          </Text>
          <Text style={styles.bookmarkModalContentItemText}>
            {selectedBookmark.text_hd}
          </Text>
          <Text style={styles.bookmarkNoteTitle}>
            Note
          </Text>
          <Text style={styles.bookmarkNoteContent}>
            {selectedBookmark.note}
          </Text>
          <View style={styles.bookmarkNoteContent}>
            <Text style={styles.bookmarkNoteContentDate}>
              {selectedBookmark.created_at}
            </Text>
          </View>
        </View>
        <View style={{height: 30, width: '100%'}} />
        <View style={styles.bookmarkModalFooter}>
          <TouchableOpacity
            style={styles.bookmarkModalOKButton}
            onPress={handleOKPress}>
            <Text style={styles.bookmarkModalFooterButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    width: '90%',
  },
  bookmarkModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    padding: 10,
  },
  bookmarkModalContent: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  bookmarkModalContentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.appTextBlack,
    marginBottom: 13,
  },
  bookmarkModalFooter: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  bookmarkModalOKButton: {
    backgroundColor: AppColors.primaryDark,
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
    marginBottom: 35,
  },
  bookmarkNoteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.appTextBlack,
    marginBottom: 5,
  },
  bookmarkNoteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    fontStyle: 'italic',
    padding: 5,
    paddingBottom: 10
  },
  bookmarkNoteContentDate: {
    fontSize: 12,
    color: AppColors.appTextBlack,
    fontStyle: 'italic',
  },
});

export default BookmarkViewModal;
