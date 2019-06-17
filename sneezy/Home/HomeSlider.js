import React from 'react';
import { View, Image, ScrollView } from 'react-native';
import Container from '../Container';

function Slide({ source, width, height }) {
  return (
    <View
      style={{
        borderRadius: 4,
        margin: 20,
      }}
    >
      <Image source={source} style={{ width, height }} />
    </View>
  );
}

function HomeSlider() {
  return (
    <View
      style={{
        paddingVertical: 40,
      }}
    >
      <Container>
        <ScrollView horizontal pagingEnabled>
          <Slide
            source={require('./assets/slides_1.jpg')}
            width={292}
            height={520}
          />
          <Slide
            source={require('./assets/slides_2.jpg')}
            width={700}
            height={520}
          />
          <Slide
            source={require('./assets/slides_3.jpg')}
            width={292}
            height={520}
          />
        </ScrollView>
      </Container>
    </View>
  );
}

export default HomeSlider;
