import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";

import { AppColors } from "../constants/Color";
import { constants } from "../constants/Data";
import SplitVerticalIcon from "./icons/SplitVerticalIcon";
import SplitHorizontalIcon from "./icons/SplitHorizontalIcon";
import { Menu, MenuItem } from "react-native-material-menu";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

interface ReaderHeaderProps {
    title: string;
    backButton: boolean;
    dividerMode: string;
    onTitlePress: () => void;
    onSettingsPress: () => void;
    onAudioReaderPress: () => void;
    setDividerMode: (mode: string) => void;
}

const ReaderHeader = ({ title, backButton, dividerMode, onTitlePress, onSettingsPress, onAudioReaderPress, setDividerMode }: ReaderHeaderProps) => {
    const device = useSelector((state: any) => state.device);
    const reader = useSelector((state: any) => state.reader);
    const navigation = useNavigation();
    const [isOpen, setIsOpen] = useState(false);
    const { stop } = useAudioPlayer()
    const handleTitlePress = () => {
        console.log('handleTitlePress');
    };

    const hideMenu = (type: number) => {
        setIsOpen(false);
        switch (type) {
            case 1:
                onSettingsPress();
                break;
            case 2:
                onAudioReaderPress();
                break;
            default:
                break;
        }
    };

    const showMenu = () => {
        setIsOpen(true);
    };

    return (
        <View style={[styles.headerContainer, { backgroundColor: constants.theme[reader.readerSetting.theme - 1].toolbarColor }]}>
            {backButton && <TouchableOpacity style={styles.backButton} onPress={() => {
                navigation.goBack()
                stop()
            }}>
                <FontAwesome6 name="arrow-left" iconStyle="solid" color={constants.theme[reader.readerSetting.theme - 1].buttonColor} size={20} />
            </TouchableOpacity>}
            <TouchableOpacity style={styles.headerTitleContainer} onPress={onTitlePress}>
                <Text style={[styles.headerTitle, { color: constants.theme[reader.readerSetting.theme - 1].fontColor }]}>{title}</Text>
                <FontAwesome6 name="caret-down" iconStyle="solid" color={constants.theme[reader.readerSetting.theme - 1].fontColor} size={20} />
            </TouchableOpacity>
            <View style={styles.optionsContainer}>
                {
                    device.language == 'en' || device.language == 'mm' ? (
                        <TouchableOpacity style={styles.optionsButton} onPress={() => setDividerMode(dividerMode === 'horizontal' ? 'vertical' : 'horizontal')}>
                            {dividerMode === 'horizontal' ? <SplitVerticalIcon color={constants.theme[reader.readerSetting.theme - 1].fontColor} size={20} /> : <SplitHorizontalIcon color={constants.theme[reader.readerSetting.theme - 1].fontColor} size={20} />}
                        </TouchableOpacity>) : <></>
                }
                <TouchableOpacity style={styles.optionsButton} onPress={() => navigation.navigate('ChangeLanguage' as never)}>
                    <FontAwesome6 name="globe" iconStyle="solid" color={constants.theme[reader.readerSetting.theme - 1].fontColor} size={20} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.optionsButton, { marginRight: 6 }]} onPress={showMenu}>
                    <FontAwesome6 name="ellipsis-vertical" iconStyle="solid" color={constants.theme[reader.readerSetting.theme - 1].fontColor} size={20} />
                </TouchableOpacity>
                <Menu
                    visible={isOpen}
                    // anchor={<Text onPress={() => showMenu(index)}>Show menu</Text>}
                    onRequestClose={() => hideMenu(0)}
                >
                    <MenuItem onPress={() => hideMenu(1)}>Reader Setting</MenuItem>
                    <MenuItem onPress={() => hideMenu(2)}>Audio Reader</MenuItem>
                    {/* <MenuItem onPress={() => deleteBookmark(item)}>Delete</MenuItem> */}
                </Menu>
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