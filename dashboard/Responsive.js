import React from 'react';
import { useTheme } from './Theme';

let responsiveIdCount = 0;

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
  breakpoint,
  className,
  ...rest
}) {
  const id = responsiveIdCount++;
  const theme = useTheme();
  const bp = breakpoint || theme.breakpoints[0];

  let small = `
  ${style.paddingVertical ? `padding: ${style.paddingVertical[0]}px 0;` : ''}
  ${
    style.paddingHorizontal
      ? `padding: 0 ${validateNumberValue(style.paddingHorizontal[1])};`
      : ''
  }
  ${style.paddingTop ? `padding-top: ${style.paddingTop[0]}px;` : ''}
  ${style.paddingRight ? `padding-right: ${style.paddingRight[0]}px;` : ''}
  ${style.paddingBottom ? `padding-bottom: ${style.paddingBottom[0]}px;` : ''}
  ${style.paddingLeft ? `padding-left: ${style.paddingLeft[0]}px;` : ''}

  ${style.marginVertical ? `margin: ${style.marginVertical[0]}px 0;` : ''}
  ${style.marginHorizontal ? `margin: 0 ${style.marginHorizontal[0]}px;` : ''}
  ${style.marginTop ? `margin-top: ${style.marginTop[0]}px;` : ''}
  ${style.marginRight ? `margin-right: ${style.marginRight[0]}px;` : ''}
  ${style.marginBottom ? `margin-bottom: ${style.marginBottom[0]}px;` : ''}
  ${style.marginLeft ? `margin-left: ${style.marginLeft[0]}px;` : ''}

  ${style.textAlign ? `text-align: ${style.textAlign[0]};` : ''}
  ${style.fontSize ? `font-size: ${style.fontSize[0]}px;` : ''}
  ${style.lineHeight ? `line-height: ${style.lineHeight[0]}px;` : ''}
  ${style.letterSpacing ? `letter-spacing: ${style.letterSpacing[0]};` : ''}

  ${style.alignItems ? `align-items: ${style.alignItems[0]};` : ''}
  ${style.alignSelf ? `align-self: ${style.alignSelf[0]};` : ''}
  ${style.flexDirection ? `flex-direction: ${style.flexDirection[0]};` : ''}
  ${style.display ? `display: ${style.display[0]};` : ''}

  ${
    style.maxWidth
      ? `max-width: ${validateNumberValue(style.maxWidth[0])};`
      : ''
  }

  ${style.width ? `width: ${validateNumberValue(style.width[0])};` : ''}
  ${style.height ? `height: ${validateNumberValue(style.height[0])};` : ''}

  ${style.top ? `top: ${validateNumberValue(style.top[0])};` : ''}
  ${style.right ? `right: ${validateNumberValue(style.right[0])};` : ''}
  ${style.bottom ? `bottom: ${validateNumberValue(style.bottom[0])};` : ''}
  ${style.left ? `left: ${validateNumberValue(style.left[0])};` : ''}



  `.trim();

  let large = `
  ${style.paddingVertical ? `padding: ${style.paddingVertical[1]}px 0;` : ''}
  ${
    style.paddingHorizontal
      ? `padding: 0 ${validateNumberValue(style.paddingHorizontal[1])};`
      : ''
  }
  ${style.paddingTop ? `padding-top: ${style.paddingTop[1]}px;` : ''}
  ${style.paddingRight ? `padding-right: ${style.paddingRight[1]}px;` : ''}
  ${style.paddingBottom ? `padding-bottom: ${style.paddingBottom[1]}px;` : ''}
  ${style.paddingLeft ? `padding-left: ${style.paddingLeft[1]}px;` : ''}

  ${style.marginVertical ? `margin: ${style.marginVertical[1]}px 0;` : ''}
  ${style.marginHorizontal ? `margin: 0 ${style.marginHorizontal[1]}px;` : ''}
  ${style.marginTop ? `margin-top: ${style.marginTop[1]}px;` : ''}
  ${style.marginRight ? `margin-right: ${style.marginRight[1]}px;` : ''}
  ${style.marginBottom ? `margin-bottom: ${style.marginBottom[1]}px;` : ''}
  ${style.marginLeft ? `margin-left: ${style.marginLeft[1]}px;` : ''}

  ${style.textAlign ? `text-align: ${style.textAlign[1]};` : ''}
  ${style.fontSize ? `font-size: ${style.fontSize[1]}px;` : ''}
  ${style.lineHeight ? `line-height: ${style.lineHeight[1]}px;` : ''}
  ${style.letterSpacing ? `letter-spacing: ${style.letterSpacing[1]};` : ''}

  ${style.alignItems ? `align-items: ${style.alignItems[1]};` : ''}
  ${style.alignSelf ? `align-self: ${style.alignSelf[1]};` : ''}
  ${style.flexDirection ? `flex-direction: ${style.flexDirection[1]};` : ''}
  ${style.display ? `display: ${style.display[1]};` : ''}

  ${
    style.maxWidth
      ? `max-width: ${validateNumberValue(style.maxWidth[1])};`
      : ''
  }

  ${style.width ? `width: ${validateNumberValue(style.width[1])};` : ''}
  ${style.height ? `height: ${validateNumberValue(style.height[1])};` : ''}

  ${style.top ? `top: ${validateNumberValue(style.top[1])};` : ''}
  ${style.right ? `right: ${validateNumberValue(style.right[1])};` : ''}
  ${style.bottom ? `bottom: ${validateNumberValue(style.bottom[1])};` : ''}
  ${style.left ? `left: ${validateNumberValue(style.left[1])};` : ''}
  `.trim();
  return (
    <React.Fragment>
      <style
        dangerouslySetInnerHTML={{
          /* eslint-disable-line */
          __html: `.re-${id}{${small}}@media only screen and (min-width: ${bp}px) {.re-${id}{${large}}}`,
        }}
      />
      {React.Children.map(children, child =>
        React.cloneElement(child, {
          className: `re-${id}${className ? ` ${className}` : ''}`,
          ...rest,
        }),
      )}
    </React.Fragment>
  );
}
