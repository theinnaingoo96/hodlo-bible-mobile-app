import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { AppColors } from '../constants/Color';

const SearchSnippet = ({ rawText = "", keyword = "", snippetRadius = 20, theme = true }: any) => {

    const [parts, setParts] = useState<string[]>([]);

    useEffect(() => {

        // Normalize text
        const lowerText = rawText.toLowerCase();
        const lowerKeyword = keyword.toLowerCase();
        const index = lowerText.indexOf(lowerKeyword);
        // If keyword not found, show full text truncated
        if (index === -1) {
            setParts([rawText]);
            return;
        }
        const keywordLength = keyword.length;
        const textLength = rawText.length;

        // Balanced middle-case: divide radius before/after keyword
        const halfRadius = Math.floor(snippetRadius / 2);
        const beforeKeyword = Math.max(0, index - halfRadius);
        const afterKeyword = index + keywordLength + halfRadius;

        let start, end;

        if (index <= snippetRadius) {
            // Near start
            start = 0;
            end = Math.min(textLength, index + keywordLength + snippetRadius + 20);
        } else if (index + keywordLength + snippetRadius >= textLength) {
            // Near end
            end = textLength;
            start = Math.max(0, textLength - (snippetRadius * 2 + keywordLength));
        } else {
            // Middle
            start = beforeKeyword;
            end = afterKeyword;
        }

        let snippet = rawText.substring(start, end);

        // Add ellipses if sliced
        if (start > 0) snippet = '...' + snippet;
        if (end < textLength) snippet = snippet + '...';

        // Highlight keyword
        const parts = snippet.split(new RegExp(`(${keyword})`, 'ig'));
        setParts(parts);
    }, []);

    return (
        <Text numberOfLines={1} ellipsizeMode="tail">
            {parts.map((part: any, idx: number) =>
                part.toLowerCase() === keyword.toLowerCase() ? (
                    <Text key={idx} style={[styles.highlightedText, { color: theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>{part}</Text>
                ) : (
                    <Text key={idx} style={[styles.text, { color: theme ? AppColors.appTextBlack : AppColors.appTextWhite }]}>{part}</Text>
                )
            )}
        </Text>
    );
};

const styles = StyleSheet.create({
    text: {
        fontSize: 16,
        color: AppColors.appTextBlack,
        fontFamily: "Pretendard-Regular",
        lineHeight: 24,
    },
    highlightedText: {
        fontWeight: 'bold',
        color: AppColors.primaryDark,
    },
});

export default SearchSnippet;
