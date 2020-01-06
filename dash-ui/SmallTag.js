import React from 'react';
import { Tag } from '../dash-ui';

export default function SmallTag({ title, theme, ...restProps }) {
  return (
    <Tag
      title={title.toUpperCase()}
      theme={{
        fontSize: 10,
        fontLetterSpacing: 2,
        paddingVertical: 4,
        paddingHorizontal: 16,
        tagMinWidth: 80,
        ...theme,
      }}
      {...restProps}
    />
  );
}
