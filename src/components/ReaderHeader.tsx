import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";

import { AppColors } from "../constants/Color";

interface ReaderHeaderProps {
    title: string;
    backButton: boolean;
    onTitlePress: () => void;
    onSettingsPress: () => void;
}

const ReaderHeader = ({ title, backButton, onTitlePress, onSettingsPress }: ReaderHeaderProps) => {
    const device = useSelector((state: any) => state.device);
    const navigation = useNavigation();
    const [isOpen, setIsOpen] = useState(false);
    const handleTitlePress = () => {
        console.log('handleTitlePress');
    };

    return (
        <View style={[styles.headerContainer, { backgroundColor: device.theme ? AppColors.appTextWhite : AppColors.appBackgroundDark }]}>
            {backButton && <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <FontAwesome6 name="arrow-left" iconStyle="solid" color={device.theme ? AppColors.primaryDark : AppColors.appTextWhite} size={20} />
            </TouchableOpacity>}
            <TouchableOpacity style={styles.headerTitleContainer} onPress={onTitlePress}>
                <Text style={[styles.headerTitle, { color: device.theme ? AppColors.primaryDark : AppColors.appTextWhite }]}>{title}</Text>
                <FontAwesome6 name="caret-down" iconStyle="solid" color={device.theme ? AppColors.primaryDark : AppColors.appTextWhite} size={20} />
            </TouchableOpacity>
            <View style={styles.optionsContainer}>
                <TouchableOpacity style={styles.optionsButton} onPress={() => navigation.navigate('ChangeLanguage' as never)}>
                    <FontAwesome6 name="globe" iconStyle="solid" color={device.theme ? AppColors.primaryDark : AppColors.appTextWhite} size={20} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.optionsButton, { marginRight: 6}]} onPress={onSettingsPress}>
                    <FontAwesome6 name="ellipsis-vertical" iconStyle="solid" color={device.theme ? AppColors.primaryDark : AppColors.appTextWhite} size={20} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        height: 63,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        justifyContent: 'space-between',
        width: Dimensions.get('window').width,
        borderBottomColor: AppColors.primaryTint,
    },
    headerTitleContainer: {
        gap: 6,
        left: "50%",
        alignItems: 'center',
        flexDirection: 'row',
        position: 'absolute',
        justifyContent: 'center',
        transform: [{ translateX: '-50%' }],
    },
    headerTitle: {
        fontSize: 16,
        marginLeft: 10,
        fontWeight: '600',
        color: AppColors.primary,
    },
    backButton: {
        width: 65,
        height: 40,
        padding: 10,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        justifyContent: 'center',
        gap: 10,
    },
    optionsButton: {
        padding: 10,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    }
});

export default ReaderHeader;