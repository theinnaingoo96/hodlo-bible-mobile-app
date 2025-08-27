import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import NormalHeader from '../components/NormalHeader';
import DatabaseService from '../services/DataService';
import { useEffect, useState } from 'react';
import { AppColors } from '../constants/Color';
import { useSelector } from 'react-redux';

const Notification = () => {

    const device = useSelector((state: any) => state.device);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        DatabaseService.getInstance().getNotifications().then((result: any) => {
            if (result) {
                const notiList = result.map((item: any) => {
                    return {
                        ...item,
                        date: item.date.split('T')[0]
                    }
                }).filter((item: any) => new Date(item.date) <= new Date());
                setNotifications(notiList);
            }
        });
    }, []);

    const renderItem = ({ item }: { item: any }) => {
        return <View style={[styles.itemContainer, { backgroundColor: device.theme ? '#fff' : '#000' }]}>
            <Text style={[styles.itemText, { color: device.theme ? '#000' : '#fff' }]}>{item.text_hd}</Text>
            <View style={styles.referenceContainer}>
                <Text style={[styles.referenceText, { color: device.theme ? '#000' : '#fff' }]}>{item.date}</Text>
                <Text style={[styles.referenceText, { color: device.theme ? '#000' : '#fff' }]}>{item.book_name + " " + item.chapter_number + ":" + item.verse_number}</Text>
            </View>
        </View>;
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: device.theme ? AppColors.appBackgroundGrey : AppColors.appBackgroundDarkTint }]}>
            <NormalHeader title="Notification" backButton={true} />
            {/* <View style={styles.contentContainer}> */}
            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={(item, index) => "notification-" + index.toString()}
                ListEmptyComponent={<Text style={{ color: device.theme ? AppColors.appTextBlack : AppColors.appTextWhite }}>Not found</Text>}
                showsVerticalScrollIndicator={false}
                style={styles.listContainer}
                contentContainerStyle={[{ paddingHorizontal: 16, paddingVertical: 8 }]}
            />
            {/* </View> */}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    listContainer: {
        flex: 1,
    },
    itemContainer: {
        flexDirection: 'column',
        // justifyContent: 'space-between',
        // alignItems: 'center',
        paddingVertical: 16,
        // backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        // marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    itemText: {
        fontSize: 16,
        // fontWeight: 'bold',
    },
    referenceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    referenceText: {
        fontSize: 14,
        fontStyle: "italic",
        marginTop: 12,
        color: "#666",
        textAlign: "right"
    },
});

export default Notification;