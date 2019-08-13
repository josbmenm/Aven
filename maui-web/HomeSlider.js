import React from 'react';
import { Image, ScrollView, StyleSheet } from 'react-native';
import View from '../views/View';
import { useTheme } from '../dashboard/Theme';
import { Responsive } from '../dashboard/Responsive';
import Container from '../dashboard/Container';

function Slide({ source, width, height }) {
  return (
    <View
      style={{
        borderRadius: 4,
        margin: 20,
      }}
    >
      <Responsive
        style={{
          width: [width / 2, width],
          height: [height / 2, height],
        }}
      >
        <View>
          <Image source={source} style={{ flex: 1 }} />
        </View>
      </Responsive>
    </View>
  );
}

function HomeSlider() {
  const theme = useTheme();
  return (
    <View
      style={{
        marginBottom: 70,
      }}
    >
      <Container
        style={{
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.border,
        }}
        responsiveStyle={{
          paddingBottom: [0, 120],
        }}
      >
        <ScrollView horizontal pagingEnabled style={{ paddingBottom: 80 }}>
          {/* <Slide
            source={require('./public/img/Blend_Mango_Turmeric.png')}
            width={292}
            height={520}
          /> */}
          <Slide
            source={require('./public/img/Papaya-Pineapple.jpg')}
            width={292}
            height={520}
          />
          <Slide
            source={require('./public/img/OnoGuides.png')}
            width={700}
            height={520}
          />
          <Slide
            source={require('./public/img/Mint-Chip-Protein.jpg')}
            width={292}
            height={520}
          />
          <Slide
            source={require('./public/img/Strawberry-Dragon-Fruit.jpg')}
            width={292}
            height={520}
          />

          <Slide
            source={require('./public/img/RestaurantBeachClose.jpg')}
            width={700}
            height={520}
          />
          <Slide
            source={require('./public/img/Mango-Turmeric.jpg')}
            width={292}
            height={520}
          />

          {/* <Slide
            source={require('./public/img/Blend_Straw_Dragonfruit.png')}
            width={292}
            height={520}
          /> */}
        </ScrollView>
      </Container>
    </View>
  );
}

export default HomeSlider;
