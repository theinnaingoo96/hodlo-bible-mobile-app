import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';

import { clearSearchHistory } from '../../services/DatabaseService';
import UpdateIcon from '../../components/icons/setting/UpdateIcon';
import RecentIcon from '../../components/icons/setting/RecentIcon';
import TermsIcon from '../../components/icons/setting/TermsIcon';
import MoonIcon from '../../components/icons/setting/MoonIcon';
import InfoIcon from '../../components/icons/setting/InfoIcon';
import SunIcon from '../../components/icons/setting/SunIcon';
import CustomAlert from '../../components/CustomAlert';
import { AppColors } from '../../constants/Color';
import { setLoading, setTheme } from '../../store/slices/deviceSlice';

const Setting = () => {
    const device = useSelector((state: any) => state.device);
    const dispatch = useDispatch();
    const [isAlertVisible, setIsAlertVisible] = useState(false);

    useEffect(() => {
        console.log('device', device);
    }, [device]);

    const clear = async () => {
        setIsAlertVisible(true);
    }

    const handleConfirm = async () => {
        const res = await clearSearchHistory();
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
            </View>
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
    },
    versionStyle: {
        fontFamily: "Pretendard-Regular",
        fontSize: 13,
        lineHeight: 34,
        textAlign: 'center',
        position: 'absolute',
        bottom: 0,
        width: Dimensions.get("window").width,
        alignItems: 'center',
    },
});

export default Setting; 