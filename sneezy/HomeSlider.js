import React from 'react';
import { View, Image, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from './ThemeContext';
import Container from './Container';

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
        // paddingVertical: 40,
        marginBottom: 100
      }}
    >
      <Container style={{
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
        paddingBottom: 100
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
    </View>
  );
}

export default HomeSlider;
