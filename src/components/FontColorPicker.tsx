import React from 'react';
import {View, TouchableOpacity, StyleSheet, Text} from 'react-native';
import {AppColors} from '../constants/Color';

type ColorOption = {
  name: string;
  hex: string;
  code: string;
};

type FontColorPickerProps = {
  colors?: ColorOption[];
  selectedColor?: string;
  style?: any;
  onSelect: (color: ColorOption) => void;
};

// const colorPaletteWithNames: ColorOption[] = [
//     { name: 'White', hex: 'rgb(255, 255, 255)', code: 'rgb(255, 255, 255)' },
//     { name: 'Orange', hex: 'rgb(230, 81, 0)', code: 'rgb(230, 81, 0)' },
//     { name: 'Yellow', hex: 'rgb(205, 207, 14)', code: 'rgb(205, 207, 14)' },
//     { name: 'Green', hex: 'rgb(46, 125, 50)', code: 'rgb(46, 125, 50)' },
//     { name: 'Teal', hex: 'rgb(0, 131, 143)', code: 'rgb(0, 131, 143)' },
//     { name: 'Blue', hex: 'rgb(21, 101, 192)', code: 'rgb(21, 101, 192)' },
//     { name: 'Indigo', hex: 'rgb(69, 39, 160)', code: 'rgb(69, 39, 160)' },
//     { name: 'Pink', hex: 'rgb(173, 20, 87)', code: 'rgb(173, 20, 87)' },
//     { name: 'Deep Pink', hex: 'rgb(183, 28, 28)', code: 'rgb(183, 28, 28)' },
//     { name: 'Magenta', hex: 'rgb(170, 0, 255)', code: 'rgb(170, 0, 255)' },
//     { name: 'Purple', hex: 'rgb(103, 58, 183)', code: 'rgb(103, 58, 183)' },
//     { name: 'Light Blue', hex: 'rgb(1, 87, 155)', code: 'rgb(1, 87, 155)' },
//     { name: 'Emerald', hex: 'rgb(0, 105, 92)', code: 'rgb(0, 105, 92)' },
//     { name: 'Black', hex: 'rgb(0, 0, 0)', code: 'rgb(0, 0, 0)' },
// ]

const colorPaletteWithNames: ColorOption[] = [
  {name: 'White', hex: '#FFFFFF', code: '#FFFFFF'},
  {name: 'Black', hex: '#000000', code: '#000000'},
  {name: 'Red', hex: '#F80000', code: '#F80000'},
  {name: 'Orange', hex: '#FF8D15', code: '#FF8D15'},
  {name: 'Yellow', hex: '#FFD828', code: '#FFD828'},
  {name: 'Green', hex: '#36BF36', code: '#36BF36'},
  {name: 'Blue', hex: '#3EA6FF', code: '#3EA6FF'},
  {name: 'Purple', hex: '#9A4DFF', code: '#9A4DFF'},
  {name: 'Pink', hex: '#FF76DA', code: '#FF76DA'},
  {name: 'Maroon', hex: '#AD1457', code: '#AD1457'},
  {name: 'Lavender', hex: '#DCADD0', code: '#DCADD0'},
  {name: 'Rose', hex: '#E89A8B', code: '#E89A8B'},
  {name: 'Burgundy', hex: '#FFE0B2', code: '#FFE0B2'},
  {name: 'Beige', hex: '#BDA88A', code: '#BDA88A'},
  {name: 'Brown', hex: '#6D4C41', code: '#6D4C41'},
  {name: 'Green', hex: '#1B5E20', code: '#1B5E20'},
  {name: 'Blue-Green', hex: '#00838F', code: '#00838F'},
  {name: 'Indigo', hex: '#3F5CB5', code: '#3F5CB5'},
];

const FontColorPicker: React.FC<FontColorPickerProps> = ({
  colors = colorPaletteWithNames,
  selectedColor,
  style,
  onSelect,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.titleText}>choose Font color</Text>
      <View style={styles.content}>
        {colors.map((color, index) => {
          const isSelected = selectedColor === color.hex;
          return (
            <TouchableOpacity
              key={index}
              style={styles.item}
              onPress={() => onSelect(color)}>
              <View
                style={[
                  styles.swatch,
                  {backgroundColor: color.hex},
                  isSelected && styles.selected,
                ]}
              />
              {selectedColor === color.hex && (
                <Text style={styles.label}>{color.name}</Text>
              )}
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
    width: '100%',
  },
  item: {
    alignItems: 'center',
    margin: 8,
    width: 25,
  },
  swatch: {
    width: 25,
    height: 25,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
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
    width: 100,
  },
  titleText: {
    fontSize: 14,
    marginBottom: 10,
    color: AppColors.appTextBlack,
    alignSelf: 'flex-start',
  },
});

export default FontColorPicker;
