import React, {useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

import CloseIcon from '../icons/CloseIcon';
import {AppColors} from '../../constants/Color';

const OptionModal = ({
  setOptionModalVisible,
  onHighlightPress,
  onBookmarkPress,
}: {
  setOptionModalVisible: (visible: boolean) => void;
  onHighlightPress: () => void;
  onBookmarkPress: () => void;
}) => {
  useEffect(() => {}, []);

  const handleOKPress = () => {
    setOptionModalVisible(false);
  };

  return (
    <View style={styles.optionModalContainer}>
      <View style={styles.optionModalContentContainer}>
        <View style={styles.optionModalHeader}>
          <Text style={styles.optionModalTitle}>Choose an option</Text>
          <TouchableOpacity onPress={handleOKPress}>
            <CloseIcon name="cross" color={AppColors.appTextBlack} />
          </TouchableOpacity>
        </View>
        <View style={styles.optionModalButtonContainer}>
          <TouchableOpacity style={styles.optionModalButton} onPress={onHighlightPress}>
            <FontAwesome6
              name="highlighter"
              iconStyle="solid"
              size={15}
              color={AppColors.primaryDark}
              style={styles.optionModalButtonIcon}
            />
            <Text style={styles.optionModalButtonText}>Highlight</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionModalButton} onPress={onBookmarkPress}>
            <FontAwesome6
              name="bookmark"
              iconStyle="solid"
              color={AppColors.primaryDark}
              size={15}
              style={styles.optionModalButtonIcon}
            />
            <Text style={styles.optionModalButtonText}>Bookmark</Text>
          </TouchableOpacity>
        </View>
        {/* <View style={styles.optionModalFooter}>
          <TouchableOpacity
            style={styles.optionModalButton}
            onPress={handleOKPress}>
            <Text style={styles.optionModalFooterButtonText}>OK</Text>
          </TouchableOpacity>
        </View> */}
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
    justifyContent: 'space-between',
    width: '100%',
  },
  optionModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.appTextBlack,
    alignContent: 'center',
  },
//   optionModalFooter: {
//     flexDirection: 'row',
//     gap: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: '100%',
//   },
  optionModalButton: {
    flexDirection: 'row',
    backgroundColor: '#efefef',
    borderRadius: 5,
    width: '45%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    margin: 10,
  },
  optionModalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.primaryDark,
    // verticalAlign: 'middle',
    // alignContent: 'center',
  },
  optionModalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 10,
  },
  optionModalButtonIcon: {
    // backgroundColor: 'red',
  }
});

export default OptionModal;
