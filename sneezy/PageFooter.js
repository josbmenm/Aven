import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Container from './Container';
import { useTheme } from './ThemeContext';
import OnoBlendsLogo from './OnoBlendsLogo';
import OnoFoodLogo from './OnoFoodLogo';
import { Link } from './Buttons';

export default function PageFooter() {
  const theme = useTheme();
  return (
    <View>
      <Container
        style={{
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.colors.border,
          paddingVertical: 100,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            paddingRight: 20,
          }}
        >
          <OnoBlendsLogo width={80} style={{ marginRight: 20 }} />
          <OnoFoodLogo style={{ marginRight: 52 }} />
          <Text style={theme.textStyles.footnote}>
            © Copyright 2018 Ono Food Co. All Rights Reserved
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: 20,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
            }}
          >
            <View style={{ flex: 1 }}>
              <Link noActive text="Menu" routeName="Menu" />
              <Link noActive text="Our story" routeName="OurStory" />
              <Link noActive text="Book with us" routeName="BookWithUs" />
            </View>
            <View style={{ flex: 1 }}>
              <Link noActive text="Press kit" routeName="PressKit" />
              <Link noActive text="Terms & privacy" routeName="Terms" />
              <Link noActive text="Contact us" routeName="ContactUs" />
              <Link noActive text="Subscribe to updates" routeName="Subscribe" />
            </View>
          </View>
          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 4,
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors.lightGrey,
                width: 20,
                height: 20,
                borderRadius: 2,
                marginRight: 8,
              }}
            />
            <Text style={theme.textStyles.footnote}>@onofodco</Text>
          </View>
        </View>
      </Container>
    </View>
  );
}
