import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const HomeIcon = ({ name, color, size }: { name: string, color: string, size: number }) => {

    return (
        <View
            style={[
                StyleSheet.absoluteFill,
                { alignItems: 'center', justifyContent: 'center', marginTop: 10 },
            ]}>
            <Svg width="21" height="22" viewBox="0 0 21 22" fill="none" color={color}>
                <Path d="M7.91669 21L7.91861 16.9976C7.91905 16.067 7.91927 15.6017 8.07131 15.2347C8.27443 14.7443 8.66415 14.3547 9.15459 14.1519C9.52179 14 9.98709 14 10.9177 14C11.8486 14 12.3141 14 12.6814 14.152C13.172 14.355 13.5617 14.7447 13.7647 15.2353C13.9167 15.6026 13.9167 16.0681 13.9167 16.999V21" stroke={color} stroke-width="5.5" />
                <Path d="M6.00517 3.76243L5.00516 4.54298C3.4885 5.72681 2.73017 6.31873 2.32343 7.15333C1.91669 7.98792 1.91669 8.95205 1.91669 10.8803V12.9715C1.91669 16.7562 1.91669 18.6485 3.08826 19.8243C4.25984 21 6.14545 21 9.91669 21H11.9167C15.6879 21 17.5736 21 18.7451 19.8243C19.9167 18.6485 19.9167 16.7562 19.9167 12.9715V10.8803C19.9167 8.95205 19.9167 7.98792 19.51 7.15333C19.1032 6.31873 18.3449 5.72681 16.8282 4.54298L15.8282 3.76243C13.4688 1.92081 12.2891 1 10.9167 1C9.54429 1 8.36456 1.92081 6.00517 3.76243Z" stroke={color} stroke-width="5.5" stroke-linejoin="round" />
            </Svg>
        </View>
    );
};

export default HomeIcon;