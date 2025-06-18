import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

const BibleIcon = ({ name, color, size }: { name: string, color: string, size: number }) => {
    return (
        <View
            style={[
                StyleSheet.absoluteFill,
                { alignItems: 'center', justifyContent: 'center', marginTop: 10 },
            ]}>
            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <Circle cx="8.52081" cy="8.9375" r="7.4375" stroke={color} stroke-width="1.5"/>
                <Path d="M18.0833 18.5L14.8958 15.3125" stroke={color} stroke-width="2" stroke-linecap="round"/>
            </Svg>
        </View>
    );
};

export default BibleIcon;