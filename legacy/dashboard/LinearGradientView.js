import React from 'react';
import { View } from '@rn';

function LinearGradient({
  start = [0, 0],
  end = [0, 0],
  colors = ['#C8B287', '#B4985F'],
  style,
  children,
  ...rest
}) {
  const vec = [end[0] - start[0], -(end[1] - start[1])];
  const angleRad = Math.atan(vec[1] / vec[0]);
  const angleDeg = Math.round((angleRad * 180) / Math.PI) + 180;
  const realLocations = colors.map((color, i) => (1 / (colors.length - 1)) * i);
  const colorStrings = colors
    .map((color, i) => `${color} ${Math.round(realLocations[i] * 100)}%`)
    .join(', ');
  return (
    <View
      {...rest}
      style={[
        {
          backgroundImage: `linear-gradient(${angleDeg}deg, ${colorStrings})`,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export default LinearGradient;
