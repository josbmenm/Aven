import React from 'react';
import { View, Text } from 'react-native';
import Container from './Container';
import { useTheme } from './ThemeContext';
import { Heading, BodyText } from './Tokens';

export default function GenericHeroHeader({ title, bodyText }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <Container
        style={{
          flex: 1,
          flexDirection: 'column',
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: theme.colors.lightGrey,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 40,
                paddingVertical: 120,
                maxWidth: 720,
              }}
            >
              <Heading>{title}</Heading>
              <BodyText style={{ textAlign: 'center' }}>{bodyText}</BodyText>
            </View>
          </View>
        </View>
      </Container>
    </View>
  );
}
