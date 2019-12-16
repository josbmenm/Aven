import React from 'react';
import { TouchableOpacity } from 'react-native';
import Tag from './Tag';

export default function TagButton({ title, status, onPress, style }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Tag status={status} title={title} />
    </TouchableOpacity>
  );
}

TagButton.negativeColor = Tag.negativeColor;
TagButton.positiveColor = Tag.positiveColor;
TagButton.warningColor = Tag.warningColor;
