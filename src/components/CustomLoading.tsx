import { ActivityIndicator, Image, Modal, Text, View } from "react-native";
import { StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { AppColors } from "../constants/Color";
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useEffect } from "react";
import BookAni from "./BookAni";
import Logo from "./icons/Logo";

const AnimatedView = Animated.createAnimatedComponent(View);

const CustomLoading = ({ visible = false }: { visible: boolean }) => {
    const device = useSelector((state: any) => state.device);
    // const rotation = useSharedValue(0);

    const scale = useSharedValue(1);

    useEffect(() => {
        scale.value = withRepeat(
            withTiming(1.2, {
                duration: 600,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.container}>
                <View style={styles.overlay}>
                    <AnimatedView
                        style={[styles.image, animatedStyle]}
                    >
                        {/* <Logo color={AppColors.appTextWhite} size={24} /> */}
                        <Image source={require('../assets/images/icon.png')} style={{ width: 24, height: 24 }} />
                        <Text style={styles.text}>Loading...</Text>
                    </AnimatedView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000080'
    },
    overlay: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff0',
        padding: 20,
        borderRadius: 10
    },
    text: {
        color: AppColors.appTextWhite,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10
    },
    bookContainer: {
        width: 150,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    spine: {
        width: 10,
        height: 200,
        backgroundColor: '#4B2E39',
        position: 'absolute',
        zIndex: 2,
    },
    cover: {
        width: 70,
        height: 200,
        backgroundColor: '#8E6E53',
        position: 'absolute',
    },
    leftCover: {
        left: -70,
        zIndex: 1,
        borderRightWidth: 2,
        borderColor: '#3e2c23',
    },
    rightCover: {
        right: -70,
        zIndex: 1,
        borderLeftWidth: 2,
        borderColor: '#3e2c23',
    },
    image: {
        // width: 24,
        // height: 24,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
});
// { backgroundColor: device.theme ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }
export default CustomLoading;