import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';

import ReaderHeader from '../../components/ReaderHeader';
import { AppColors } from '../../constants/Color';
import BottomSheet from '../../components/BottomSheet';

const Reader = ({ route }: any) => {
    const device = useSelector((state: any) => state.device);
    const params = route.params;
    const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
    useEffect(() => {
        setBottomSheetVisible(true);
        console.log('params', params);
    }, [params]);

    return (
        <View style={styles.container}>
            <ReaderHeader title={params.book + " " + params.chapter } backButton={true} onTitlePress={() => {}} onSettingsPress={() => { setBottomSheetVisible(true) }} />
            <View style={[styles.contentContainer, { backgroundColor: device.theme ? AppColors.appBackgroundGrey : AppColors.appBackgroundDarkTint }]}>
                <Text>Reader</Text>
            </View>
            <BottomSheet visible={bottomSheetVisible} onClose={() => { setBottomSheetVisible(false) }}>
                <Text>BottomSheet</Text>
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
});

export default Reader;