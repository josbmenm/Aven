import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Container from './Container';
import { useTheme } from './ThemeContext';
import OnoBlendsLogo from './OnoBlendsLogo';
import OnoFoodLogo from './OnoFoodLogo';
import { FootNote, Link } from './Tokens';
import FunctionalLink from '../navigation-web/Link';
import { ColumnToRow, ColumnToRowChild } from './Responsive';

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
            <ColumnToRow resetFlexBasis style={{ width: '100%' }}>
              <ColumnToRowChild
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  marginBottom: 20,
                  marginRight: 32,
                }}
              >
                <OnoBlendsLogo width={80} style={{ marginRight: 20 }} />
                <OnoFoodLogo />
              </ColumnToRowChild>
              <ColumnToRowChild
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  flex: 2,
                  alignSelf: 'stretch',
                  justifyContent: 'flex-start',
                  marginBottom: 20,
                }}
              >
                <FootNote style={{ marginTop: 0, marginBottom: 0 }}>
                  © Copyright {new Date().getFullYear()} Ono Food Co. All Rights
                  Reserved
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
                  <Link noActive titleStyle={{textAlign: 'left'}} title="Menu" routeName="Menu" />
                  <Link noActive titleStyle={{textAlign: 'left'}} title="Our story" routeName="OurStory" />
                  <Link noActive titleStyle={{textAlign: 'left'}} title="Book with us" routeName="BookUs" />
                </View>
                <View style={{ flex: 1 }}>
                  <Link noActive titleStyle={{textAlign: 'left'}} title="Press kit" url="https://google.com" />
                  <Link noActive titleStyle={{textAlign: 'left'}} title="Terms & privacy" routeName="Terms" />
                  <Link noActive titleStyle={{textAlign: 'left'}} title="Contact us" url="mailto:aloha@onofood.co" />
                  <Link noActive titleStyle={{textAlign: 'left'}} title="Subscribe to updates" routeName="Subscribe" />
                </View>
              </ColumnToRowChild>
              <ColumnToRowChild
                style={{
                  paddingTop: 4,
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  marginBottom: 40,
                }}
              >
                <FunctionalLink url="https://www.twitter.com/onofoodco/">
                  <View
                    style={{
                      flexDirection: 'row',
                      marginBottom: 8,
                    }}
                  >
                    <SocialIcon icon={require('./public/img/twitter.png')} />
                    <Text style={theme.textStyles.footnote}>@onofodco</Text>
                  </View>
                </FunctionalLink>
                <FunctionalLink url="https://www.facebook.com/onofoodco/">
                  <View
                    style={{
                      flexDirection: 'row',
                      marginBottom: 8,
                    }}
                  >
                    <SocialIcon icon={require('./public/img/facebook.png')} />
                    <Text style={theme.textStyles.footnote}>@onofodco</Text>
                  </View>
                </FunctionalLink>
                <FunctionalLink url="https://www.instagram.com/onofoodco/">
                  <View
                    style={{
                      flexDirection: 'row',
                      marginBottom: 8,
                    }}
                  >
                    <SocialIcon icon={require('./public/img/instagram.png')} />
                    <Text style={theme.textStyles.footnote}>@onofodco</Text>
                  </View>
                </FunctionalLink>
              </ColumnToRowChild>
            </ColumnToRow>
          </ColumnToRowChild>
        </ColumnToRow>
      </Container>
    </View>
  );
}

function SocialIcon({ icon }) {
  const theme = useTheme();
  if (typeof icon === 'undefined') {
    console.error('SocialIcon required an `icon` prop');
    return null;
  }
  return (
    <Image
      resizeMode="contain"
      source={icon}
      style={{
        backgroundColor: theme.colors.lightGrey,
        width: 20,
        height: 20,
        borderRadius: 2,
        marginRight: 8,
      }}
    />
  );
}
