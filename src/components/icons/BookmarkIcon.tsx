import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const BookmarkIcon = ({ name, color, size }: { name: string, color: string, size: number }) => {
    return (
        <View
            style={[
                StyleSheet.absoluteFill,
                { alignItems: 'center', justifyContent: 'center', marginTop: 10 },
            ]}>
            <Svg width="17" height="18" viewBox="0 0 17 18" fill="none">
                <Path d="M0.916687 6.5278C0.916687 3.92197 0.916687 2.61906 1.74045 1.80953C2.56421 1 3.89004 1 6.54169 1H10.2917C12.9433 1 14.2692 1 15.0929 1.80953C15.9167 2.61906 15.9167 3.92197 15.9167 6.5278V12.8181C15.9167 15.2902 15.9167 16.5263 15.1252 16.9043C14.3336 17.2824 13.3446 16.5187 11.3666 14.9914L10.7335 14.5026C9.62129 13.6438 9.06518 13.2144 8.41669 13.2144C7.76819 13.2144 7.21208 13.6438 6.09986 14.5026L5.46681 14.9914C3.48876 16.5187 2.49974 17.2824 1.70821 16.9043C0.916687 16.5263 0.916687 15.2902 0.916687 12.8181V6.5278Z" stroke={color} stroke-width="1.5" />
            </Svg>
        </View>
    );
};

export default BookmarkIcon;