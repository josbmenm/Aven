import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Tag, getStatusColor, useTheme } from '../dash-ui';

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
