import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';

type ColorOption = {
    name: string;
    hex: string;
    code: string;
};

type ColorPickerProps = {
    colors?: ColorOption[];
    selectedColor?: string;
    style?: any;
    onSelect: (color: ColorOption) => void;
};

// const defaultColors: ColorOption[] = [
//     { name: 'Red', hex: '#FFCDD2' },
//     { name: 'Orange', hex: '#FFE0B2' },
//     { name: 'Yellow', hex: '#FFF9C4' },
//     { name: 'Green', hex: '#C8E6C9' },
//     { name: 'Sky Blue', hex: '#B3E5FC' },
//     { name: 'Blue', hex: '#BBDEFB' },
//     { name: 'Purple', hex: '#D1C4E9' },
//     { name: 'Violet', hex: '#E1BEE7' },
//     { name: 'Pink', hex: '#F8BBD0' },
//     { name: 'Gray', hex: '#E0E0E0' },
//     { name: 'Mint', hex: '#B2F2BB' },
//     { name: 'Peach', hex: '#FFDAB9' },
//     { name: 'Aqua', hex: '#B2EBF2' },
//     { name: 'Lavender', hex: '#E6E6FA' },
//     // { name: 'Light Gray', hex: '#EEEEEE' },
//     // { name: 'Soft Gray', hex: '#F5F5F5' },
//     // { name: 'Pale', hex: '#FAFAFA' },
//     // { name: 'Off White', hex: '#FDFDFD' },
// ];

const colorPaletteWithNames: ColorOption[] = [
    { name: 'Red', hex: 'rgba(244, 67, 54, 0.7)', code: 'rgba(244, 67, 54, 0.2)' },
    { name: 'Orange', hex: 'rgba(255, 152, 0, 0.7)', code: 'rgba(255, 152, 0, 0.2)' },
    { name: 'Yellow', hex: 'rgba(255, 235, 59, 0.7)', code: 'rgba(255, 235, 59, 0.2)' },
    { name: 'Green', hex: 'rgba(76, 175, 80, 0.7)', code: 'rgba(76, 175, 80, 0.2)' },
    { name: 'Teal', hex: 'rgba(38, 198, 218, 0.7)', code: 'rgba(38, 198, 218, 0.2)' },
    { name: 'Blue', hex: 'rgba(33, 150, 243, 0.7)', code: 'rgba(33, 150, 243, 0.2)' },
    { name: 'Indigo', hex: 'rgba(126, 87, 194, 0.7)', code: 'rgba(126, 87, 194, 0.2)' },
    { name: 'Pink', hex: 'rgba(236, 64, 122, 0.7)', code: 'rgba(236, 64, 122, 0.2)' },
    { name: 'Deep Pink', hex: 'rgba(244, 67, 102, 0.7)', code: 'rgba(244, 67, 102, 0.2)' },
    { name: 'Magenta', hex: 'rgba(224, 64, 251, 0.7)', code: 'rgba(224, 64, 251, 0.2)' },
    { name: 'Purple', hex: 'rgba(149, 117, 205, 0.7)', code: 'rgba(149, 117, 205, 0.2)' },
    { name: 'Light Blue', hex: 'rgba(3, 169, 244, 0.7)', code: 'rgba(3, 169, 244, 0.2)' },
    { name: 'Emerald', hex: 'rgba(38, 166, 154, 0.7)', code: 'rgba(38, 166, 154, 0.2)' },
    { name: 'Lime', hex: 'rgba(205, 220, 57, 0.7)', code: 'rgba(205, 220, 57, 0.2)' },
  ];  

const ColorPicker: React.FC<ColorPickerProps> = ({
    colors = colorPaletteWithNames,
    selectedColor,
    style,
    onSelect,
}) => {
    return (
        <View style={[styles.container, style]}>
            <Text>choose Highlight color</Text>
            <View style={styles.content}>
                {colors.map((color, index) => {
                    const isSelected = selectedColor === color.hex;
                    return (
                        <TouchableOpacity
                            key={index}
                            style={styles.item}
                            onPress={() => onSelect(color)}
                        >
                            <View
                                style={[
                                    styles.swatch,
                                    { backgroundColor: color.hex },
                                    isSelected && styles.selected,
                                ]}
                            />
                            {
                                selectedColor === color.hex &&
                                <Text style={styles.label}>{color.name}</Text>
                            }
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        justifyContent: 'center',
    },
    content: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: 10,
        width: '100%'
    },
    item: {
        alignItems: 'center',
        margin: 8,
        width: 25,
        // backgroundColor: 'red'
    },
    swatch: {
        width: 25,
        height: 25,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selected: {
        borderColor: '#000',
        borderWidth: 3,
    },
    label: {
        marginTop: 4,
        fontSize: 12,
        textAlign: 'center',
        color: '#333',
        position: 'absolute',
        top: -20,
        width: 100
    },
});

export default ColorPicker;
