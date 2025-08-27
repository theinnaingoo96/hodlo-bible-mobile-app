import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppColors } from '../constants/Color';
import Slider from '@react-native-community/slider';
import { constants } from '../constants/Data';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useSelector } from 'react-redux';
import { setReaderFontFamily, setReaderFontSize, setReaderTheme } from '../store/slices/readerSlice';
import { store } from '../store/store';

const ReaderSetting = () => {
    const availableFont = constants.fontFamily;
    const [activeFont, setActiveFont] = useState(1);
    const [activeTheme, setActiveTheme] = useState(1);
    const [activeSize, setActiveSize] = useState(12);
    const reader = useSelector((state: any) => state.reader);

    useEffect(() => {
        setActiveFont(reader.readerSetting.fontFamily);
        setActiveTheme(reader.readerSetting.theme);
        setActiveSize(reader.readerSetting.fontSize);
    }, []);

    const handleFontFamily = (font: number) => {
        setActiveFont(font);
        store.dispatch(setReaderFontFamily(font));
    }

    const handleFontSize = (size: number) => {
        if (size > 11 && size < 20) {
            setActiveSize(size);
            store.dispatch(setReaderFontSize(size));
        }
    }

    const handleTheme = (theme: number) => {
        setActiveTheme(theme);
        store.dispatch(setReaderTheme(theme));
    }

    return (
        <View>
            <Text style={styles.settingTitle}>Font Family</Text>
            <View style={styles.fontFamilyContainer}>
                {availableFont.map((font, index) => (
                    <TouchableOpacity key={'font-' + font.id} style={[styles.fontFamilyItem, {
                        borderColor: font.id == activeFont ? AppColors.primaryDark : AppColors.iconGrey,
                        borderWidth: font.id == activeFont ? 2 : 1,
                    }]}
                        onPress={() => handleFontFamily(font.id)}>
                        <Text style={[styles.fontFamilyItemText, {
                            color: font.id == activeFont ? AppColors.primaryDark : AppColors.iconGrey,
                            fontFamily: font.regular
                        }]}>Aa</Text>
                        <Text style={{
                            fontSize: 16, color: font.id == activeFont ? AppColors.primaryDark : AppColors.iconGrey,
                            fontFamily: font.regular, lineHeight: 15,
                        }}>{font.name}</Text>
                        {
                            font.id == activeFont && <View style={styles.selector} />
                        }
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.fontSizeRow}>
                <Text style={styles.settingTitle}>Font Size</Text>
                <View style={styles.fontSizeContainer}>
                    <TouchableOpacity style={styles.fontSizeItem} onPress={() => handleFontSize(activeSize - 1)} >
                        <FontAwesome6 name="minus" iconStyle="solid" color={AppColors.appTextWhite} size={20} />
                    </TouchableOpacity>
                    <Text style={styles.activeSizeText}>
                        {activeSize}
                    </Text>

                    <TouchableOpacity style={styles.fontSizeItem} onPress={() => handleFontSize(activeSize + 1)} >
                        <FontAwesome6 name="plus" iconStyle="solid" color={AppColors.appTextWhite} size={20} />
                    </TouchableOpacity>
                </View>
            </View>
            {/* <Slider
                style={{ width: "100%", height: 30 }}
                minimumValue={0}
                maximumValue={1}
                step={0.1}
                thumbTintColor={AppColors.primaryDark}
                minimumTrackTintColor={AppColors.primaryDark}
                maximumTrackTintColor={AppColors.primaryTint}
            /> */}

            <Text style={styles.settingTitle}>Theme</Text>
            <View style={styles.fontFamilyContainer}>
                {constants.theme.map((theme, index) => (
                    <TouchableOpacity key={'theme-' + theme.id} style={[styles.themeItem,
                    {
                        borderColor: theme.id == activeTheme ? AppColors.primaryDark : AppColors.iconGrey,
                        borderWidth: theme.id == activeTheme ? 2 : 1,
                        backgroundColor: theme.backgroundColor,
                    }]}
                        onPress={() => handleTheme(theme.id)}>
                        <Text style={[styles.themeItemText, {
                            color: theme.fontColor,
                        }]}>{theme.name}</Text>
                        {
                            theme.id == activeTheme && <View style={styles.selector} />
                        }
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    fontFamilyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 50,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: AppColors.appTextBlack,
        marginBottom: 10,
    },
    fontFamilyItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: AppColors.tabTextGrey,
        borderRadius: 10,
        paddingVertical: 20,
        height: 100,
    },
    fontFamilyItemText: {
        fontSize: 26,
        color: AppColors.primaryDark,
    },
    themeItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: AppColors.tabTextGrey,
        borderRadius: 10,
        paddingVertical: 20,
        height: 60,
    },
    themeItemText: {
        fontSize: 16,
        lineHeight: 20,
    },
    selector: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: AppColors.primaryDark,
        position: 'absolute',
        bottom: -15,
    },
    fontSizeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    fontSizeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 15,
        marginBottom: 30
    },
    fontSizeItem: {
        width: 42,
        height: 42,
        borderRadius: 5,
        backgroundColor: AppColors.iconGrey,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: AppColors.appTextBlack,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    fontSizeText: {
        fontSize: 20,
        color: AppColors.appTextBlack,
        textAlign: 'center',
    },
    activeSizeText: {
        fontSize: 16,
        color: AppColors.appTextBlack,
        textAlign: 'center',
    }
});

export default ReaderSetting;