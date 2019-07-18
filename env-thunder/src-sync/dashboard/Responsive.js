import React from 'react';
import { useTheme } from './Theme';
import CSSProperties from './CSSProperties';

function validateNumberValue(value) {
  if (typeof value === 'number') {
    return `${value}px`;
  } else {
    return value;
  }
}

export function Responsive({
  style = {},
  children,
  breakpoints,
  className,
  ...rest
}) {
  /*
    - create component id
    - iterate over breakpoints
      - iterate over styles
    
    - return children map with new className
  */
  const theme = useTheme();
  const viewports = breakpoints || theme.breakpoints;
  const compID = React.useMemo(() => {
    return `r-${Math.random()
      .toString(36)
      .substring(2, 5)}${Math.random()
      .toString(36)
      .substring(2, 5)}`;
  }, []);

  function mapStyles(styleIndex = 0) {
    return Object.keys(style)
      .map(attr => {
        if (!CSSProperties[attr]) {
          console.warn('Invalid responsive Style property', attr);
          return `${attr}: ${validateNumberValue(style[attr][styleIndex])};`;
        }

        if (Array.isArray(CSSProperties[attr])) {
          // check for special attributes (marginVertical, paddingVertical...)
          return CSSProperties[attr]
            .map(k => `${k}: ${validateNumberValue(style[attr][styleIndex])};`)
            .join('');
        }
        return `${CSSProperties[attr]}: ${validateNumberValue(
          style[attr][styleIndex],
        )};`;
      })
      .join('');
  }

  const styleString = viewports
    .map((bp, idx) => {
      // if it's not the first breakpoint, don't add the `@media` in front
      return idx > 0
        ? `@media(min-width: ${viewports[idx - 1]}px){.${compID}{${mapStyles(
            idx,
          )}}}`
        : `.${compID}{${mapStyles(idx)}}`;
    })
    .join('');
  return (
    <React.Fragment>
      <style
        dangerouslySetInnerHTML={{ /* eslint-disable-line */
          __html: styleString,
        }}
      />
      {React.Children.map(children, child =>
        React.cloneElement(child, {
          className: `${compID}${className ? ` ${className}` : ''}`,
          ...rest,
        }),
      )}
    </React.Fragment>
  );
}
