import { Text, View } from 'react-native';
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
  return <Text>{children}</Text>;
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
      style={{ ...theme.textStyles.footnote, ...style, ...boldStyle }}
      {...rest}
    >
      {children}
    </Text>
  );
}

export function Link({ children }) {
  return <Text>{children}</Text>;
}

export function ListItem({ children }) {
  return <Text>{children}</Text>;
}

export function VerticalToHorizontalLayout({
  children,
  columnReverse = false,
  rowReverse = false,
  style = {},
  breakpoint = 768,
  ...rest
}) {
  return (
    <React.Fragment>
      <style>{`
      .vertical-to-horizontal-layout {
        display: flex;
        flex-direction: ${columnReverse ? 'column-reverse' : 'column'};
      }

      .vertical-to-horizontal-layout > .vertical-to-horizontal-layout__child {
      }

      @media only screen and (min-width: ${breakpoint}px) {
        .vertical-to-horizontal-layout {
          flex-direction: ${rowReverse ? 'row-reverse' : 'row'};
        }

        .vertical-to-horizontal-layout > .vertical-to-horizontal-layout__child {
          flex: 1;
          flex-basis: 0;
        }
      }
    `}</style>
      <View className="vertical-to-horizontal-layout" style={style} {...rest}>
        {children}
      </View>
    </React.Fragment>
  );
}

export function NoFlexToFlex({ children, breakpoint = 768 }) {
  return (
    <React.Fragment>
      <style>{`
        .no-flex-to-flex,
        .no-flex-to-flex > * {
          flex: none;
        }

        @media only screen and (min-width: ${breakpoint}px) {
          .no-flex-to-flex,
          .no-flex-to-flex > * {
            flex: 1;
          }
        }
      `}</style>
      <View className="no-flex-to-flex">
        {children}
      </View>
    </React.Fragment>
  );
}
