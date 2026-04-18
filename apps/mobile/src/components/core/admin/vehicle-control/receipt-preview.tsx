import React from 'react';
import { Text, View } from 'react-native';

import { parseLine } from '@/lib';

interface Styles {
  text: {
    fontSize?: number;
    textAlign?: 'left' | 'center' | 'right' | undefined;
    fontWeight?: 'normal' | 'bold' | undefined;
  };
}

const defaultStyles: Styles = {
  text: {
    fontSize: 14,
    textAlign: 'left',
    fontWeight: 'normal',
  },
};

interface ReceiptPreviewProps {
  formattedString: string;
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({
  formattedString,
}) => {
  const lines = formattedString.split('\n');

  return (
    <View>
      {lines.map((line, index) => {
        const { text, style } = parseLine(line);
        const mergedStyle = {
          ...defaultStyles.text,
          ...style,
        };

        let textAlign = mergedStyle.textAlign || 'left';
        let fontWeight = mergedStyle.fontWeight || 'normal';
        let fontSize = mergedStyle.fontSize || 14;

        return (
          <Text
            key={index}
            style={{
              textAlign: textAlign,
              fontWeight: fontWeight,
              fontSize: fontSize,
            }}
          >
            {text}
          </Text>
        );
      })}
    </View>
  );
};
