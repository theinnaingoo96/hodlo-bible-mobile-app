import DeviceInfo from 'react-native-device-info';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from "@react-navigation/native";
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

import { setLoading, setTheme } from '../../store/slices/deviceSlice';
// import { clearSearchHistory } from '../../services/DatabaseService';
import UpdateIcon from '../../components/icons/setting/UpdateIcon';
import RecentIcon from '../../components/icons/setting/RecentIcon';
import TermsIcon from '../../components/icons/setting/TermsIcon';
import MoonIcon from '../../components/icons/setting/MoonIcon';
import InfoIcon from '../../components/icons/setting/InfoIcon';
import SunIcon from '../../components/icons/setting/SunIcon';
import CustomAlert from '../../components/CustomAlert';
import { AppColors } from '../../constants/Color';
import DatabaseService from '../../services/DataService';

const Setting = () => {
    const device = useSelector((state: any) => state.device);
    const dispatch = useDispatch();
    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        console.log('device', device);
    }, [device]);

    const clear = async () => {
        setIsAlertVisible(true);
    }

    const handleConfirm = async () => {
        const res = await DatabaseService.getInstance().clearSearchHistoryAll();
        console.log('res', res);
        setIsAlertVisible(false);
    }

    const handleTheme = () => {
        dispatch(setLoading(true));
        setTimeout(() => {
            dispatch(setTheme(!device.theme));
            dispatch(setLoading(false));
        }, 1000);
    }

    return (
        <View style={[styles.container, { backgroundColor: device.theme ? AppColors.appBackgroundGrey : AppColors.appBackgroundDarkTint }]}>
            <Text style={[styles.text, { color: device.theme ? AppColors.primary : AppColors.appTextWhite }]}>Setting</Text>
            <View>
                <TouchableOpacity style={styles.settingContainer} onPress={handleTheme}>
                    {
                        device.theme ?
                            <SunIcon name="sun" color={device.theme ? AppColors.primary : AppColors.appTextWhite} /> :
                            <MoonIcon name="moon" color={device.theme ? AppColors.primary : AppColors.appTextWhite} />
                    }
                    <Text style={[styles.settingText, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>{device.theme ? 'Light Theme' : 'Dark Theme'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingContainer} onPress={() => clear()}>
                    <RecentIcon name="recent" color={device.theme ? AppColors.primary : AppColors.appTextWhite} />
                    <Text style={[styles.settingText, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>Clear Search History</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingContainer}>
                    <TermsIcon name="terms" color={device.theme ? AppColors.primary : AppColors.appTextWhite} />
                    <Text style={[styles.settingText, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>Terms and Conditions</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingContainer}>
                    <InfoIcon name="info" color={device.theme ? AppColors.primary : AppColors.appTextWhite} />
                    <Text style={[styles.settingText, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>About Us</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingContainer}>
                    <UpdateIcon name="update" color={device.theme ? AppColors.primary : AppColors.appTextWhite} />
                    <Text style={[styles.settingText, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>Check for updates</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingContainer} onPress={() => navigation.navigate('DatabaseViewer' as never)}>
                    <FontAwesome6 iconStyle="solid" name="database" size={18} style={{ paddingHorizontal: 5 }} color={device.theme ? AppColors.primary : AppColors.appTextWhite} />
                    <Text style={[styles.settingText, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>Database Viewer</Text>
                </TouchableOpacity>
            </View>
            {/* <Text style={{ fontFamily: 'Pyidaungsu-Regular', fontSize: 18 }}>ပြည်ထောင်စုဖောင့် Pyidaungsu Regular</Text>
            <Text style={{ fontFamily: 'Pyidaungsu-Bold', fontSize: 18 }}>ပြည်ထောင်စုဖောင့် Pyidaungsu Bold</Text>
            <Text style={{ fontFamily: 'NotoSansMyanmar-Regular', fontSize: 18 }}>နိုတိုစန့်ဖောင့် NotoSansMyanmar Regular</Text>
            <Text style={{ fontFamily: 'NotoSansMyanmar-SemiBold', fontSize: 18 }}>နိုတိုစန့်ဖောင့် NotoSansMyanmar SemiBold</Text>
            <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 18 }}>ဇီဝဗေဒ Pretendard Regular</Text>
            <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 18 }}>ဘောဂဗေဒ Pretendard SemiBold</Text>
            <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 18 }}>ပထဝီ Pretendard Bold</Text>
            <Text style={{ fontFamily: 'Pretendard', fontSize: 18 }}>လူမှုဆက်ဆံရေး Pretendard ExtraBold</Text> */}
            <Text style={[styles.versionStyle, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>version {DeviceInfo.getVersion()} | {device.theme ? 'light' : 'dark'}</Text>
            <CustomAlert
                visible={isAlertVisible}
                title="Clear Search History"
                message="Are you sure you want to delete all search history?"
                onClose={() => setIsAlertVisible(false)}
                onConfirm={handleConfirm}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
        padding: 16,
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    settingContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 10,
        paddingVertical: 16,
        alignItems: 'center',
    },
    settingText: {
        fontSize: 14,
        fontFamily: "Pretendard-Regular",
    },
    versionStyle: {
        fontFamily: "Pretendard-Regular",
        fontSize: 13,
        lineHeight: 24,
        textAlign: 'center',
        position: 'absolute',
        bottom: 0,
        width: Dimensions.get("window").width,
        alignItems: 'center',
    },
});

export default Setting; 