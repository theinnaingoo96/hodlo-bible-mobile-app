import React, { useEffect, useRef, useState } from 'react';
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
  ScrollView,
} from 'react-native';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';
import Slider from '@react-native-community/slider';
import { launchImageLibrary } from 'react-native-image-picker';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

import CloseIcon from '../icons/CloseIcon';
import { AppColors } from '../../constants/Color';
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

  const [editingMode, setEditingMode] = useState<'text' | 'font' | 'ratio' | 'background' | 'adjust'>('ratio');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4'>('1:1');
  const [selectedColor, setSelectedColor] = useState({ name: 'White', hex: '#FFFFFF', code: '#FFFFFF' });
  const [blurRadius, setBlurRadius] = useState(5);
  const [fontSize, setFontSize] = useState(20);
  const [fontFamily, setFontFamily] = useState('Pretendard-Bold');
  const [textAlign, setTextAlign] = useState<'center' | 'left' | 'right'>('center');
  const [brightness, setBrightness] = useState(0.4); // For dark overlay
  const [imageUri, setImageUri] = useState<any>('https://images.unsplash.com/photo-1441974231531-c6227db76b6e');
  const [textVersion, setTextVersion] = useState<'hd' | 'en' | 'mm'>('hd');

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const headerHeight = Platform.OS === 'ios' ? 100 : 80;
  const navHeight = 80;
  const controlHeight = 160;

  const availableHeight = screenHeight - headerHeight - navHeight - controlHeight - 40;
  const previewWidth = screenWidth * 0.95;
  const targetHeight = aspectRatio === '1:1' ? previewWidth : previewWidth * (4 / 3);

  // Scale down if target height exceeds available height
  const scale = targetHeight > availableHeight ? availableHeight / targetHeight : 1;
  const previewHeight = targetHeight * scale;
  const finalPreviewWidth = previewWidth * scale;

  console.log('[ShareModal]selectedVerse', selectedVerse);

  const handleSharePress = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current?.capture();
        const result = await Share.open({
          url: uri || '',
          type: 'image/png',
          message: 'Shared from Gathengpu Dlo App',
        });
        setShareModalVisible(false);
      }
    } catch (error) {
      console.error('Sharing failed', error);
      setShareModalVisible(false);
    }
  };

  const handleImportImagePress = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo' });
      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
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
      <View style={styles.shareModalHeader}>
        <TouchableOpacity onPress={handleCancelPress} style={styles.iconBtn}>
          <FontAwesome6
            name="chevron-left"
            iconStyle="solid"
            size={20}
            color={AppColors.primaryDark} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
          <TouchableOpacity onPress={handleSharePress} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Preview Area */}
      <View style={[styles.previewContainer, { width: '100%' }]}>
        <ViewShot ref={viewShotRef}
          options={{ format: 'png', quality: 1.0 }}>
          <View style={[styles.cardContainer, { width: finalPreviewWidth, height: previewHeight }]}>
            <Image
              source={{ uri: imageUri }}
              style={StyleSheet.absoluteFill}
              blurRadius={blurRadius}
            />
            <View style={[styles.darkenLayer, { backgroundColor: `rgba(0,0,0,${brightness})` }]}>
              <Text style={[
                styles.verseText,
                {
                  color: selectedColor.hex,
                  fontSize: fontSize * scale,
                  fontFamily: fontFamily,
                  textAlign: textAlign,
                  width: '90%'
                }
              ]}>
                {selectedVerse ? selectedVerse[`text_${textVersion}`] : ''}
              </Text>
              <Text style={[
                styles.verseTitle,
                {
                  color: selectedColor.hex,
                  fontSize: 16 * scale,
                  fontFamily: fontFamily,
                  marginTop: 15 * scale,
                }
              ]}>
                {bookName} {chapterNumber}:{selectedVerse ? selectedVerse.number : ''}
              </Text>
            </View>
          </View>
        </ViewShot>
      </View>

      {/* Editing Controls */}
      <View style={styles.controlCenter}>
        <ScrollView
          contentContainerStyle={styles.modeControlsContainer}
          showsVerticalScrollIndicator={false}>
          {editingMode === 'ratio' && (
            <View style={styles.modeControls}>
              <TouchableOpacity
                style={[styles.ratioOption, aspectRatio === '1:1' && styles.activeRatio]}
                onPress={() => setAspectRatio('1:1')}>
                <Text style={styles.ratioText}>1:1</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ratioOption, aspectRatio === '3:4' && styles.activeRatio]}
                onPress={() => setAspectRatio('3:4')}>
                <Text style={styles.ratioText}>3:4</Text>
              </TouchableOpacity>
            </View>
          )}

          {editingMode === 'text' && (
            <View style={styles.modeControlsSliders}>
              <View style={styles.sliderRow}>
                <View style={styles.sliderIconBox}>
                  <FontAwesome6 name="text-height" iconStyle="solid" size={14} color={AppColors.appTextBlack} />
                </View>
                <Slider
                  value={fontSize}
                  onValueChange={setFontSize}
                  minimumValue={14}
                  maximumValue={40}
                  step={1}
                  style={styles.modeSlider}
                  minimumTrackTintColor={AppColors.primary}
                  thumbTintColor={AppColors.primary}
                />
              </View>
              <View style={styles.segmentedContainer}>
                {(['left', 'center', 'right'] as const).map((align) => (
                  <TouchableOpacity
                    key={align}
                    onPress={() => setTextAlign(align)}
                    style={[
                      styles.segmentedBtn,
                      textAlign === align && styles.activeSegmentedBtn
                    ]}>
                    <FontAwesome6
                      name={`align-${align}`}
                      iconStyle="solid"
                      size={16}
                      color={textAlign === align ? 'white' : AppColors.appTextBlack}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.segmentedContainer}>
                {[
                  { label: 'Ho Dlo', value: 'hd' },
                  { label: 'Myanmar', value: 'mm' },
                  { label: 'English', value: 'en' },
                ].map((v) => (
                  <TouchableOpacity
                    key={v.value}
                    onPress={() => setTextVersion(v.value as any)}
                    style={[
                      styles.segmentedBtn,
                      textVersion === v.value && styles.activeSegmentedBtn
                    ]}>
                    <Text style={[
                      styles.versionText,
                      textVersion === v.value && { color: 'white' }
                    ]}>{v.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {editingMode === 'font' && (
            <View style={styles.fontModeWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.fontScrollContent}>
                {[
                  { name: 'Pretendard', id: 'Pretendard-Bold' },
                  { name: 'Noto Sans', id: 'NotoSansMyanmar-Regular' },
                  { name: 'Pyidaungsu', id: 'Pyidaungsu-Bold' },
                ].map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    onPress={() => setFontFamily(f.id)}
                    style={[
                      styles.fontCard,
                      fontFamily === f.id && styles.activeFontCard
                    ]}>
                    <Text style={[
                      styles.fontCardPreview,
                      { fontFamily: f.id },
                      fontFamily === f.id && { color: 'white' }
                    ]}>Aa</Text>
                    <Text style={[
                      styles.fontCardName,
                      fontFamily === f.id && { color: 'white' }
                    ]}>{f.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {editingMode === 'background' && (
            <View style={styles.modeControlsScroll}>
              <TouchableOpacity style={styles.importBtn} onPress={handleImportImagePress}>
                <FontAwesome6 name="image" iconStyle="solid" size={18} color={AppColors.appTextBlack} />
                <Text style={styles.importBtnText}>Change Background</Text>
              </TouchableOpacity>
              <FontColorPicker
                showLabel={false}
                selectedColor={selectedColor.hex}
                onSelect={setSelectedColor}
                style={styles.subColorPicker}
                isDarkMode={false}
              />
            </View>
          )}

          {editingMode === 'adjust' && (
            <View style={styles.modeControlsSliders}>
              <View style={styles.sliderRow}>
                <FontAwesome6 name="sun"
                  iconStyle="solid" size={16} color={AppColors.appTextBlack} />
                <Slider
                  value={brightness}
                  onValueChange={setBrightness}
                  minimumValue={0}
                  maximumValue={0.9}
                  style={styles.modeSlider}
                  minimumTrackTintColor={AppColors.primary}
                  thumbTintColor={AppColors.primary}
                />
              </View>
              <View style={styles.sliderRow}>
                <FontAwesome6 name="droplet"
                  iconStyle="solid" size={16} color={AppColors.appTextBlack} />
                <Slider
                  value={blurRadius}
                  onValueChange={setBlurRadius}
                  minimumValue={0}
                  maximumValue={20}
                  style={styles.modeSlider}
                  minimumTrackTintColor={AppColors.primary}
                  thumbTintColor={AppColors.primary}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => setEditingMode('text')} style={[styles.navItem, editingMode === 'text' && styles.activeNavItem]}>
          {/* <Text style={styles.navIconText}>Tt</Text> */}
          <FontAwesome6 name="font-awesome" iconStyle="solid" size={20} color={AppColors.appTextBlack} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setEditingMode('font')} style={[styles.navItem, editingMode === 'font' && styles.activeNavItem]}>
          {/* <Text style={styles.navIconTextLarge}>AA</Text> */}
          <FontAwesome6 name="font" iconStyle="solid" size={20} color={AppColors.appTextBlack} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setEditingMode('ratio')} style={[styles.navItem, editingMode === 'ratio' && styles.activeNavItem]}>
          <FontAwesome6 name="crop"
            iconStyle="solid" size={20} color={AppColors.appTextBlack} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setEditingMode('background')} style={[styles.navItem, editingMode === 'background' && styles.activeNavItem]}>
          <FontAwesome6 name="image"
            iconStyle="solid" size={20} color={AppColors.appTextBlack} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setEditingMode('adjust')} style={[styles.navItem, editingMode === 'adjust' && styles.activeNavItem]}>
          <FontAwesome6 name="sliders"
            iconStyle="solid" size={20} color={AppColors.appTextBlack} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shareModalContainer: {
    flex: 1,
    backgroundColor: AppColors.appBackgroundGrey,
    flexDirection: 'column',
  },
  shareModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  iconBtn: {
    padding: 5,
  },
  saveBtn: {
    backgroundColor: AppColors.primaryDark,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
  },
  saveBtnText: {
    color: 'white',
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    backgroundColor: '#1E1E1E',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkenLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  verseText: {
    color: 'white',
    textAlign: 'center',
    lineHeight: 32,
  },
  verseTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  controlCenter: {
    height: 200,
    justifyContent: 'center',
  },
  modeControlsContainer: {
    paddingVertical: 10,
    justifyContent: 'center',
  },
  modeControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  modeControlsSliders: {
    paddingHorizontal: 30,
    gap: 15,
  },
  modeControlsScroll: {
    alignItems: 'center',
    gap: 10,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  modeSlider: {
    flex: 1,
    height: 40,
  },
  sliderIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 10,
    padding: 4,
    marginTop: 5,
  },
  segmentedBtn: {
    flex: 1,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  activeSegmentedBtn: {
    backgroundColor: AppColors.primaryDark,
  },
  fontModeWrapper: {
    // height: 450,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'red'
  },
  fontScrollContent: {
    paddingHorizontal: 20,
    gap: 15,
  },
  fontCard: {
    width: 90,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  activeFontCard: {
    backgroundColor: AppColors.primaryDark,
    borderColor: AppColors.primaryDark,
  },
  fontCardPreview: {
    fontSize: 24,
    color: AppColors.appTextBlack,
    marginBottom: 4,
  },
  fontCardName: {
    fontSize: 10,
    color: 'gray',
    fontWeight: '500',
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.appTextBlack,
  },
  ratioOption: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: AppColors.appTextBlack,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeRatio: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  ratioText: {
    color: AppColors.appTextBlack,
    fontWeight: 'bold',
  },
  alignRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginTop: 10,
  },
  alignBtn: {
    padding: 8,
    borderRadius: 8,
  },
  activeAlignBtn: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  fontOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  fontOptionText: {
    color: AppColors.appTextBlack,
    fontSize: 16,
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: AppColors.primaryDark,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  importBtnText: {
    color: 'white',
    fontSize: 14,
  },
  subColorPicker: {
    height: 60,
    marginTop: 10
  },
  bottomNav: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: AppColors.appBackgroundGrey,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  navItem: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  activeNavItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  navIconText: {
    color: AppColors.appTextBlack,
    fontSize: 22,
    fontWeight: 'bold',
  },
  navIconTextLarge: {
    color: AppColors.appTextBlack,
    fontSize: 24,
    fontWeight: '300',
  },
});

export default ShareModal;
