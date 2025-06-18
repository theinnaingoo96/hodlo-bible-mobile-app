import React, { useEffect, useRef } from 'react';
import {
    View,
    Animated,
    StyleSheet,
    Dimensions,
    Pressable,
    Text,
    TouchableOpacity,
} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { AppColors } from '../constants/Color';
import { useSelector } from 'react-redux';

const { height } = Dimensions.get('window');
const SHEET_HEIGHT = 300;

const BottomSheet = ({ visible, onClose, sheetHeight = SHEET_HEIGHT, children }: { visible: boolean, onClose: () => void, sheetHeight?: number, children: any }) => {
    const translateY = useRef(new Animated.Value(sheetHeight)).current;
    const device = useSelector((state: any) => state.device);
    useEffect(() => {
        if (visible) {
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(translateY, {
                toValue: sheetHeight,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    return visible ? (
        <View style={styles.wrapper}>
            <Pressable style={styles.backdrop} onPress={onClose} />
            <Animated.View
                style={[
                    styles.sheet,
                    {
                        transform: [{ translateY }],
                        height: sheetHeight,
                    },
                ]}
            >
                <View style={styles.sheetHeader}>
                    {/* <View style={styles.sheetHeaderBar}/> */}
                    {/* <Text style={styles.sheetHeaderTitle}>ReaderSettings</Text> */}
                    <TouchableOpacity onPress={onClose}>
                        <FontAwesome6 name="xmark" iconStyle="solid" color={AppColors.primaryDark} size={20} />
                    </TouchableOpacity>
                </View>
                {children}
            </Animated.View>
        </View>
    ) : null;
};

export default BottomSheet;

const styles = StyleSheet.create({
    wrapper: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        zIndex: 100,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#00000088',
    },
    sheet: {
        // height: SHEET_HEIGHT,
        width: '100%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    sheetHeaderTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    // sheetHeaderBar: {
    //     width: 40,
    //     height: 6,
    //     backgroundColor: '#00000044',
    //     borderRadius: 10,
    //     position: 'absolute',
    //     top: 0,
    //     left: '50%',
    //     transform: [{ translateX: '-50%' }],
    // },
});
