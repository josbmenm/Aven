import { Text, View, StyleSheet } from 'react-native';
import React from 'react';
import { useTheme } from './ThemeContext';

export function SubSection({ title, children }) {
  return (
    <View style={{ marginVertical: 40 }}>
      {title ? <Title style={{ marginBottom: 24 }}>{title}</Title> : null}
      {children}
    </View>
  );
}

export function Section({ title, children }) {
  return (
    <View>
      <Text style={{ fontSize: 32 }}>{title}</Text>
      {children}
    </View>
  );
}

export function Heading({ children, style, ...rest }) {
  const theme = useTheme();
  return (
    <Text style={{ ...theme.textStyles.heading, ...style }} {...rest}>
      {children}
    </Text>
  );
}

export function Title({ children, style, ...rest }) {
  const theme = useTheme();
  return (
    <Text style={{ ...theme.textStyles.title, ...style }} {...rest}>
      {children}
    </Text>
  );
}

export function List({ children }) {
  return (
    <View
      style={{
        marginLeft: 20,
      }}
    >
      {children}
    </View>
  );
}

export function ListItem({ children }) {
  const theme = useTheme();
  return (
    <View style={{ position: 'relative' }}>
      <View
        style={{
          position: 'absolute',
          width: 6,
          height: 6,
          borderRadius: 4,
          backgroundColor: theme.colors.primary,
          left: -20,
          top: 12,
        }}
      />
      <BodyText>{children}</BodyText>
    </View>
  );
}

export function BodyText({ children, bold, style, ...rest }) {
  const theme = useTheme();
  let boldStyle = bold ? { fontWeight: 'bold' } : {};
  return (
    <Text
      style={{ ...theme.textStyles.body, ...style, ...boldStyle }}
      {...rest}
    >
      {children}
    </Text>
  );
}

export function FootNote({ children, bold, style, ...rest }) {
  const theme = useTheme();
  let boldStyle = bold ? { fontWeight: 'bold' } : {};
  return (
    <Text
      style={StyleSheet.flatten([
        { ...theme.textStyles.footnote, ...boldStyle },
        style,
      ])}
      {...rest}
    >
      {children}
    </Text>
  );
}

export function Link({ children }) {
  return <Text>{children}</Text>;
}

let responsiveIdCount = 0;

export function V2HLayout({
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

export function V2HLayoutChild({
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
