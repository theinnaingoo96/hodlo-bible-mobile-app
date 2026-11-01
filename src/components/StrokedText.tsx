import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TextStyle, StyleProp } from 'react-native';

interface StrokedTextProps {
  text: string;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'center' | 'left' | 'right';
  lineHeight?: number;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

const StrokedText: React.FC<StrokedTextProps> = ({
  text,
  color = '#FFFFFF',
  strokeColor = '#000000',
  strokeWidth = 0,
  fontSize = 18,
  fontFamily = 'Pretendard-Bold',
  textAlign = 'center',
  lineHeight,
  style,
  numberOfLines,
}) => {
  if (!text) return null;

  const baseTextStyle: TextStyle = {
    fontSize,
    fontFamily,
    lineHeight: lineHeight || Math.round(fontSize * 1.45),
    width: '100%',
    textAlign,
  };

  const containerAlignItems =
    textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center';

  const offsets = useMemo(() => {
    if (!strokeWidth || strokeWidth <= 0) return [];
    const w = strokeWidth;
    const steps = Math.max(8, Math.min(16, Math.round(w * 4)));
    const pts: Array<[number, number]> = [];
    for (let i = 0; i < steps; i++) {
      const angle = (i * 2 * Math.PI) / steps;
      pts.push([
        Math.round(Math.cos(angle) * w * 10) / 10,
        Math.round(Math.sin(angle) * w * 10) / 10,
      ]);
    }
    return pts;
  }, [strokeWidth]);

  if (!strokeWidth || strokeWidth <= 0) {
    return (
      <View style={[styles.container, { alignItems: containerAlignItems }]}>
        <Text
          style={[style, baseTextStyle, { color, textAlign }]}
          numberOfLines={numberOfLines}>
          {text}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { alignItems: containerAlignItems }]}>
      {offsets.map(([dx, dy], index) => (
        <Text
          key={`stroke-${index}`}
          numberOfLines={numberOfLines}
          style={[
            style,
            baseTextStyle,
            styles.strokeLayer,
            {
              transform: [{ translateX: dx }, { translateY: dy }],
              color: strokeColor,
              textShadowColor: strokeColor,
              textShadowOffset: { width: dx * 0.3, height: dy * 0.3 },
              textShadowRadius: 1,
              textAlign,
            },
          ]}>
          {text}
        </Text>
      ))}
      <Text
        style={[style, baseTextStyle, { color, textAlign }]}
        numberOfLines={numberOfLines}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
  },
  strokeLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default StrokedText;
