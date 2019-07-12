import React from 'react';

export function Responsive({
  style = {},
  children,
  breakpoint,
  className,
  ...rest
}) {
  const newStyles = Object.keys(style).reduce((acc, s) => {
    acc[s] = style[s][0];
    return acc;
  }, {});
  return (
    <React.Fragment>
      {React.Children.map(children, child =>
        React.cloneElement(child, {
          style: newStyles,
          ...rest,
        }),
      )}
    </React.Fragment>
  );
}