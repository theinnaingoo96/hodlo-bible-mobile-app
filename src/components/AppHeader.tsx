import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { AppColors } from '../constants/Color';

interface AppHeaderProps {
    backButton: boolean;
    title: string;
}

const AppHeader = ({ backButton, title }: AppHeaderProps) => {
    const device = useSelector((state: any) => state.device);
    const navigation = useNavigation();

    return (
        <View style={[styles.container, { backgroundColor: device.theme ? AppColors.appTextWhite : AppColors.appBackgroundDark }]}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <FontAwesome6 name="arrow-left" iconStyle="solid" color={device.theme ? AppColors.primaryDark : AppColors.appTextWhite} size={20} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: device.theme ? AppColors.primaryDark : AppColors.appTextWhite }]}>{title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 63,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: AppColors.primaryTint,
    },
    backButton: {
        padding: 10,
        width: 65,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        position: 'absolute',
        left: "50%",
        transform: [{ translateX: '-50%' }],
    },
});

export default AppHeader;