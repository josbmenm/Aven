import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from './ThemeContext';

let responsiveIdCount = 0;

export function ColumnToRow({
  children,
  columnReverse = false,
  rowReverse = false,
  style = {},
  breakpoint,
  resetFlexBasis,
  ...rest
}) {
  const elemID = responsiveIdCount++;
  const theme = useTheme();
  const bp = breakpoint || theme.breakpoints[0];
  return (
    <React.Fragment>
      <style
        dangerouslySetInnerHTML={{
          __html: `
      .vertical-to-horizontal-layout-${elemID} {
        display: flex;
        flex-direction: ${columnReverse ? 'column-reverse' : 'column'};
      }

      .vertical-to-horizontal-layout-${elemID} > .vertical-to-horizontal-layout__child {
        margin-left: 0;
        margin-right: 0;
      }

      @media only screen and (min-width: ${bp}px) {
        .vertical-to-horizontal-layout-${elemID} {
          flex-direction: ${rowReverse ? 'row-reverse' : 'row'};
        }

        ${
          !resetFlexBasis
            ? `.vertical-to-horizontal-layout-${elemID} > .vertical-to-horizontal-layout__child {
          flex: 1;
          flex-basis: 0;
        }`
            : ''
        }
      }
      `,
        }}
      />
      <View
        className={`vertical-to-horizontal-layout-${elemID}`}
        style={style}
        {...rest}
      >
        {children}
      </View>
    </React.Fragment>
  );
}

export function ColumnToRowChild({
  className,
  inverted = false,
  style,
  ...rest
}) {
  return (
    // TODO: RESPONSIVE: add/remove margin for responsive
    <View
      className={`vertical-to-horizontal-layout__child ${className}`}
      style={StyleSheet.flatten([
        {
          alignItems: inverted ? 'flex-end' : 'flex-start',
          // marginLeft: inverted ? 20 : 0,
          // marginRight: inverted ? 0 : 20,
        },
        style,
      ])}
      {...rest}
    />
  );
}

export function NoFlexToFlex({ children, breakpoint }) {
  const theme = useTheme();
  const bp = breakpoint || theme.breakpoints[0];
  return (
    <React.Fragment>
      <style
        dangerouslySetInnerHTML={{
          __html: `
      .no-flex-to-flex,
      .no-flex-to-flex > * {
        flex: none;
      }

      @media only screen and (min-width: ${bp}px) {
        .no-flex-to-flex,
        .no-flex-to-flex > * {
          flex: 1;
        }
      }
    `,
        }}
      />
      <View className="no-flex-to-flex">{children}</View>
    </React.Fragment>
  );
}

export function Responsive({ style = {}, children, breakpoint, ...rest }) {
  const id = responsiveIdCount++;
  const theme = useTheme();
  const bp = breakpoint || theme.breakpoints[0];
  return (
    <React.Fragment>
      <style
        dangerouslySetInnerHTML={{
          __html: `
      .responsive-element-${id} {
        ${
          style.paddingVertical
            ? `padding: ${style.paddingVertical[0]}px 0;`
            : ''
        }
        ${
          style.paddingHorizontal
            ? `padding: 0 ${style.paddingHorizontal[0]}px;`
            : ''
        }
        ${style.paddingTop ? `padding-top: ${style.paddingTop[0]}px;` : ''}
        ${
          style.paddingRight ? `padding-right: ${style.paddingRight[0]}px;` : ''
        }
        ${
          style.paddingBottom
            ? `padding-bottom: ${style.paddingBottom[0]}px;`
            : ''
        }
        ${style.paddingLeft ? `padding-left: ${style.paddingLeft[0]}px;` : ''}

        ${style.marginVertical ? `margin: ${style.marginVertical[0]}px 0;` : ''}
        ${
          style.marginHorizontal
            ? `margin: 0 ${style.marginHorizontal[0]}px;`
            : ''
        }
        ${style.marginTop ? `margin-top: ${style.marginTop[0]}px;` : ''}
        ${style.marginRight ? `margin-right: ${style.marginRight[0]}px;` : ''}
        ${
          style.marginBottom ? `margin-bottom: ${style.marginBottom[0]}px;` : ''
        }
        ${style.marginLeft ? `margin-left: ${style.marginLeft[0]}px;` : ''}

        ${style.textAlign ? `text-align: ${style.textAlign[0]};` : ''}
        ${style.alignItems ? `align-items: ${style.alignItems[0]};` : ''}
      }

      @media only screen and (min-width: ${bp}px) {
        .responsive-element-${id} {
          ${
            style.paddingVertical
              ? `padding: ${style.paddingVertical[1]}px 0;`
              : ''
          }
          ${
            style.paddingHorizontal
              ? `padding: 0 ${style.paddingHorizontal[1]}px;`
              : ''
          }
          ${style.paddingTop ? `padding-top: ${style.paddingTop[1]}px;` : ''}
          ${
            style.paddingRight
              ? `padding-right: ${style.paddingRight[1]}px;`
              : ''
          }
          ${
            style.paddingBottom
              ? `padding-bottom: ${style.paddingBottom[1]}px;`
              : ''
          }
          ${style.paddingLeft ? `padding-left: ${style.paddingLeft[1]}px;` : ''}

          ${
            style.marginVertical
              ? `margin: ${style.marginVertical[1]}px 0;`
              : ''
          }
          ${
            style.marginHorizontal
              ? `margin: 0 ${style.marginHorizontal[1]}px;`
              : ''
          }
          ${style.marginTop ? `margin-top: ${style.marginTop[1]}px;` : ''}
          ${style.marginRight ? `margin-right: ${style.marginRight[1]}px;` : ''}
          ${
            style.marginBottom
              ? `margin-bottom: ${style.marginBottom[1]}px;`
              : ''
          }
          ${style.marginLeft ? `margin-left: ${style.marginLeft[1]}px;` : ''}

          ${style.textAlign ? `text-align: ${style.textAlign[1]};` : ''}
          ${style.alignItems ? `align-items: ${style.alignItems[1]};` : ''}
        }
      }
    `,
        }}
      />
      {React.Children.map(children, child =>
        React.cloneElement(child, {
          className: `responsive-element-${id}`,
          ...rest,
        }),
      )}
    </React.Fragment>
  );
}

export function ResponsiveDisplay({ breakpoint }) {
  const theme = useTheme();
  const bp = breakpoint || theme.breakpoints[0];
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `

        .hide-mobile {
          display: none;
        }

        .hide-desktop {
          display: flex;
        }

        @media only screen and (min-width: ${bp}px) {
          .hide-desktop {
            display: none;
          }

          .hide-mobile {
            display: flex;
          }
        }
      `,
      }}
    />
  );
}

export function HideDesktopView({ className, ...rest }) {
  return <View className={`hide-desktop ${className}`} {...rest} />;
}

export function HideMobileView({ className, ...rest }) {
  return <View className={`hide-mobile ${className}`} {...rest} />;
}
