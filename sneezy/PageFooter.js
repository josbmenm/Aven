import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Container from './Container';
import { useTheme } from './ThemeContext';
import OnoBlendsLogo from './OnoBlendsLogo';
import OnoFoodLogo from './OnoFoodLogo';
import { Link } from './Buttons';
import { ColumnToRow, ColumnToRowChild, FootNote } from './Tokens';

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
        <ColumnToRow columnReverse resetFlexBasis>
          <ColumnToRowChild
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 10,
            }}
          >
            <ColumnToRow
              style={{ width: '100%', marginVertical: 20 }}
            >
              <ColumnToRowChild
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  flex: 1,
                  justifyContent: 'flex-start',
                }}
              >
                <OnoBlendsLogo width={80} style={{ marginRight: 20 }} />
                <OnoFoodLogo />
              </ColumnToRowChild>
              <ColumnToRowChild style={{
                alignItems: 'center',
                flexDirection: 'row',
                flex: 1,
                justifyContent: 'flex-start'
              }}>
                <FootNote style={{ textAlign: 'center', marginTop: 0, marginBottom: 0 }}>
                  © Copyright 2018 Ono Food Co. All Rights Reserved
                </FootNote>
              </ColumnToRowChild>
            </ColumnToRow>
          </ColumnToRowChild>
          <ColumnToRowChild
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 10,
            }}
          >
            <ColumnToRow resetFlexBasis style={{ flex: 1 }}>
              <ColumnToRowChild
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
              </ColumnToRowChild>
              <ColumnToRowChild
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
              </ColumnToRowChild>
            </ColumnToRow>
          </ColumnToRowChild>
        </ColumnToRow>
      </Container>
    </View>
  );
}
