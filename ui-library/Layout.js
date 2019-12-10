import React from 'react';
import View from '../views/View';

export default function Layout({ children, ...rest }) {
  return <View style={{ padding: 40 }}>{children}</View>;
}
