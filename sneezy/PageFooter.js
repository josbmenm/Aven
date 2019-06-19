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
              alignItems: 'flex-start',
            }}
          >
            <ColumnToRow
              resetFlexBasis
              style={{ width: '100%' }}
            >
              <ColumnToRowChild
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  marginBottom: 20,
                  marginRight: 52
                }}
              >
                <OnoBlendsLogo width={80} style={{ marginRight: 20 }} />
                <OnoFoodLogo />
              </ColumnToRowChild>
              <ColumnToRowChild style={{
                alignItems: 'center',
                flexDirection: 'row',
                flex: 2,
                alignSelf: 'stretch',
                justifyContent: 'flex-start',
                marginBottom: 20
              }}>
                <FootNote style={{ marginTop: 0, marginBottom: 0 }}>
                  © Copyright 2018 Ono Food Co. All Rights Reserved
                </FootNote>
              </ColumnToRowChild>
            </ColumnToRow>
          </ColumnToRowChild>
          <ColumnToRowChild
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'flex-start',
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
                  <Link noActive text="Contact us" url="mailto:aloha@onofood.co" />
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
                  alignItems: 'flex-start',
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
