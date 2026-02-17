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

const OptionModal = ({
  setOptionModalVisible,
}: {
  setOptionModalVisible: (visible: boolean) => void;
  selectedBookmark: any;
  bookName: string;
  chapterNumber: number;
}) => {
  useEffect(() => {
  }, []);

  const handleOKPress = () => {
    setOptionModalVisible(false);
  };

  return (
    <View style={styles.optionModalContainer}>
      <View style={styles.optionModalContentContainer}>
        <View style={styles.optionModalHeader}>
          <TouchableOpacity onPress={handleOKPress}>
            <CloseIcon name="cross" color={AppColors.appTextBlack} />
          </TouchableOpacity>
        </View>
        <View style={{height: 30, width: '100%'}} />
        <View style={styles.optionModalFooter}>
          <TouchableOpacity
            style={styles.optionModalOKButton}
            onPress={handleOKPress}>
            <Text style={styles.optionModalFooterButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  optionModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000080',
  },
  optionModalContentContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  optionModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    padding: 10,
  },
  optionModalContent: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  optionModalContentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.appTextBlack,
    marginBottom: 13,
  },
  optionModalFooter: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  optionModalOKButton: {
    backgroundColor: AppColors.primaryDark,
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionModalFooterButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionModalContentItemText: {
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

export default OptionModal;
