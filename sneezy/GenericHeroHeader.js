import React from 'react';
import { View, Text } from 'react-native';
import Container from './Container';
import { useTheme } from './ThemeContext';
import { Heading, BodyText } from './Tokens';

export default function GenericHeroHeader({
  title,
  bodyText,
  backgroundColor,
}) {
  return (
    <Container>
      <View
        style={{
          flex: 1,
          backgroundColor,
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
          <Heading style={{ textAlign: 'center' }}>{title}</Heading>
          <BodyText style={{ textAlign: 'center' }}>{bodyText}</BodyText>
        </View>
      </View>
    </Container>
  );
}
