import React from 'react';
import { View, Text } from 'react-native';
import Container from './Container';
import Heading from './Heading';
import BodyText from './BodyText';

export default function GenericHeroHeader({
  title,
  bodyText,
  backgroundColor,
  children
}) {
  return (
    <Container style={{position: 'relative'}}>
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
            paddingHorizontal: 80,
            paddingVertical: 120,
            maxWidth: 720,
          }}
        >
          <Heading style={{ textAlign: 'center' }}>{title}</Heading>
          <BodyText style={{ textAlign: 'center' }}>{bodyText}</BodyText>
        </View>
      </View>
      {children}
    </Container>
  );
}
