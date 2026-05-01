import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AppColors } from '../constants/Color';

const CustomAlert = ({ visible, title = "", message = "", onClose, onConfirm, confirmText = "OK", cancelText = "Cancel" }: any) => (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent={true}>
        <View style={styles.container}>
            <View style={styles.alertContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.message}>
                    {message}
                </Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={onClose} style={styles.button}>
                        <Text style={styles.buttonText}>{cancelText}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onConfirm}>
                        <Text style={styles.okButtonText}>{confirmText}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
);
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000080'
    },
    alertContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%'
    },
    title: {
        fontSize: 18,
        color: AppColors.appTextBlack
    },
    message: {
        marginVertical: 10,
        color: AppColors.appTextBlack
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    button: {
        marginRight: 30
    },
    buttonText: {
        color: AppColors.appTextGrey,
    },
    okButtonText: {
        color: AppColors.primaryDark,
        fontWeight: 'bold'
    }
})

export default CustomAlert;