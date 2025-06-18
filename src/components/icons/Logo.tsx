import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppColors } from '../../constants/Color';

const Logo = ({ color = "#C30010", size = 24 }: { color: string, size: number }) => {

    return (
        <View
            style={[
                // StyleSheet.absoluteFill,
                // { alignItems: 'center', justifyContent: 'center'},
            ]}>
            <Svg width="27" height="18" viewBox="0 0 27 18" fill="none">
                <Path d="M2.4822 0.00279037C7.06757 -0.0522276 9.59732 0.700359 12.1085 2.79306V5.44381H7.53487V7.50476H12.1085V18C8.68877 15.7482 6.57271 15.2241 2.4822 15.4888V0.00279037Z" fill={color} />
                <Path d="M0.25 1.81647L1.50561 1.53744V16.3258C5.22731 16.1747 6.68504 16.4082 8.62073 17.1629C5.43906 16.7702 3.61022 16.7243 0.25 17.0234V1.81647Z" fill={color} />
                <Path d="M24.0178 0.00279037C19.4324 -0.0522276 16.9027 0.700359 14.3915 2.79306V5.44381H18.9651V7.50476H14.3915V18C17.8112 15.7482 19.9273 15.2241 24.0178 15.4888V0.00279037Z" fill={color} />
                <Path d="M26.25 1.81647L24.9944 1.53744V16.3258C21.2727 16.1747 19.815 16.4082 17.8793 17.1629C21.0609 16.7702 22.8898 16.7243 26.25 17.0234V1.81647Z" fill={color} />
            </Svg>
        </View>
    );
};

export default Logo;