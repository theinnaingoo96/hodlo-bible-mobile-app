import { useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Menu, MenuItem, MenuDivider } from 'react-native-material-menu';
import { View, Text, StyleSheet, Alert, FlatList, TouchableOpacity } from 'react-native';

import DatabaseService from '../../services/DataService';
import CustomAlert from '../../components/CustomAlert';
import { AppColors } from '../../constants/Color';

const Bookmark = () => {
    const device = useSelector((state: any) => state.device);
    const isFocused = useIsFocused();
    const [bookmarks, setBookmarks] = useState([]);
    const navigation = useNavigation();
    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const [selectedBookmark, setSelectedBookmark] = useState(null);

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", async (e) => {
            console.log('Bookmark focused.........', e);
            getBookmark()
        })

        return () => unsubscribe();
    }, [isFocused])

    const getBookmark = () => {
        DatabaseService.getInstance().getBookmarks().then((result: any) => {
            console.log(result);
            setBookmarks(result.map((item: any) => ({ ...item, visible: false })));
            // Alert.alert('result')
        })
    }

    const hideMenu = (item: any) => {
        const temp: any = bookmarks.map((bookmark: any) => ({ ...bookmark, visible: bookmark.id === item.id ? false : bookmark.visible }));
        setBookmarks(temp);
    };

    const showMenu = (item: any) => {
        console.log('showMenu', item);
        const temp: any = bookmarks.map((bookmark: any) => ({ ...bookmark, visible: bookmark.id === item.id ? true : bookmark.visible }));
        setBookmarks(temp);
    };

    const deleteBookmark = (item: any) => {
        setIsAlertVisible(true);
        setSelectedBookmark(item);
    }

    const handleDeleteBookmark = (item: any) => {
        console.log('handleDeleteBookmark');
        DatabaseService.getInstance().clearBookmarkById(item.id).then((result: any) => {
            setIsAlertVisible(false);
            getBookmark();
            console.log('result', result);
        })
    }

    const renderItem = ({ item, index }: { item: any, index: number }) => {
        return (
            <View style={[styles.verseItem, { backgroundColor: device.theme ? AppColors.appTextWhite : AppColors.appBackgroundDarkGrey }]}>
                <View style={styles.verseTextContainer}>
                    <Text style={[styles.verseText, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>{item.text_hd}</Text>

                    <TouchableOpacity style={[styles.optionsButton, { marginRight: 6 }]} onPress={() => {
                        showMenu(item);
                    }}>
                        <FontAwesome6 name="ellipsis-vertical" iconStyle="solid" color={device.theme ? AppColors.primaryDark : AppColors.appTextWhite} size={20} />
                    </TouchableOpacity><Menu
                        visible={item.visible}
                        // anchor={<Text onPress={() => showMenu(index)}>Show menu</Text>}
                        onRequestClose={() => hideMenu(item)}
                    >
                        <MenuItem onPress={() => hideMenu(item)}>View</MenuItem>
                        <MenuItem onPress={() => hideMenu(item)}>Share</MenuItem>
                        <MenuItem onPress={() => deleteBookmark(item)}>Delete</MenuItem>
                    </Menu>
                </View>
                <Text style={[styles.verseLocation, { color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>{item.book + " " + item.chapter + ":" + item.verse}</Text>
            </View>
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: device.theme ? AppColors.appBackgroundGrey : AppColors.appBackgroundDarkTint }]}>
            <Text style={[styles.text, { color: device.theme ? AppColors.primaryDark : AppColors.appTextWhite }]}>Bookmark</Text>
            <FlatList
                data={bookmarks}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={<Text style={{ color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }}>No bookmarks found</Text>}
                showsVerticalScrollIndicator={false}
                style={styles.listContainer}
                contentContainerStyle={{ paddingHorizontal: 16 }}
            />
            <CustomAlert
                visible={isAlertVisible}
                title="Delete Bookmark"
                message="Are you sure you want to delete this bookmark?"
                onClose={() => setIsAlertVisible(false)}
                onConfirm={() => handleDeleteBookmark(selectedBookmark) }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: AppColors.appBackgroundGrey,
        paddingVertical: 16,
    },
    listContainer: {
        width: '100%',
        flex: 1,
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: AppColors.appTextBlack,
        width: '100%',
        marginBottom: 16,
        paddingLeft: 16,
    },
    verseItem: {
        width: '100%',
        paddingVertical: 16,
        // paddingLeft: 16,
        borderRadius: 10,
        marginBottom: 16,
        flexDirection: 'column',
        shadowColor: AppColors.appTextBlack,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    verseTextContainer: {
        display: 'flex',
        alignItems: 'flex-start',
        width: '100%',
        marginBottom: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    verseLocation: {
        fontSize: 14,
        color: AppColors.appTextBlack,
        marginBottom: 4,
        alignSelf: 'flex-end',
        marginRight: 16,
    },
    verseText: {
        fontSize: 16,
        color: AppColors.appTextBlack,
        marginBottom: 4,
        textAlign: 'left',
        flex: 1,
        paddingLeft: 16,
        lineHeight: 24,
    },
    optionsButton: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: 'pink'
    }
});

export default Bookmark; 