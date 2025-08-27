import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { AppColors } from "../constants/Color";
import Logo from "./icons/Logo";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import DatabaseService from "../services/DataService";

interface TabHeaderProps {
    title: string;
    icon: React.ComponentType<{
        name: string;
        color: string;
        size: number;
    }>;
}
const TabHeader: React.FC<TabHeaderProps> = ({ title, icon: Icon }) => {

    const navigation = useNavigation();
    const device = useSelector((state: any) => state.device);

    return (
        <View style={styles.headerContainer}>
            <Logo color={device.theme ? AppColors.primary : AppColors.appTextWhite} size={24} />
            <Text style={[styles.headerTitle, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>{"Gathengpu Dlo"}</Text>
            <TouchableOpacity style={styles.notificationStyle} onPress={() => navigation.navigate('Notification' as never)}>
                <FontAwesome6 name="bell" iconStyle="regular" color={device.theme ? AppColors.tabTextGrey : AppColors.appTextWhite} size={20} />
            </TouchableOpacity>
        </View>
    )
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: AppColors.appTextWhite,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        // gap: 8,
        flex: 1,
        width: Dimensions.get('window').width - 18,
        // backgroundColor: 'red',
    },
    headerTitle: {
        color: AppColors.primary,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
    notificationStyle: {
        position: 'absolute',
        right: 16,
        // top: '50%',
    }
});

export default TabHeader;