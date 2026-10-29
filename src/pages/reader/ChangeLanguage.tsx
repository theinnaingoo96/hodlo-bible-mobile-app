import { useDispatch, useSelector } from 'react-redux';
import React from 'react';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import AppHeader from '../../components/AppHeader';
import { AppColors } from '../../constants/Color';
import { languages } from '../../constants/Data';
import { setLoading, setSelectedLanguages, setToast } from '../../store/slices/deviceSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ChangeLanguage = () => {
    const dispatch = useDispatch();
    const device = useSelector((state: any) => state.device);
    const insets = useSafeAreaInsets();

    const selectedCodes: string[] = device.selectedLanguages && device.selectedLanguages.length > 0
        ? device.selectedLanguages
        : (device.language && device.language !== 'hodlo' && device.language !== 'hd'
            ? ['hd', device.language]
            : ['hd']);

    const handleLanguagePress = (code: string) => {
        const isSelected = selectedCodes.includes(code);
        // dispatch(setLoading(true));
        if (isSelected) {
            // Cannot deselect the only selected language
            if (selectedCodes.length === 1) {
                dispatch(setToast({
                    show: true,
                    message: 'At least one language must be selected',
                    type: 'warning',
                    duration: 2000,
                }));
                return;
            }
            const updated = selectedCodes.filter(c => c !== code);
            dispatch(setSelectedLanguages(updated));
            // dispatch(setLoading(false));
            dispatch(setToast({
                show: true,
                message: 'Language updated',
                type: 'success',
                duration: 1500,
            }));
        } else {
            // Check max 2 languages
            if (selectedCodes.length >= 2) {
                dispatch(setToast({
                    show: true,
                    message: 'You can select at most 2 languages. Please unselect one first.',
                    type: 'warning',
                    duration: 2500,
                }));
                return;
            }
            const updated = [...selectedCodes, code];
            dispatch(setSelectedLanguages(updated));
            // dispatch(setLoading(false));
            dispatch(setToast({
                show: true,
                message: 'Language updated',
                type: 'success',
                duration: 1500,
            }));
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <AppHeader title="Change Language" backButton={true} />
            <View style={[styles.contentContainer, { backgroundColor: device.theme ? AppColors.appBackgroundGrey : AppColors.appBackgroundDarkTint }]}>
                <Text style={[styles.subtitle, { color: device.theme ? AppColors.darkGrey : AppColors.lightGrey }]}>
                    Select 1 or 2 languages ({selectedCodes.length}/2 selected)
                </Text>
                {languages.map((language: any, index: number) => {
                    const isSelected = selectedCodes.includes(language.code);
                    return (
                        <TouchableOpacity
                            key={'language-' + index}
                            style={[
                                styles.languageButton,
                                { backgroundColor: isSelected ? AppColors.primaryTint : 'transparent' }
                            ]}
                            onPress={() => handleLanguagePress(language.code)}
                        >
                            <Text style={[styles.languageButtonText, { color: device.theme ? AppColors.primaryDark : AppColors.appTextWhite }]}>
                                {language.name}
                            </Text>
                            {isSelected && (
                                <FontAwesome6
                                    name="check"
                                    iconStyle="solid"
                                    color={device.theme ? AppColors.primaryDark : AppColors.appTextWhite}
                                    size={20}
                                />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: '100%',
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    contentContainer: {
        flex: 1,
        width: '100%',
        padding: 16,
        flexDirection: 'column',
        gap: 8,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },
    languageButton: {
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    languageButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ChangeLanguage;