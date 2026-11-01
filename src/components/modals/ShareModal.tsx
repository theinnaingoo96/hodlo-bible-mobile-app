import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Switch,
  StatusBar,
  Keyboard,
} from 'react-native';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';
import Slider from '@react-native-community/slider';
import { launchImageLibrary } from 'react-native-image-picker';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import StrokedText from '../StrokedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '../../constants/Color';
import FontColorPicker from '../FontColorPicker';

// Curated high quality background presets
const PRESET_BACKGROUNDS = [
  { id: 'forest', name: 'Forest', uri: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1080' },
  { id: 'sunrise', name: 'Sunrise', uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1080' },
  { id: 'night', name: 'Stars', uri: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1080' },
  { id: 'mountain', name: 'Mountain', uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1080' },
  { id: 'ocean', name: 'Ocean', uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1080' },
  { id: 'sunset', name: 'Sunset', uri: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?q=80&w=1080' },
  { id: 'desert', name: 'Desert', uri: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1080' },
];

const ASPECT_RATIOS: Array<{ id: '1:1' | '4:5' | '9:16' | '16:9'; label: string; icon: string }> = [
  { id: '1:1', label: '1:1', icon: 'Square' },
  { id: '4:5', label: '4:5', icon: 'Portrait' },
  { id: '9:16', label: '9:16', icon: 'Story' },
  { id: '16:9', label: '16:9', icon: 'Landscape' },
];

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
  const insets = useSafeAreaInsets();
  const viewShotRef = useRef<any>(null);

  // Editing tabs
  const [editingMode, setEditingMode] = useState<'text' | 'style' | 'background' | 'adjust' | 'ratio'>('text');

  // Text content & version
  const [textVersion, setTextVersion] = useState<'hd' | 'en' | 'mm'>('hd');
  const getInitialVerseText = (version: 'hd' | 'en' | 'mm') => {
    if (!selectedVerse) return '';
    return selectedVerse[`text_${version}`] || selectedVerse.text_hd || selectedVerse.text_en || selectedVerse.text_mm || '';
  };
  const [customText, setCustomText] = useState(getInitialVerseText('hd'));
  const [customReference, setCustomReference] = useState(
    `${bookName || ''} ${chapterNumber || ''}${selectedVerse?.number ? `:${selectedVerse.number}` : ''}`.trim(),
  );
  const [showReference, setShowReference] = useState(true);

  // Fullscreen text editor modal state
  const [isTextEditModalOpen, setIsTextEditModalOpen] = useState(false);
  const [tempText, setTempText] = useState(customText);
  const [tempReference, setTempReference] = useState(customReference);

  // Typography & Styling
  const [selectedColor, setSelectedColor] = useState({ name: 'White', hex: '#FFFFFF', code: '#FFFFFF' });
  const [fontSize, setFontSize] = useState(20);
  const [fontFamily, setFontFamily] = useState('Pretendard-Bold');
  const [textAlign, setTextAlign] = useState<'center' | 'left' | 'right'>('center');

  // Stroke
  const [strokeEnabled, setStrokeEnabled] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [selectedStrokeColor, setSelectedStrokeColor] = useState({ name: 'Black', hex: '#000000', code: '#000000' });

  // Background & Adjust
  const [imageUri, setImageUri] = useState<string>(PRESET_BACKGROUNDS[0].uri);
  const [brightness, setBrightness] = useState(0.4); // Darken overlay
  const [blurRadius, setBlurRadius] = useState(4);

  // Aspect Ratio
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '9:16' | '16:9'>('1:1');

  useEffect(() => {
    setCustomText(getInitialVerseText(textVersion));
    setCustomReference(
      `${bookName || ''} ${chapterNumber || ''}${selectedVerse?.number ? `:${selectedVerse.number}` : ''}`.trim(),
    );
  }, [selectedVerse, bookName, chapterNumber]);

  // Dimension scaling calculations for preview
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const headerHeight = 52 + insets.top;
  const navHeight = 60 + insets.bottom;
  const controlHeight = 195;
  const availableHeight = Math.max(180, screenHeight - headerHeight - navHeight - controlHeight - 16);

  const maxPreviewWidth = screenWidth * 0.92;
  let targetWidth = maxPreviewWidth;
  let targetHeight = maxPreviewWidth;

  if (aspectRatio === '1:1') {
    targetWidth = maxPreviewWidth;
    targetHeight = maxPreviewWidth;
  } else if (aspectRatio === '4:5') {
    targetWidth = maxPreviewWidth;
    targetHeight = maxPreviewWidth * (5 / 4);
  } else if (aspectRatio === '9:16') {
    targetWidth = maxPreviewWidth;
    targetHeight = maxPreviewWidth * (16 / 9);
  } else if (aspectRatio === '16:9') {
    targetWidth = maxPreviewWidth;
    targetHeight = maxPreviewWidth * (9 / 16);
  }

  const scale = targetHeight > availableHeight ? availableHeight / targetHeight : 1;
  const previewHeight = targetHeight * scale;
  const finalPreviewWidth = targetWidth * scale;

  const handleSharePress = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current?.capture();
        await Share.open({
          url: uri || '',
          type: 'image/png',
          message: 'Shared from Gathengpu Dlo App',
        });
        setShareModalVisible(false);
      }
    } catch (error) {
      console.error('Sharing failed', error);
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

  const handleVersionChange = (version: 'hd' | 'en' | 'mm') => {
    setTextVersion(version);
    const versionText = getInitialVerseText(version);
    if (versionText) {
      setCustomText(versionText);
    }
  };

  const openTextEditor = () => {
    setTempText(customText);
    setTempReference(customReference);
    setIsTextEditModalOpen(true);
  };

  const saveTextEditor = () => {
    Keyboard.dismiss();
    setCustomText(tempText);
    setCustomReference(tempReference);
    setIsTextEditModalOpen(false);
  };

  const cancelTextEditor = () => {
    Keyboard.dismiss();
    setIsTextEditModalOpen(false);
  };

  const resetToOriginalScripture = () => {
    const original = getInitialVerseText(textVersion);
    setTempText(original);
    setTempReference(
      `${bookName || ''} ${chapterNumber || ''}${selectedVerse?.number ? `:${selectedVerse.number}` : ''}`.trim(),
    );
  };

  return (
    <View style={styles.shareModalContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={[styles.shareModalHeader, { paddingTop: insets.top, height: 52 + insets.top }]}>
        <TouchableOpacity
          onPress={() => setShareModalVisible(false)}
          style={styles.iconBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <FontAwesome6 name="xmark" iconStyle="solid" size={20} color={AppColors.appTextBlack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photo Verse Editor</Text>
        <TouchableOpacity onPress={handleSharePress} style={styles.saveBtn}>
          <FontAwesome6 name="share-nodes" iconStyle="solid" size={14} color="white" style={{ marginRight: 6 }} />
          <Text style={styles.saveBtnText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* ── Preview Canvas ─────────────────────────────────────────── */}
      <View style={styles.previewContainer}>
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={openTextEditor}
            style={[styles.cardContainer, { width: finalPreviewWidth, height: previewHeight }]}>
            <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} blurRadius={blurRadius} resizeMode="cover" />
            <View style={[styles.darkenLayer, { backgroundColor: `rgba(0,0,0,${brightness})` }]}>
              {/* Verse Text with optional Stroke */}
              <StrokedText
                text={customText || 'Tap to add verse text'}
                color={selectedColor.hex}
                strokeColor={selectedStrokeColor.hex}
                strokeWidth={strokeEnabled ? Math.max(1, Math.round(strokeWidth * scale)) : 0}
                fontSize={fontSize * scale}
                fontFamily={fontFamily}
                textAlign={textAlign}
                lineHeight={Math.round(fontSize * scale * 1.45)}
                style={styles.verseText}
              />

              {/* Reference Title */}
              {showReference && customReference ? (
                <View style={{ marginTop: 14 * scale, width: '100%' }}>
                  <StrokedText
                    text={customReference}
                    color={selectedColor.hex}
                    strokeColor={selectedStrokeColor.hex}
                    strokeWidth={strokeEnabled ? Math.max(1, Math.round(strokeWidth * 0.7 * scale)) : 0}
                    fontSize={15 * scale}
                    fontFamily={fontFamily}
                    textAlign={textAlign}
                    numberOfLines={1}
                    style={styles.verseTitle}
                  />
                </View>
              ) : null}
            </View>

            {/* Quick edit hint badge */}
            <View style={styles.editHintBadge}>
              <FontAwesome6 name="pen" iconStyle="solid" size={10} color="rgba(255,255,255,0.8)" />
              <Text style={styles.editHintText}>Tap text to edit</Text>
            </View>
          </TouchableOpacity>
        </ViewShot>
      </View>

      {/* ── Control Center ─────────────────────────────────────────── */}
      <View style={styles.controlCenter}>
        <ScrollView
          contentContainerStyle={styles.modeControlsContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* ── TAB 1: TEXT ── */}
          {editingMode === 'text' && (
            <View style={styles.tabContent}>
              {/* Edit text button */}
              <TouchableOpacity style={styles.primaryActionButton} onPress={openTextEditor}>
                <FontAwesome6 name="pen-to-square" iconStyle="solid" size={15} color="#fff" />
                <Text style={styles.primaryActionButtonText}>Edit / Add Custom Text</Text>
              </TouchableOpacity>

              {/* Language Version Selector */}
              <View style={styles.subControlRow}>
                <Text style={styles.controlSubLabel}>Language:</Text>
                <View style={styles.segmentedContainer}>
                  {[
                    { label: 'Ho Dlo', value: 'hd' },
                    { label: 'Myanmar', value: 'mm' },
                    { label: 'English', value: 'en' },
                  ].map(v => (
                    <TouchableOpacity
                      key={v.value}
                      onPress={() => handleVersionChange(v.value as any)}
                      style={[styles.segmentedBtn, textVersion === v.value && styles.activeSegmentedBtn]}>
                      <Text style={[styles.versionText, textVersion === v.value && { color: 'white' }]}>
                        {v.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Font Size & Alignment */}
              <View style={styles.sliderRow}>
                <FontAwesome6 name="text-height" iconStyle="solid" size={15} color={AppColors.appTextBlack} />
                <Slider
                  value={fontSize}
                  onValueChange={setFontSize}
                  minimumValue={13}
                  maximumValue={38}
                  step={1}
                  style={styles.modeSlider}
                  minimumTrackTintColor={AppColors.primaryDark}
                  thumbTintColor={AppColors.primaryDark}
                />
                <Text style={styles.sliderValueText}>{fontSize}pt</Text>
              </View>

              {/* Text Alignment */}
              <View style={styles.subControlRow}>
                <Text style={styles.controlSubLabel}>Align:</Text>
                <View style={styles.segmentedContainer}>
                  {(['left', 'center', 'right'] as const).map(align => (
                    <TouchableOpacity
                      key={align}
                      onPress={() => setTextAlign(align)}
                      style={[styles.segmentedBtn, textAlign === align && styles.activeSegmentedBtn]}>
                      <FontAwesome6
                        name={`align-${align}`}
                        iconStyle="solid"
                        size={15}
                        color={textAlign === align ? 'white' : AppColors.appTextBlack}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* ── TAB 2: STYLE (Font, Color, Stroke) ── */}
          {editingMode === 'style' && (
            <View style={styles.tabContent}>
              {/* Font Family Selector */}
              <View style={styles.subSection}>
                <Text style={styles.controlSubLabel}>Font Family:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                  {[
                    { name: 'Pretendard Bold', id: 'Pretendard-Bold' },
                    { name: 'Pretendard Reg', id: 'Pretendard-Regular' },
                    { name: 'Noto Sans', id: 'NotoSansMyanmar-Regular' },
                    { name: 'Noto SemiBold', id: 'NotoSansMyanmar-SemiBold' },
                    { name: 'Pyidaungsu Bold', id: 'Pyidaungsu-Bold' },
                    { name: 'Pyidaungsu Reg', id: 'Pyidaungsu-Regular' },
                  ].map(f => (
                    <TouchableOpacity
                      key={f.id}
                      onPress={() => setFontFamily(f.id)}
                      style={[styles.fontCard, fontFamily === f.id && styles.activeFontCard]}>
                      <Text style={[styles.fontCardPreview, { fontFamily: f.id }, fontFamily === f.id && { color: 'white' }]}>
                        Aa
                      </Text>
                      <Text style={[styles.fontCardName, fontFamily === f.id && { color: 'white' }]}>
                        {f.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Font Color */}
              <View style={styles.subSection}>
                <Text style={styles.controlSubLabel}>Text Color:</Text>
                <FontColorPicker
                  showLabel={false}
                  selectedColor={selectedColor.hex}
                  onSelect={setSelectedColor}
                  style={styles.colorPickerCompact}
                  isDarkMode={false}
                />
              </View>

              {/* Stroke Section */}
              <View style={styles.strokeBox}>
                <View style={styles.switchRow}>
                  <View style={styles.strokeLabelRow}>
                    <FontAwesome6 name="pen-nib" iconStyle="solid" size={14} color={AppColors.appTextBlack} />
                    <Text style={styles.strokeTitle}>Text Outline / Stroke</Text>
                  </View>
                  <Switch
                    value={strokeEnabled}
                    onValueChange={setStrokeEnabled}
                    trackColor={{ false: '#D1D5DB', true: AppColors.primaryTint }}
                    thumbColor={strokeEnabled ? AppColors.primaryDark : '#f4f3f4'}
                  />
                </View>

                {strokeEnabled && (
                  <>
                    {/* Stroke Width Slider */}
                    <View style={styles.sliderRow}>
                      <Text style={styles.subLabel}>Width:</Text>
                      <Slider
                        value={strokeWidth}
                        onValueChange={val => setStrokeWidth(Math.round(val))}
                        minimumValue={1}
                        maximumValue={8}
                        step={1}
                        style={styles.modeSlider}
                        minimumTrackTintColor={AppColors.primaryDark}
                        thumbTintColor={AppColors.primaryDark}
                      />
                      <Text style={styles.sliderValueText}>{strokeWidth}px</Text>
                    </View>

                    {/* Stroke Color Picker */}
                    <View style={styles.subSection}>
                      <Text style={styles.subLabel}>Stroke Color:</Text>
                      <FontColorPicker
                        showLabel={false}
                        selectedColor={selectedStrokeColor.hex}
                        onSelect={setSelectedStrokeColor}
                        style={styles.colorPickerCompact}
                        isDarkMode={false}
                      />
                    </View>
                  </>
                )}
              </View>
            </View>
          )}

          {/* ── TAB 3: BACKGROUND (Presets + Upload) ── */}
          {editingMode === 'background' && (
            <View style={styles.tabContent}>
              <TouchableOpacity style={styles.primaryActionButton} onPress={handleImportImagePress}>
                <FontAwesome6 name="folder-open" iconStyle="solid" size={15} color="#fff" />
                <Text style={styles.primaryActionButtonText}>Upload Custom Photo from Gallery</Text>
              </TouchableOpacity>

              <Text style={styles.controlSubLabel}>Preset Backgrounds:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                {PRESET_BACKGROUNDS.map(preset => {
                  const isSelected = imageUri === preset.uri;
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      onPress={() => setImageUri(preset.uri)}
                      style={[styles.presetCard, isSelected && styles.activePresetCard]}>
                      <Image source={{ uri: preset.uri }} style={styles.presetThumbnail} />
                      <Text style={[styles.presetName, isSelected && styles.activePresetName]}>
                        {preset.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* ── TAB 4: ADJUST (Brightness & Blur) ── */}
          {editingMode === 'adjust' && (
            <View style={styles.tabContent}>
              <View style={styles.sliderRow}>
                <FontAwesome6 name="circle-half-stroke" iconStyle="solid" size={16} color={AppColors.appTextBlack} />
                <Text style={styles.subLabel}>Darken Overlay:</Text>
                <Slider
                  value={brightness}
                  onValueChange={setBrightness}
                  minimumValue={0}
                  maximumValue={0.85}
                  style={styles.modeSlider}
                  minimumTrackTintColor={AppColors.primaryDark}
                  thumbTintColor={AppColors.primaryDark}
                />
                <Text style={styles.sliderValueText}>{Math.round(brightness * 100)}%</Text>
              </View>

              <View style={styles.sliderRow}>
                <FontAwesome6 name="droplet" iconStyle="solid" size={16} color={AppColors.appTextBlack} />
                <Text style={styles.subLabel}>Background Blur:</Text>
                <Slider
                  value={blurRadius}
                  onValueChange={val => setBlurRadius(Math.round(val))}
                  minimumValue={0}
                  maximumValue={20}
                  step={1}
                  style={styles.modeSlider}
                  minimumTrackTintColor={AppColors.primaryDark}
                  thumbTintColor={AppColors.primaryDark}
                />
                <Text style={styles.sliderValueText}>{blurRadius}px</Text>
              </View>
            </View>
          )}

          {/* ── TAB 5: RATIO (Aspect Ratio) ── */}
          {editingMode === 'ratio' && (
            <View style={styles.tabContent}>
              <Text style={styles.controlSubLabel}>Canvas Aspect Ratio:</Text>
              <View style={styles.ratioGrid}>
                {ASPECT_RATIOS.map(r => (
                  <TouchableOpacity
                    key={r.id}
                    style={[styles.ratioOptionCard, aspectRatio === r.id && styles.activeRatioCard]}
                    onPress={() => setAspectRatio(r.id)}>
                    <Text style={[styles.ratioLabel, aspectRatio === r.id && styles.activeRatioLabel]}>
                      {r.label}
                    </Text>
                    <Text style={[styles.ratioSubLabel, aspectRatio === r.id && styles.activeRatioSubLabel]}>
                      {r.icon}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      {/* ── Bottom Navigation Bar ──────────────────────────────────── */}
      <View style={[styles.bottomNav, { height: 60 + insets.bottom, paddingBottom: insets.bottom }]}>
        {[
          { mode: 'text', label: 'Text', icon: 'pen-to-square' },
          { mode: 'style', label: 'Style', icon: 'palette' },
          { mode: 'background', label: 'Image', icon: 'image' },
          { mode: 'adjust', label: 'Adjust', icon: 'sliders' },
          { mode: 'ratio', label: 'Ratio', icon: 'crop' },
        ].map(tab => {
          const isActive = editingMode === tab.mode;
          return (
            <TouchableOpacity
              key={tab.mode}
              onPress={() => setEditingMode(tab.mode as any)}
              style={[styles.navItem, isActive && styles.activeNavItem]}>
              <FontAwesome6
                name={tab.icon as any}
                iconStyle="solid"
                size={18}
                color={isActive ? AppColors.primaryDark : AppColors.iconGrey}
              />
              <Text style={[styles.navLabel, isActive && styles.activeNavLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Fullscreen Text Editor Modal ────────────────────────────── */}
      <Modal
        visible={isTextEditModalOpen}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={cancelTextEditor}>
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: AppColors.appBackgroundGrey }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.textEditModalHeader, { paddingTop: insets.top + (Platform.OS === 'ios' ? 4 : 8) }]}>
            <TouchableOpacity onPress={cancelTextEditor} style={styles.modalCancelBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <FontAwesome6 name="arrow-left" iconStyle="solid" size={18} color={AppColors.appTextBlack} />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Edit Verse Text</Text>
            <TouchableOpacity onPress={saveTextEditor} style={styles.modalDoneBtn}>
              <FontAwesome6 name="check" iconStyle="solid" size={14} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.textEditModalBody} keyboardShouldPersistTaps="handled">
            <Text style={styles.editorSectionTitle}>Main Verse Text:</Text>
            <TextInput
              style={styles.textEditInput}
              value={tempText}
              onChangeText={setTempText}
              placeholder="Type or edit verse text here…"
              placeholderTextColor={AppColors.appTextGrey}
              multiline
              autoFocus
              textAlignVertical="top"
            />

            <View style={styles.referenceEditSection}>
              <View style={styles.switchRow}>
                <Text style={styles.editorSectionTitle}>Show Reference:</Text>
                <Switch
                  value={showReference}
                  onValueChange={setShowReference}
                  trackColor={{ false: '#D1D5DB', true: AppColors.primaryTint }}
                  thumbColor={showReference ? AppColors.primaryDark : '#f4f3f4'}
                />
              </View>

              {showReference && (
                <TextInput
                  style={styles.referenceInput}
                  value={tempReference}
                  onChangeText={setTempReference}
                  placeholder="e.g. John 3:16"
                  placeholderTextColor={AppColors.appTextGrey}
                />
              )}
            </View>

            {/* Save & Apply button */}
            <TouchableOpacity style={styles.applyBtn} onPress={saveTextEditor}>
              <FontAwesome6 name="check" iconStyle="solid" size={15} color="#fff" />
              <Text style={styles.applyBtnText}>Save & Apply to Image</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetScriptureBtn} onPress={resetToOriginalScripture}>
              <FontAwesome6 name="rotate-left" iconStyle="solid" size={14} color={AppColors.primaryDark} />
              <Text style={styles.resetScriptureText}>Reset to Original Scripture</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  shareModalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    flexDirection: 'column',
  },
  shareModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    backgroundColor: '#fff',
  },
  headerTitle: {
    color: AppColors.appTextBlack,
    fontSize: 16,
    fontWeight: '700',
  },
  iconBtn: {
    padding: 6,
  },
  saveBtn: {
    backgroundColor: AppColors.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
  },

  // ── Preview Canvas ──────────────────────────────────────────────
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  cardContainer: {
    backgroundColor: '#1E1E1E',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
  },
  darkenLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  verseText: {
    width: '100%',
  },
  verseTitle: {
    fontSize: 15,
    fontWeight: '600',
    width: '100%',
  },
  editHintBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editHintText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    fontWeight: '500',
  },

  // ── Control Center ──────────────────────────────────────────────
  controlCenter: {
    height: 200,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 8,
    elevation: 10,
    paddingTop: 12,
  },
  modeControlsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tabContent: {
    gap: 12,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.primaryDark,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    gap: 8,
  },
  primaryActionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  subControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  controlSubLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.appTextGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.appTextBlack,
    minWidth: 50,
  },
  segmentedContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F2F2F4',
    borderRadius: 12,
    padding: 3,
  },
  segmentedBtn: {
    flex: 1,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 9,
  },
  activeSegmentedBtn: {
    backgroundColor: AppColors.primaryDark,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.appTextBlack,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modeSlider: {
    flex: 1,
    height: 36,
  },
  sliderValueText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.appTextGrey,
    minWidth: 36,
    textAlign: 'right',
  },
  subSection: {
    gap: 6,
  },
  horizontalScroll: {
    gap: 10,
    paddingVertical: 4,
  },

  // ── Font Cards ──────────────────────────────────────────────────
  fontCard: {
    width: 95,
    height: 68,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 4,
  },
  activeFontCard: {
    backgroundColor: AppColors.primaryDark,
    borderColor: AppColors.primaryDark,
  },
  fontCardPreview: {
    fontSize: 20,
    color: AppColors.appTextBlack,
    marginBottom: 2,
  },
  fontCardName: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  colorPickerCompact: {
    // height: 50,
  },

  // ── Stroke Box ──────────────────────────────────────────────────
  strokeBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  strokeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  strokeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.appTextBlack,
  },

  // ── Presets ─────────────────────────────────────────────────────
  presetCard: {
    width: 78,
    height: 85,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  activePresetCard: {
    borderColor: AppColors.primaryDark,
  },
  presetThumbnail: {
    width: '100%',
    height: 60,
  },
  presetName: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 3,
    color: AppColors.appTextBlack,
  },
  activePresetName: {
    color: AppColors.primaryDark,
    fontWeight: '700',
  },

  // ── Ratio Cards ─────────────────────────────────────────────────
  ratioGrid: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  ratioOptionCard: {
    flex: 1,
    height: 70,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  activeRatioCard: {
    backgroundColor: AppColors.primaryDark,
    borderColor: AppColors.primaryDark,
  },
  ratioLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: AppColors.appTextBlack,
  },
  activeRatioLabel: {
    color: '#fff',
  },
  ratioSubLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: AppColors.appTextGrey,
  },
  activeRatioSubLabel: {
    color: 'rgba(255,255,255,0.85)',
  },

  // ── Bottom Navigation ───────────────────────────────────────────
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  activeNavItem: {
    borderTopWidth: 2.5,
    borderTopColor: AppColors.primaryDark,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: AppColors.iconGrey,
  },
  activeNavLabel: {
    color: AppColors.primaryDark,
    fontWeight: '700',
  },

  // ── Text Editor Modal ───────────────────────────────────────────
  textEditModalHeader: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  modalCancelBtn: {
    padding: 6,
  },
  modalCancelText: {
    fontSize: 15,
    color: AppColors.appTextGrey,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.appTextBlack,
  },
  modalDoneBtn: {
    backgroundColor: AppColors.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalDoneText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.primaryDark,
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
    marginTop: 6,
    marginBottom: 12,
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  textEditModalBody: {
    flex: 1,
    padding: 16,
  },
  editorSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.appTextGrey,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textEditInput: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 14,
    fontSize: 16,
    minHeight: 140,
    color: AppColors.appTextBlack,
    lineHeight: 24,
    marginBottom: 20,
  },
  referenceEditSection: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  referenceInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 42,
    fontSize: 14,
    color: AppColors.appTextBlack,
  },
  resetScriptureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    marginBottom: 40,
  },
  resetScriptureText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primaryDark,
  },
});

export default ShareModal;
