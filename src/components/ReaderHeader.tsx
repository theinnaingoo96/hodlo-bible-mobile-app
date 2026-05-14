import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Share,
  ActionSheetIOS,
  Platform,
} from 'react-native';

import { AppColors } from '../constants/Color';
import { constants } from '../constants/Data';
import SplitVerticalIcon from './icons/SplitVerticalIcon';
import SplitHorizontalIcon from './icons/SplitHorizontalIcon';
import { Menu, MenuItem } from 'react-native-material-menu';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

interface ReaderHeaderProps {
  title: string;
  backButton: boolean;
  dividerMode: string;
  selectedVerse: any;
  onTitlePress: () => void;
  onSettingsPress: () => void;
  onAudioReaderPress: () => void;
  setDividerMode: (mode: string) => void;
  onAddHighlightPress: () => void;
  onRemoveHighlightPress: () => void;
  onAddBookmarkPress: () => void;
  onRemoveBookmarkPress: () => void;
  onCopytoClickboard: (text: number) => void;
  onSharePress: () => void;
}

const ReaderHeader = ({
  title,
  backButton,
  dividerMode,
  selectedVerse,
  onTitlePress,
  onSettingsPress,
  onAudioReaderPress,
  setDividerMode,
  onAddHighlightPress,
  onRemoveHighlightPress,
  onAddBookmarkPress,
  onRemoveBookmarkPress,
  onCopytoClickboard,
  onSharePress
}: ReaderHeaderProps) => {
  const device = useSelector((state: any) => state.device);
  const reader = useSelector((state: any) => state.reader);
  const navigation = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const { stop } = useAudioPlayer();
  const handleTitlePress = () => {
    // console.log('handleTitlePress');
  };

  const hideMenu = (type: number) => {
    // console.log('[Menu] hideMenu', type, selectedVerse);

    // Give some time for the press to be processed on iOS before closing
    setTimeout(() => {
      setIsOpen(false);
    }, 100);

    switch (type) {
      case 0:
        navigation.navigate('ChangeLanguage' as never);
        break;
      case 1:
        onSettingsPress();
        break;
      case 2:
        onAudioReaderPress();
        break;
      case 3:
        onCopytoClickboard(0);
        break;
      case 4:
        onCopytoClickboard(1);
        break;
      case 5:
        onCopytoClickboard(2);
        break;
      case 6:
        onCopytoClickboard(3);
        break;
      case 7:
        onAddHighlightPress();
        break;
      case 8:
        onRemoveHighlightPress();
        break;
      case 9:
        onAddBookmarkPress();
        break;
      case 10:
        onRemoveBookmarkPress();
        break;
      case 11:
        onSharePress();
        break;
      default:
        break;
    }
  };

  const handleSharePress = () => {

    // try {
    //     const result = await Share.share({
    //         title: 'Daily Verse',
    //         message:
    //             `${todayVerse?.text_hd || ''} \n\n ${todayVerse?.book_name + " " + todayVerse?.chapter_number + ":" + todayVerse?.verse_number}`,
    //     });
    //     if (result.action === Share.sharedAction) {
    //         if (result.activityType) {
    //             // shared with activity type of result.activityType
    //         } else {
    //             // shared
    //         }
    //     } else if (result.action === Share.dismissedAction) {
    //         // dismissed
    //     }
    // } catch (error: any) {
    //     Alert.alert(error.message);
    // }

  }

  const showMenu = () => {
    if (Platform.OS === 'ios') {
      const options = ['Cancel', 'Language', 'Reader Setting', 'Audio Reader'];
      const actions = [-1, 0, 1, 2];

      if (selectedVerse) {
        options.push('Copy Ho Dlo version');
        actions.push(3);

        if (device.language == 'en') {
          options.push('Copy English version');
          actions.push(4);
        }
        if (device.language == 'mm') {
          options.push('Copy Myanmar version');
          actions.push(5);
        }
        if (device.language == 'en' || device.language == 'mm') {
          options.push('Copy Both versions');
          actions.push(6);
        }

        if (selectedVerse && selectedVerse.highlight) {
          options.push('Remove Highlight');
          actions.push(8);
        } else {
          options.push('Add Highlight');
          actions.push(7);
        }

        if (selectedVerse && selectedVerse.bookmark) {
          options.push('Remove Bookmark');
          actions.push(10);
        } else {
          options.push('Add Bookmark');
          actions.push(9);
        }

        options.push('Share Verse');
        actions.push(11);
      }

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 0,
        },
        buttonIndex => {
          if (buttonIndex !== 0) {
            hideMenu(actions[buttonIndex]);
          }
        },
      );
    } else {
      setIsOpen(true);
    }
  };

  return (
    <View
      style={[
        styles.headerContainer,
        {
          backgroundColor:
            constants.theme[reader.readerSetting.theme - 1].toolbarColor,
        },
      ]}>
      {backButton && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Bible' as never);
            }
            stop();
          }}>
          <FontAwesome6
            name="arrow-left"
            iconStyle="solid"
            color={constants.theme[reader.readerSetting.theme - 1].buttonColor}
            size={20}
          />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.headerTitleContainer}
        onPress={onTitlePress}>
        <Text
          style={[
            styles.headerTitle,
            { color: constants.theme[reader.readerSetting.theme - 1].fontColor },
          ]}>
          {title}
        </Text>
        {/* <FontAwesome6
          name="caret-down"
          iconStyle="solid"
          color={constants.theme[reader.readerSetting.theme - 1].fontColor}
          size={20}
        /> */}
      </TouchableOpacity>
      <View style={styles.optionsContainer}>
        {device.language == 'en' || device.language == 'mm' ? (
          <TouchableOpacity
            style={styles.optionsButton}
            onPress={() =>
              setDividerMode(
                dividerMode === 'horizontal' ? 'vertical' : 'horizontal',
              )
            }>
            {dividerMode === 'horizontal' ? (
              <SplitVerticalIcon
                color={
                  constants.theme[reader.readerSetting.theme - 1].fontColor
                }
                size={20}
              />
            ) : (
              <SplitHorizontalIcon
                color={
                  constants.theme[reader.readerSetting.theme - 1].fontColor
                }
                size={20}
              />
            )}
          </TouchableOpacity>
        ) : (
          <></>
        )}
        <Menu
          visible={isOpen}
          anchor={
            <TouchableOpacity
              style={[styles.optionsButton, { marginRight: 6 }]}
              onPress={showMenu}>
              <FontAwesome6
                name="ellipsis-vertical"
                iconStyle="solid"
                color={constants.theme[reader.readerSetting.theme - 1].fontColor}
                size={20}
              />
            </TouchableOpacity>
          }
          onRequestClose={() => hideMenu(-1)}>
          <MenuItem
            onPress={() => hideMenu(0)}>
            Language
          </MenuItem>
          <MenuItem onPress={() => hideMenu(1)}>Reader Setting</MenuItem>
          <MenuItem onPress={() => hideMenu(2)}>Audio Reader</MenuItem>
          {selectedVerse && (
            <>
              <MenuItem onPress={() => hideMenu(3)}>Copy Ho Dlo version</MenuItem>
              {
                device.language == 'en' && (
                  <MenuItem onPress={() => hideMenu(4)}>Copy English version</MenuItem>
                )
              }
              {
                device.language == 'mm' && (
                  <MenuItem onPress={() => hideMenu(5)}>Copy Myanmar version</MenuItem>
                )
              }
              {
                (device.language == 'en' || device.language == 'mm') && (
                  <MenuItem onPress={() => hideMenu(6)}>Copy Both versions</MenuItem>
                )
              }
              {/* <MenuItem onPress={() => hideMenu(4)}>Share Verse</MenuItem> */}
              {
                selectedVerse && selectedVerse.highlight ? (
                  <MenuItem onPress={() => hideMenu(8)}>Remove Highlight</MenuItem>
                ) : (
                  <MenuItem onPress={() => hideMenu(7)}>Add Highlight</MenuItem>
                )
              }
              {
                selectedVerse && selectedVerse.bookmark ? (
                  <MenuItem onPress={() => hideMenu(10)}>Remove Bookmark</MenuItem>
                ) : (
                  <MenuItem onPress={() => hideMenu(9)}>Add Bookmark</MenuItem>
                )
              }
              <MenuItem onPress={() => hideMenu(11)}>Share Verse</MenuItem>
            </>
          )}
        </Menu>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 63,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    justifyContent: 'space-between',
    width: Dimensions.get('window').width,
    borderBottomColor: AppColors.primaryTint,
  },
  headerTitleContainer: {
    gap: 6,
    left: '50%',
    alignItems: 'center',
    flexDirection: 'row',
    position: 'absolute',
    justifyContent: 'center',
    transform: [{ translateX: '-50%' }],
  },
  headerTitle: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '600',
    color: AppColors.primary,
  },
  backButton: {
    width: 65,
    height: 40,
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'center',
    gap: 10,
  },
  optionsButton: {
    padding: 10,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ReaderHeader;
