import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import Highlight, { defaultProps } from 'prism-react-renderer';
import theme from 'prism-react-renderer/themes/duotoneLight';

import InnerLink from '../navigation-web/Link';

const baseFontSize = 16;

export function Link({ children, ...props }) {
  return <InnerLink {...props}>{children}</InnerLink>;
}

export function Title({ children }) {
  return (
    <Text style={{ fontSize: 42, marginBottom: 30, color: '#486B7A' }}>
      {children}
    </Text>
  );
}

export function Bold({ children }) {
  return <Text style={{ fontWeight: 'bold' }}>{children}</Text>;
}

export function Body({ children }) {
  return (
    <Text
      style={{
        fontSize: baseFontSize,
        paddingVertical: 10,
        lineHeight: baseFontSize + 7,
      }}
    >
      {children}
    </Text>
  );
}

export function Page({ children }) {
  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 40 }}>{children}</View>
    </ScrollView>
  );
}

export function List({ children }) {
  return <View style={{ marginVertical: 10 }}>{children}</View>;
}

export function Snippet({ code }) {
  return (
    <Highlight {...defaultProps} code={code} language="jsx" theme={theme}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={className} style={{ fontSize: baseFontSize, ...style }}>
          <View style={{ paddingVertical: 3, paddingHorizontal: 20 }}>
            {tokens.map((line, i) => (
              <div {...getLineProps({ line, key: i })} key={i}>
                {line.map((token, key) => (
                  <span {...getTokenProps({ token, key })} key={key} />
                ))}
              </div>
            ))}
          </View>
        </pre>
      )}
    </Highlight>
  );
}

function createSection(opts) {
  function Section({ title, children }) {
    return (
      <View
        style={{
          paddingTop: 10,
          marginVertical: 10,
          borderColor: '#aaa',
          borderTopWidth: opts.hasLine ? 1 : 0,
        }}
      >
        <Text style={{ fontSize: opts.titleSize, color: '#486B7A' }}>
          {title}
        </Text>
        {children}
      </View>
    );
  }
  return Section;
}

export const Section = createSection({ titleSize: 32, hasLine: true });
export const SubSection = createSection({ titleSize: 26 });

export function ListItem({ children }) {
  console.log(React.Children.count(children));
  return (
    <View style={{}}>
      <Text style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 5 }}>
        {children}
      </Text>
      <Text
        style={{ position: 'absolute', left: 5, top: 5 }}
        selectable={false}
      >
        •
      </Text>
    </View>
  );
}
