import React from 'react';
import { View, StyleSheet } from 'react-native';
import HomeIcon from './icons/HomeIcon';
const TabIcon = ({ name, color, size }: { name: string, color: string, size: number }) => {
    return (
        <View style={{}}>
            <HomeIcon name={name} color={color} size={size} />
        </View>
    );
};