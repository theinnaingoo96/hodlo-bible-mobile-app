import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Alert, TouchableOpacity } from 'react-native';

const Chat = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View>
                <Text>Chat</Text>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

export default Chat;