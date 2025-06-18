import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const SettingIcon = ({ name, color, size }: { name: string, color: string, size: number }) => {
    return (
        <View
            style={[
                StyleSheet.absoluteFill,
                { alignItems: 'center', justifyContent: 'center', marginTop: 10 },
            ]}>
            <Svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                <Path d="M1.25 1.5H19.25M1.25 8H19.25M1.25 14.5H19.25" stroke={color} stroke-width="1.5" stroke-linecap="round" />
            </Svg>

        </View>
    );
};

export default SettingIcon;