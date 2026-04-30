import DeviceInfo, { getBaseOs, getDeviceType } from 'react-native-device-info';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from "@react-navigation/native";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';

import { setDatabaseVersion, setLoading, setTheme, setToast } from '../../store/slices/deviceSlice';
import UpdateIcon from '../../components/icons/setting/UpdateIcon';
import RecentIcon from '../../components/icons/setting/RecentIcon';
import TermsIcon from '../../components/icons/setting/TermsIcon';
import MoonIcon from '../../components/icons/setting/MoonIcon';
import InfoIcon from '../../components/icons/setting/InfoIcon';
import SunIcon from '../../components/icons/setting/SunIcon';
import DatabaseService from '../../services/DatabaseService';
import CustomAlert from '../../components/CustomAlert';
import { AppColors } from '../../constants/Color';
import { getLatestVersion } from '../../services/ApiService';
import useInternetStatus from '../../hooks/useInternetStatus';
import UpdateService, { UpdateInfo } from '../../services/UpdateService';

const Setting = () => {
    const device = useSelector((state: any) => state.device);
    const dispatch = useDispatch();
    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const [isUpdateAlertVisible, setIsUpdateAlertVisible] = useState(false);
    const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
    const navigation = useNavigation();
    const networkStatus = useInternetStatus();

    const clear = async () => {
        setIsAlertVisible(true);
    }

    const handleConfirm = async () => {
        await DatabaseService.getInstance().clearSearchHistoryAll();
        setIsAlertVisible(false);
    }

    const handleTheme = () => {
        dispatch(setLoading(true));
        setTimeout(() => {
            dispatch(setTheme(!device.theme));
            dispatch(setLoading(false));
        }, 1000);
    }

    const handleCheckUpdate = async () => {
        if (!networkStatus.isConnected) {
            dispatch(setToast({
                show: true,
                message: 'No internet connection',
                type: 'error',
                duration: 3000,
            }));
            return;
        }

        dispatch(setLoading(true));
        try {
            const info = await UpdateService.checkForUpdates();
            if (info.isAvailable) {
                setUpdateInfo(info);
                setIsUpdateAlertVisible(true);
            } else {
                dispatch(setToast({
                    show: true,
                    message: 'No update available',
                    type: 'info',
                    duration: 3000,
                }));
            }
        } catch (error) {
            dispatch(setToast({
                show: true,
                message: 'Failed to check for updates',
                type: 'error',
                duration: 3000,
            }));
        } finally {
            dispatch(setLoading(false));
        }
    }

    const handleUpdateConfirm = () => {
        setIsUpdateAlertVisible(false);
        UpdateService.openStore(updateInfo?.storeUrl);
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
                <TouchableOpacity style={styles.settingContainer} onPress={() => navigation.navigate('TermsAndConditions' as never)}>
                    <TermsIcon name="terms" color={device.theme ? AppColors.primary : AppColors.appTextWhite} />
                    <Text style={[styles.settingText, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>Terms and Conditions</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingContainer} onPress={() => navigation.navigate('AboutUs' as never)}>
                    <InfoIcon name="info" color={device.theme ? AppColors.primary : AppColors.appTextWhite} />
                    <Text style={[styles.settingText, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>About Us</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingContainer} onPress={handleCheckUpdate}>
                    <UpdateIcon name="update" color={device.theme ? AppColors.primary : AppColors.appTextWhite} />
                    <Text style={[styles.settingText, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>Check for updates</Text>
                </TouchableOpacity>
            </View>
            <Text style={[styles.versionStyle, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>version {DeviceInfo.getVersion()}</Text>
            <CustomAlert
                visible={isAlertVisible}
                title="Clear Search History"
                message="Are you sure you want to delete all search history?"
                onClose={() => setIsAlertVisible(false)}
                onConfirm={handleConfirm}
            />
            <CustomAlert
                visible={isUpdateAlertVisible}
                title="New Update Available"
                message={`A new version of the app is available. Please update to get the latest features and bug fixes.`}
                confirmText="Update Now"
                cancelText="Later"
                onClose={() => setIsUpdateAlertVisible(false)}
                onConfirm={handleUpdateConfirm}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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