import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Dimensions } from 'react-native';
import ReanimatedColorPicker, { Panel1, HueSlider, OpacitySlider } from 'reanimated-color-picker';
import { runOnJS } from 'react-native-reanimated';

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

// const colorPaletteWithNames: ColorOption[] = [
//     { name: 'Red', hex: 'rgba(198, 40, 40, 0.8)', code: 'rgba(198, 40, 40, 0.8)' },
//     { name: 'Orange', hex: 'rgba(230, 81, 0, 0.8)', code: 'rgba(230, 81, 0, 0.8)' },
//     { name: 'Yellow', hex: 'rgba(205, 207, 14, 0.8)', code: 'rgba(205, 207, 14, 0.8)' },
//     { name: 'Green', hex: 'rgba(46, 125, 50, 0.8)', code: 'rgba(46, 125, 50, 0.8)' },
//     { name: 'Teal', hex: 'rgba(0, 131, 143, 0.8)', code: 'rgba(0, 131, 143, 0.8)' },
//     { name: 'Blue', hex: 'rgba(21, 101, 192, 0.8)', code: 'rgba(21, 101, 192, 0.8)' },
//     { name: 'Indigo', hex: 'rgba(69, 39, 160, 0.8)', code: 'rgba(69, 39, 160, 0.8)' },
//     { name: 'Pink', hex: 'rgba(173, 20, 87, 0.8)', code: 'rgba(173, 20, 87, 0.8)' },
//     { name: 'Deep Pink', hex: 'rgba(183, 28, 28, 0.8)', code: 'rgba(183, 28, 28, 0.8)' },
//     { name: 'Magenta', hex: 'rgba(170, 0, 255, 0.8)', code: 'rgba(170, 0, 255, 0.8)' },
//     { name: 'Purple', hex: 'rgba(103, 58, 183, 0.8)', code: 'rgba(103, 58, 183, 0.8)' },
//     { name: 'Light Blue', hex: 'rgba(1, 87, 155, 0.8)', code: 'rgba(1, 87, 155, 0.8)' },
//     { name: 'Emerald', hex: 'rgba(0, 105, 92, 0.8)', code: 'rgba(0, 105, 92, 0.8)' },
//     { name: 'Lime', hex: 'rgba(130, 119, 23, 0.8)', code: 'rgba(130, 119, 23, 0.8)' },
// ]

const colorPaletteWithNames: ColorOption[] = [
    { name: 'Red', hex: 'rgba(249, 89, 89, 1)', code: 'rgba(249, 89, 89, 1)' },
    { name: 'Orange', hex: 'rgba(250, 168, 92, 1)', code: 'rgba(250, 168, 92, 1)' },
    { name: 'Yellow', hex: 'rgba(252, 249, 92, 1)', code: 'rgba(252, 249, 92, 1)' },
    { name: 'Lime', hex: 'rgba(170, 250, 89, 1)', code: 'rgba(170, 250, 89, 1)' },
    { name: 'Green', hex: 'rgba(90, 250, 90, 1)', code: 'rgba(90, 250, 90, 1)' },
    { name: 'Mint', hex: 'rgba(91, 250, 170, 1)', code: 'rgba(91, 250, 170, 1)' },
    { name: 'Magenta', hex: 'rgba(250, 88, 171, 1)', code: 'rgba(250, 88, 171, 1)' },
    { name: 'Pink', hex: 'rgba(250, 88, 249, 1)', code: 'rgba(250, 88, 249, 1)' },
    { name: 'Purple', hex: 'rgba(169, 88, 251, 1)', code: 'rgba(169, 88, 251, 1)' },
    { name: 'Indigo', hex: 'rgba(89, 89, 249, 1)', code: 'rgba(89, 89, 249, 1)' },
    { name: 'Blue', hex: 'rgba(90, 169, 248, 1)', code: 'rgba(90, 169, 248, 1)' },
    { name: 'Cyan', hex: 'rgba(91, 249, 250, 1)', code: 'rgba(91, 249, 250, 1)' },
]

const ColorPicker: React.FC<ColorPickerProps> = ({
    colors = colorPaletteWithNames,
    selectedColor,
    style,
    onSelect,
}) => {
    const [showCustom, setShowCustom] = useState(false);

    if (showCustom) {
        return (
            <View style={[styles.container, style]}>
                <Text style={styles.headerText}>Custom Highlight Color</Text>
                <ReanimatedColorPicker
                    style={{ width: Dimensions.get('window').width * 0.8, alignSelf: 'center', marginTop: 15 }}
                    value={selectedColor || 'rgba(198, 40, 40, 0.7)'}
                    onComplete={(colorObj) => {
                        'worklet';
                        runOnJS(onSelect)({ name: 'Custom', hex: colorObj.rgba, code: colorObj.rgba });
                    }}
                >
                    <Panel1 style={{ height: 120 }} />
                    <HueSlider style={{ marginTop: 20 }} />
                    <OpacitySlider style={{ marginTop: 20 }} />
                </ReanimatedColorPicker>
                <TouchableOpacity style={styles.backButton} onPress={() => setShowCustom(false)}>
                    <Text style={styles.backButtonText}>Back to Swatches</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            <Text style={styles.headerText}>choose Highlight color</Text>
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
            <View style={styles.customColorContainer}>
                <TouchableOpacity
                    style={styles.item}
                    onPress={() => setShowCustom(true)}
                >
                    <View style={[styles.customSwatch]}>
                        <Text style={styles.customSwatchText}>Custom Color</Text>
                    </View>
                    {/* <Text style={styles.label}>Custom</Text> */}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        justifyContent: 'center',
    },
    headerText: {
        textAlign: 'center',
        marginBottom: 5,
        color: '#333'
    },
    content: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: 10,
        width: 300
    },
    item: {
        alignItems: 'center',
        margin: 8,
        width: 25,
    },
    swatch: {
        width: 25,
        height: 25,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    customSwatch: {
        backgroundColor: '#e0e0e0',
        alignItems: 'center',
        justifyContent: 'center',
        width: 120,
        height: 25,
        borderRadius: 20,
    },
    customSwatchText: {
        fontSize: 16,
        color: '#666',
        marginTop: -2,
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
    backButton: {
        marginTop: 25,
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
    },
    backButtonText: {
        color: '#333',
        fontSize: 14,
    },
    customColorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
    }
});

export default ColorPicker;
