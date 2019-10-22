import React from 'react';
import { TouchableOpacity } from 'react-native';
import Tag from './Tag';

export default function TagButton({ title, color, onPress, style }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Tag color={color} title={title} style={style} />
    </TouchableOpacity>
  );
}

TagButton.negativeColor = Tag.negativeColor;
TagButton.positiveColor = Tag.positiveColor;
TagButton.warningColor = Tag.warningColor;
