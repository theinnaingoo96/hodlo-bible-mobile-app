import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import AppHeader from '../../components/AppHeader';
import { AppColors } from '../../constants/Color';
import { languages } from '../../constants/Data';
import { setLanguage } from '../../store/slices/deviceSlice';

const ChangeLanguage = () => {
    const dispatch = useDispatch();
    const device = useSelector((state: any) => state.device);
    const [languageList, setLanguageList] = useState(languages);
    const [toastVisible, setToastVisible] = useState(false);

    useEffect(() => {
        setLanguageList(languages.map((language) => {
            return {
                ...language,
                selected: language.code === device.language || language.code === "hd"
            }
        }));
    }, []);

    const handleLanguagePress = (code: string) => {
        setToastVisible(true);
        if (code === "hd") {
            setLanguageList(languages.map((language) => {
                return {
                    ...language,
                    selected: language.code === "hd" ? true : false
                }
            }));
            dispatch(setLanguage("hd"));
            return;
        } else {
            setLanguageList(languageList.map((lang: any) => {
                return {
                    ...lang,
                    selected: lang.code === "hd" ? true : lang.code === code ? true : false
                }
            }));
            dispatch(setLanguage(code));
        }
    };

    return (
        <View style={styles.container}>
            <AppHeader title="Change Language" backButton={true} />
            <View style={[styles.contentContainer, { backgroundColor: device.theme ? AppColors.appBackgroundGrey : AppColors.appBackgroundDarkTint }]}>
                {languageList.map((language: any, index: number) => (
                    <TouchableOpacity key={'language-' + index} style={[styles.languageButton, { backgroundColor: language.selected ? AppColors.primaryTint : 'transparent' }]}
                        onPress={() => handleLanguagePress(language.code)}>
                        <Text style={[styles.languageButtonText, { color: device.theme ? AppColors.primaryDark : AppColors.appTextWhite }]}>{language.name}</Text>
                        {
                            language.selected && (
                                <FontAwesome6 name="check" iconStyle="solid" color={device.theme ? AppColors.primaryDark : AppColors.appTextWhite} size={20} />
                            )
                        }
                    </TouchableOpacity>
                ))}
            </View>
            {/* <CustomToast message="Language changed successfully" visible={toastVisible} onHide={() => { setToastVisible(false) }} /> */}
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
        // paddingTop: 55,
        backgroundColor: 'white',
    },
    contentContainer: {
        flex: 1,
        width: '100%',
        padding: 16,
        flexDirection: 'column',
        gap: 6,
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