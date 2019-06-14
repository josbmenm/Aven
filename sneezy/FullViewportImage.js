import React from 'react';
import { View, Image } from 'react-native';
import Container from './Container';
import { aspectRatio169 } from '../components/Styles';

export default function HeroHeader({ source, style, ...rest }) {
  return (
    <View style={{ flex: 1, paddingVertical: 38 }}>
      <Container>
        <Image
          source={source}
          resizeMode="cover"
          style={{ ...aspectRatio169 }}
        />
      </Container>
    </View>
  );
}
