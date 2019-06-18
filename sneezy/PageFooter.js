import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Container from './Container';
import { useTheme } from './ThemeContext';
import OnoBlendsLogo from './OnoBlendsLogo';
import OnoFoodLogo from './OnoFoodLogo';
import { Link } from './Buttons';
import { V2HLayout, V2HLayoutChild, FootNote } from './Tokens';

export default function PageFooter() {
  const theme = useTheme();
  return (
    <View>
      <Container
        style={{
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.colors.border,
          paddingVertical: 100,
        }}
      >
        <V2HLayout columnReverse resetFlexBasis>
          <V2HLayoutChild
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 10,
            }}
          >
            <V2HLayout
              style={{ width: '100%', marginVertical: 20 }}
            >
              <V2HLayoutChild
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  flex: 1,
                  justifyContent: 'flex-start',
                }}
              >
                <OnoBlendsLogo width={80} style={{ marginRight: 20 }} />
                <OnoFoodLogo />
              </V2HLayoutChild>
              <V2HLayoutChild style={{
                alignItems: 'center',
                flexDirection: 'row',
                flex: 1,
                justifyContent: 'flex-start'
              }}>
                <FootNote style={{ textAlign: 'center', marginTop: 0, marginBottom: 0 }}>
                  © Copyright 2018 Ono Food Co. All Rights Reserved
                </FootNote>
              </V2HLayoutChild>
            </V2HLayout>
          </V2HLayoutChild>
          <V2HLayoutChild
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 10,
            }}
          >
            <V2HLayout resetFlexBasis style={{ flex: 1 }}>
              <V2HLayoutChild
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  marginBottom: 40,
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
                  <Link
                    noActive
                    text="Subscribe to updates"
                    routeName="Subscribe"
                  />
                </View>
              </V2HLayoutChild>
              <V2HLayoutChild
                style={{
                  paddingTop: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 40,
                }}
              >
                {/* Instagram Icon */}
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
              </V2HLayoutChild>
            </V2HLayout>
          </V2HLayoutChild>
        </V2HLayout>
      </Container>
    </View>
  );
}
