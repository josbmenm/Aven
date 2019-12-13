import React from 'react';
import View from '../../views/View';

export default function Horizontal({ children }) {
  return <View style={{ flexDirection: 'row' }}>{children}</View>;
}
