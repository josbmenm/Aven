import React from 'react';
import { TouchableOpacity } from 'react-native';
import Tag from './Tag';
import { useTheme } from './Theme';
import { getStatusColor } from './utils';

export default function TagButton({
  title,
  status,
  onPress,
  theme: themeProp,
}) {
  const theme = useTheme(themeProp);
  const color = getStatusColor(status, theme);
  return (
    <TouchableOpacity onPress={onPress}>
      <Tag status={status} title={title} theme={{ tagColor: color }} />
    </TouchableOpacity>
  );
}
