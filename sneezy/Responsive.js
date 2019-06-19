import React from 'react'
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

export function Responsive({
  style = {},
  children,
  breakpoint,
  ...rest
}) {
  const id = responsiveIdCount++;
  const theme = useTheme();
  const bp = breakpoint || theme.breakpoints[0];
  return (
    <React.Fragment>
      <style
        dangerouslySetInnerHTML={{
          __html: `
      .responsive-element-${id} {
        padding-left: ${style.paddingLeft[0]}px;
      }

      @media only screen and (min-width: ${bp}px) {
        .responsive-element-${id} {
          padding-left: ${style.paddingLeft[1]}px;
        }
      }
    `,
        }}
      />
      {React.cloneElement(children, { className: `responsive-element-${id}` })}
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
  return (
    <View className={`hide-desktop ${className}`} {...rest} />
  )
}

export function HideMobileView({ className, ...rest }) {
  return (
    <View className={`hide-mobile ${className}`} {...rest} />
  )
}
