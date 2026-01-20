import React from "react";
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import ProgressBar from "./ProgressBar";
import { useSelector } from "react-redux";
import { AppColors } from "../constants/Color";

export const VerseOfTheDayCard = ({ verse, reference, onShare }: any) => {
    const device = useSelector((state: any) => state.device);

    return (
        <View style={[styles.card, { backgroundColor: device.theme ? '#fff' : '#000' }]}>
            <Text style={[styles.title, { color: device.theme ? '#000' : '#fff' }]}>Verse of the Day</Text>
            <Text style={[styles.verse, { color: device.theme ? '#000' : '#fff' }]}>{verse}</Text>
            <View style={styles.verseBottomView}>
                <Text style={[styles.reference, { color: device.theme ? '#000' : '#fff' }]}>{reference}</Text>
                <TouchableOpacity style={styles.shareBtn} onPress={onShare}>
                    <Text style={[styles.shareText, { color: device.theme ? '#fff' : '#000' }]}>Share</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export const ReadingProgressCard = ({ progress }: any) => {
    const device = useSelector((state: any) => state.device);

    return (
        <View style={[styles.card, { backgroundColor: device.theme ? '#fff' : '#000' }]}>
            <ProgressBar progress={progress} color={AppColors.primaryDark} label="Reading Progress" />

            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn}>
                    <FontAwesome6 name="bookmark" iconStyle="solid" color={AppColors.primaryDark} size={20} />
                    <Text style={[styles.actionText, { color: device.theme ? '#000' : '#fff' }]}>Bookmarks</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity style={styles.actionBtn}>
                    <FontAwesome6 name="magnifying-glass" iconStyle="solid" color={AppColors.primaryDark} size={20} />
                    <Text style={[styles.actionText, { color: device.theme ? '#000' : '#fff' }]}>Search</Text>
                </TouchableOpacity> */}
                <TouchableOpacity style={styles.actionBtn}>
                    <FontAwesome6 name="bars-progress" iconStyle="solid" color={AppColors.primaryDark} size={20} />
                    <Text style={[styles.actionText, { color: device.theme ? '#000' : '#fff' }]}>Activities</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        // backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        // marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 8,
    },
    verse: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 6,
        color: "#333",
    },
    reference: {
        fontSize: 13,
        fontStyle: "italic",
        marginBottom: 12,
        color: "#666",
    },
    shareBtn: {
        backgroundColor: "#C62828",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: "flex-start",
    },
    shareText: {
        color: "#fff",
        fontWeight: "bold",
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        marginBottom: 8,
    },
    progressText: {
        fontSize: 14,
        marginBottom: 12,
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: 8,
    },
    actionText: {
        fontSize: 14,
        marginLeft: 4,
    },
    verseBottomView: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    }
});
