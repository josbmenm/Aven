import React from 'react';
import { Image, StyleSheet } from 'react-native';
import View from '../views/View';
import SmallText from '../dashboard-ui-deprecated/SmallText';
import BodyText from '../dashboard-ui-deprecated/BodyText';
import Container from '../dashboard-ui-deprecated/Container';
import { useTheme } from '../dashboard-ui-deprecated/Theme';
import OnoBlendsLogo from './OnoBlendsLogo';
import OnoFoodLogo from './OnoFoodLogo';
import Link from './Link';
import FunctionalLink from '../navigation-web/Link';
import {
  ColumnToRow,
  ColumnToRowChild,
} from '../dashboard-ui-deprecated/Responsive';

function SocialText(props) {
  const theme = useTheme();
  return (
    <SmallText
      style={{
        fontSize: 12,
        lineHeight: 18,
        fontFamily: theme.fonts.regular,
      }}
      {...props}
    />
  );
}

function FooterLink({ ...children }) {
  return (
    <Link
      {...children}
      titleStyle={{ textAlign: 'left', alignSelf: 'flex-start' }}
    />
  );
}

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
                  alignItems: 'flex-start',
                  // flexDirection: 'row',
                  flex: 2,
                  alignSelf: 'stretch',
                  justifyContent: 'flex-start',
                  marginBottom: 20,
                }}
              >
                <SmallText
                  size="medium"
                  style={{
                    fontSize: 11,
                    lineHeight: 18,
                    fontFamily: theme.fonts.regular,
                    maxWidth: 178,
                  }}
                >
                  © Copyright {new Date().getFullYear()} Ono Food Co. All Rights
                  Reserved
                </SmallText>
                <Link
                  routeName="Login"
                  title="employee log in"
                  titleStyle={{ fontSize: 11, fontWeight: 'normal' }}
                  buttonStyle={{ paddingHorizontal: 0 }}
                />
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
                  <FooterLink
                    titleStyle={{ textAlign: 'left' }}
                    title="menu"
                    routeName="Menu"
                  />
                  <FooterLink
                    titleStyle={{ textAlign: 'left' }}
                    title="our story"
                    routeName="OurStory"
                  />
                  <FooterLink
                    titleStyle={{ textAlign: 'left' }}
                    title="book with us"
                    routeName="BookUs"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <FooterLink
                    titleStyle={{ textAlign: 'left' }}
                    title="press"
                    routeName="Press"
                    buttonStyle={{
                      paddingHorizontal: 0,
                      paddingLeft: 8,
                    }}
                  />
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'baseline',
                    }}
                  >
                    <FooterLink
                      titleStyle={{ textAlign: 'left' }}
                      title="terms"
                      routeName="Terms"
                      buttonStyle={{
                        paddingHorizontal: 0,
                        paddingLeft: 8,
                      }}
                    />
                    <BodyText
                      style={{
                        fontFamily: theme.fonts.bold,
                        fontSize: 16,
                        lineHeight: 24,
                        color: theme.colors.primary,
                      }}
                    >
                      &
                    </BodyText>
                    <FooterLink
                      titleStyle={{ textAlign: 'left' }}
                      title="privacy"
                      routeName="Privacy"
                      buttonStyle={{
                        paddingHorizontal: 0,
                        paddingRight: 8,
                      }}
                    />
                  </View>

                  <FooterLink
                    title="contact us"
                    url="mailto:aloha@onofood.co"
                  />
                </View>
              </ColumnToRowChild>
              <ColumnToRowChild
                style={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  marginBottom: 40,
                }}
              >
                <FunctionalLink
                  url="https://www.twitter.com/onofoodco/"
                  overrideATagCSS={{
                    paddingVertical: 4,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      borderWidth: 3,
                      borderColor: 'transparent',
                      paddingVertical: 4,
                    }}
                  >
                    <SocialIcon icon={require('./public/img/twitter.png')} />
                    <SocialText>@onofoodco</SocialText>
                  </View>
                </FunctionalLink>
                <FunctionalLink
                  url="https://www.facebook.com/onofoodco/"
                  overrideATagCSS={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      borderWidth: 3,
                      borderColor: 'transparent',
                      paddingVertical: 4,
                    }}
                  >
                    <SocialIcon icon={require('./public/img/facebook.png')} />
                    <SocialText>@onofoodco</SocialText>
                  </View>
                </FunctionalLink>
                <FunctionalLink
                  url="https://www.instagram.com/onofoodco/"
                  overrideATagCSS={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      borderWidth: 3,
                      borderColor: 'transparent',
                      paddingVertical: 4,
                    }}
                  >
                    <SocialIcon icon={require('./public/img/instagram.png')} />
                    <SocialText>@onofoodco</SocialText>
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
  if (typeof icon === 'undefined') {
    console.error('SocialIcon required an `icon` prop');
    return null;
  }
  return (
    <Image
      resizeMode="contain"
      source={icon}
      style={{
        width: 20,
        height: 20,
        borderRadius: 2,
        marginRight: 8,
      }}
    />
  );
}
