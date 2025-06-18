import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';

import ReaderHeader from '../../components/ReaderHeader';
import { AppColors } from '../../constants/Color';
import BottomSheet from '../../components/BottomSheet';

const Reader = ({ route }: any) => {
    const device = useSelector((state: any) => state.device);
    const params = route.params;
    const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
    const [optionSheetVisible, setOptionSheetVisible] = useState(false);
    const [fontSize, setFontSize] = useState(0.5);
    useEffect(() => {
        console.log('params', params);
    }, [params]);

    return (
        <View style={styles.container}>
            <ReaderHeader title={params.book + " " + params.chapter} backButton={true} onTitlePress={() => { }} onSettingsPress={() => { setOptionSheetVisible(true) }} />
            <View style={[styles.contentContainer, { backgroundColor: device.theme ? AppColors.appBackgroundGrey : AppColors.appBackgroundDarkTint }]}>
                <Text>Reader</Text>
            </View>
            <BottomSheet visible={optionSheetVisible}
                onClose={() => { setOptionSheetVisible(false) }}
                sheetHeight={250}
                closeButton={false}
            >
                <View>
                    <View style={styles.contentsArea}/>
                    <TouchableOpacity style={styles.optionContainer} onPress={() => { setBottomSheetVisible(true) }}>
                        <Text style={styles.optionTitle}>Reader Setting</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionContainer} onPress={() => { setBottomSheetVisible(true) }}>
                        <Text style={styles.optionTitle}>Start Bookmark</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionContainer} onPress={() => { setBottomSheetVisible(true) }}>
                        <Text style={styles.optionTitle}>Audio Reader</Text>
                    </TouchableOpacity>
                </View>
            </BottomSheet>
            <BottomSheet visible={bottomSheetVisible} onClose={() => { setBottomSheetVisible(false) }} sheetHeight={500}>
                <View>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: AppColors.primaryDark }}>Font Size</Text>
                    <Slider
                        style={{ width: "100%", height: 30 }}
                        minimumValue={0}
                        maximumValue={1}
                        step={0.1}
                        thumbTintColor={AppColors.primaryDark}
                        minimumTrackTintColor={AppColors.primaryDark}
                        maximumTrackTintColor={AppColors.primaryTint}
                    />
                </View>
            </BottomSheet>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.appBackgroundGrey,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        // padding: 10,
    },
    contentContainer: {
        flex: 1,
        // backgroundColor: 'blue',
        width: '100%',
        height: '100%',
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
    },
    optionContainer: {
        height: 50,
        borderBottomWidth: 1,
        borderBottomColor: AppColors.lightGrey,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    optionTitle: {
        fontSize: 16,
        color: AppColors.appTextBlack
    },
    contentsArea: {
        width: 35,
        height: 6,
        borderRadius: 3,
        backgroundColor: AppColors.lightGrey,
        position: 'absolute',
        top: -10,
        left: '50%',
        transform: [{ translateX: -17.5 }],
    },
});

export default Reader;