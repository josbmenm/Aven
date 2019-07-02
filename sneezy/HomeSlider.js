import React from 'react';
import { Image, ScrollView, StyleSheet } from 'react-native';
import View from '../views/View';
import { useTheme } from '../dashboard/Theme'
import Container from './Container';
import { Responsive } from './Responsive';

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
  const theme = useTheme();
  return (
    <View
      style={{
        marginBottom: 70
      }}
    >
      <Responsive style={{
        paddingBottom: [70, 200]
      }}>
      <Container style={{
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
      }}>
        <ScrollView horizontal pagingEnabled>
          <Slide
            source={require('./public/img/slides_1.jpg')}
            width={292}
            height={520}
          />
          <Slide
            source={require('./public/img/slides_2.jpg')}
            width={700}
            height={520}
          />
          <Slide
            source={require('./public/img/slides_3.jpg')}
            width={292}
            height={520}
          />
        </ScrollView>
      </Container>
      </Responsive>
    </View>
  );
}

export default HomeSlider;
