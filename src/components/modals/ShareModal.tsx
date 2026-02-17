import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';
import Slider from '@react-native-community/slider';
import { launchImageLibrary } from 'react-native-image-picker';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

import CloseIcon from '../icons/CloseIcon';
import {AppColors} from '../../constants/Color';
import FontColorPicker from '../FontColorPicker';
import DeviceInfo from 'react-native-device-info';

const ShareModal = ({
  setShareModalVisible,
  selectedVerse,
  bookName,
  chapterNumber,
}: {
  setShareModalVisible: (visible: boolean) => void;
  selectedVerse: any;
  bookName: string;
  chapterNumber: number;
}) => {
  const viewShotRef = useRef<any>(null);
  const [selectedColor, setSelectedColor] = useState({ name: 'White', hex: '#FFFFFF', code: '#FFFFFF' });
  const [blurRadius, setBlurRadius] = useState(5);
  const [imageUri, setImageUri] = useState<any>('https://images.unsplash.com/photo-1441974231531-c6227db76b6e');

  const handleSharePress = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current?.capture();
        const result = await Share.open({
          url: uri || '',
          type: 'image/png',
          message: 'Shared from Gathengpu Dlo App',
        });
      }
    } catch (error) {
      console.error('Sharing failed', error);
    }
  };

  const handleImportImagePress = async () => {
    const androidVersion = DeviceInfo.getSystemVersion();
    const apiLevel = Platform.Version as number;//parseInt(androidVersion.split('.')[0]) || 0;
    let hasPermission = false;
    console.log('androidVersion', androidVersion);
    console.log('apiLevel', apiLevel);
    if (Platform.OS === 'android') {
      if (apiLevel >= 33) {
        hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
        if (!hasPermission) {
          const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES, {
            title: 'Permission to access photos',
            message: 'We need your permission to access your photo library to import an image.',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          });
          hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } else {
        hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
        if (!hasPermission) {
          const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE, {
            title: 'Permission to access photos',
            message: 'We need your permission to access your photo library to import an image.',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          });
          hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      }
    } else {
      hasPermission = true;
    }
    if (!hasPermission) {
      Alert.alert(
        'Permission required',
        'Please allow photo access to import an image.'
      );
      return;
    }
    const result = await launchImageLibrary({mediaType: 'photo'});
    if (result.assets) {
      setImageUri(result.assets[0].uri);
    } 
  };

  const handleSaveToDevicePress = async () => {
    // try {
    //   if (viewShotRef.current) {
    //     const uri = await viewShotRef.current?.capture();
    //     if (uri) {
    //       console.log('uri', uri);
    //     }
    //   }
    // } catch (error) {
    //   console.error('Saving to device failed', error);
    // }
  };

  const handleCancelPress = () => {
    setShareModalVisible(false);
  };

  return (
    <View style={styles.shareModalContainer}>
      <View style={styles.shareModalContentContainer}>
        <View style={styles.shareModalHeader}>
          <TouchableOpacity
            style={styles.imageImportButton}
            onPress={handleImportImagePress}>
            <FontAwesome6
              name="file-import"
              iconStyle="solid"
              color={AppColors.appTextBlack}
              size={15}
            />
            <Text style={{fontSize: 12, color: AppColors.appTextBlack}}>
              Import Image
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCancelPress}>
            <CloseIcon name="cross" color={AppColors.appTextBlack} />
          </TouchableOpacity>
        </View>
        <View style={styles.shareModalContent}>
          <ViewShot ref={viewShotRef} options={{format: 'png', quality: 0.9}}>
            {/* <ImageBackground
              source={{
                uri: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
              }}
              style={styles.absoluteBackground}
              resizeMode="cover"> */}
            {/* <View style={styles.centered}>
                <Text style={styles.shareModalContentTitle}>
                  {selectedVerse.book_name} {selectedVerse.chapter_number}:
                  {selectedVerse.verse_number}
                </Text>
                <Text style={styles.shareModalContentItemText}>
                  {selectedVerse.text_hd}
                </Text>
              </View> */}
            {/* <View
                style={[
                  styles.glassOverlay,
                  {
                    backgroundColor: 'rgba(255,255,255,0.5)',
                  },
                ]}>
                <Text style={styles.verseTitle}>
                  {selectedVerse.book_name} {selectedVerse.chapter_number}:
                  {selectedVerse.verse_number}
                </Text>
                <Text style={styles.verseText}>{selectedVerse.text_hd}</Text>
              </View>
            </ImageBackground> */}
            <View style={styles.cardContainer}>
              <Image
                source={{
                  uri: imageUri,
                }}
                style={StyleSheet.absoluteFill}
                blurRadius={blurRadius}
              />

              <View style={styles.darkenLayer}>
                <Text style={[styles.verseTitle, {color: selectedColor.hex}]}>
                  {bookName} {chapterNumber}:{selectedVerse.number}
                </Text>
                <Text style={[styles.verseText, {color: selectedColor.hex}]}>{selectedVerse.text_hd}</Text>
              </View>
            </View>
          </ViewShot>

          <View style={{marginVertical: 20}}>
            <Text
              style={styles.titleText}>
              Background Blur Effect: {blurRadius}%
            </Text>
            <Slider
              value={blurRadius}
              onValueChange={value => setBlurRadius(value)}
              minimumValue={0}
              maximumValue={25}
              step={1}
              minimumTrackTintColor={AppColors.primary || '#4791db'}
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor={AppColors.primary || '#4791db'}
              style={styles.slider}
            />
          </View>

          <FontColorPicker
            selectedColor={selectedColor.hex}
            style={styles.colorPicker}
            onSelect={color => setSelectedColor(color)}
          />
        </View>

        <View style={styles.shareModalFooter}>
          <TouchableOpacity
            style={styles.shareModalCancelButton}
            onPress={handleCancelPress}>
            <Text style={styles.shareModalFooterButtonText}>
              Cancel
            </Text>  
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareModalOKButton}
            onPress={handleSharePress}>
            <Text style={styles.shareModalFooterButtonText}>Share Image</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shareModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000080',
  },
  shareModalContentContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  shareModalHeader: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 10,
  },
  shareModalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: AppColors.appTextBlack,
  },
  shareModalCloseButton: {
    fontSize: 16,
    color: AppColors.appTextBlack,
  },
  shareModalContent: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  shareModalContentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.appTextBlack,
    marginBottom: 13,
  },
  shareModalContentList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareModalContentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 10,
  },
  shareModalFooter: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  shareModalOKButton: {
    backgroundColor: AppColors.primaryDark,
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareModalCancelButton: {
    backgroundColor: AppColors.lightGrey,
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareModalFooterButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shareModalContentItemText: {
    fontSize: 16,
    color: AppColors.appTextBlack,
    marginBottom: 35,
  },
  colorPicker: {
    marginBottom: 25,
  },
  absoluteBackground: {
    width: '100%',
    height: Dimensions.get('window').width * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  glassOverlay: {
    width: '90%',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    // The trick is the combination of a light background and a border
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  darkenLayer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  verseTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  verseText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  cardContainer: {
    width: Dimensions.get('window').width * 0.8,
    height: 300,
    // borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'center',
  },

  slider: {
    width: Dimensions.get('window').width * 0.8,
    alignSelf: 'center',
    height: 40,
    marginHorizontal: 8,
  },
  imageImportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AppColors.primaryTint,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  titleText: {
    fontSize: 14,
    marginBottom: 10,
    color: AppColors.appTextBlack,
    alignSelf: 'flex-start',
  }
});

export default ShareModal;
