import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppColors } from '../../constants/Color';
import { useSelector } from 'react-redux';

const Bookmark = () => {
    const device = useSelector((state: any) => state.device);

    return (
        <View style={[styles.container, { backgroundColor: device.theme ? AppColors.appBackgroundGrey : AppColors.appBackgroundDarkTint }]}>
            <Text style={[styles.text, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>Bookmark</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: AppColors.appBackgroundGrey,
    },
    text: {
        fontSize: 20,
        color: AppColors.appTextBlack,
    },
});

export default Bookmark; 