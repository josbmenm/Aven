import React from 'react';
import { Heading, Text } from '../dash-ui';
import { Image } from 'react-native';
import BodyText from '../dashboard-ui-deprecated/BodyText';
import GenericPage from './GenericPage';
import PageFooter from './PageFooter';
import View from '../views/View';
import Container from '../dashboard-ui-deprecated/Container';
import ButtonLink from '../dashboard-ui-deprecated/ButtonLink';
import Link from './Link';
import CareerRoles from './CareerRoles';
import { absoluteElement } from '../components/Styles';
import {
  ColumnToRow,
  ColumnToRowChild,
  NoFlexToFlex,
} from '../dashboard-ui-deprecated/Responsive';
import { Responsive } from '../dashboard-ui-deprecated/Responsive';
import { useTheme } from '../dashboard-ui-deprecated/Theme';

const breakpoints = [1024, 1400];

function RolesList() {
  return (
    <View>
      <Heading title="Hiring for Roles" />
      {Object.entries(CareerRoles).map(([roleId, role]) => (
        <Link
          title={role.roleName}
          routeName="CareerListing"
          params={{ roleId }}
        />
      ))}
    </View>
  );
}

function CareersPage() {
  const theme = useTheme();
  return (
    <GenericPage>
      <Responsive
        breakpoints={breakpoints}
        style={{
          marginBottom: [30, 60],
        }}
      >
        <View style={{ flex: 1 }}>
          <NoFlexToFlex>
            <Container
              style={{ flex: 1 }}
              responsiveStyle={{
                width: ['100% !important', '100%'],
                marginHorizontal: [0, 28],
              }}
            >
              <ColumnToRow
                columnReverse
                breakpoints={breakpoints}
                style={{
                  flex: 1,
                }}
              >
                <Responsive
                  breakpoints={breakpoints}
                  style={{
                    left: [0, -440],
                    bottom: [0, -140],
                  }}
                >
                  <Image
                    className="hide-mobile"
                    source={require('./public/img/fruit_silhouette.png')}
                    style={{
                      ...absoluteElement,
                      zIndex: 0,
                      width: 521,
                      height: 383,
                    }}
                    pointerEvents="none"
                  />
                </Responsive>
                <Responsive
                  breakpoints={breakpoints}
                  style={{
                    right: [-440, -440],
                    top: [-156, -140],
                  }}
                >
                  <Image
                    source={require('./public/img/fruit_silhouette.png')}
                    style={{
                      ...absoluteElement,
                      width: 521,
                      height: 383,
                      zIndex: 0,
                    }}
                    pointerEvents="none"
                  />
                </Responsive>
                <ColumnToRowChild>
                  <Responsive
                    breakpoints={breakpoints}
                    style={{
                      paddingTop: [40, 230],
                      paddingRight: [32, 32],
                      paddingBottom: [70, 200],
                      paddingLeft: [32, 100],
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: theme.colors.lightGrey,
                        justifyContent: 'center',
                        boxSizing: 'border-box',
                      }}
                    >
                      <Heading
                        size="large"
                        breakpoints={breakpoints}
                        responsiveStyle={{
                          marginBottom: [16, 26],
                        }}
                      >
                        media kit
                      </Heading>
                      <BodyText
                        responsiveStyle={{
                          marginBottom: [20, 45],
                        }}
                      >
                        Thanks for your interest in Ono Food Co. You can find
                        media assets by clicking the button below, but if you
                        have any questions, feel free to email us at{' '}
                        <a
                          href="mailto:aloha@onofood.co"
                          style={{ fontWeight: 'bold' }}
                        >
                          aloha@onofood.co
                        </a>
                        .
                      </BodyText>

                      <ButtonLink
                        target="_blank"
                        title="download the press kit"
                        url="https://www.dropbox.com/sh/pqovhpomd86tkwv/AAAlWNK8M737FghzfDawT4T7a?dl=0"
                        titleStyle={{ fontSize: 20 }}
                      />
                    </View>
                  </Responsive>
                </ColumnToRowChild>
                <ColumnToRowChild>
                  <Responsive
                    breakpoints={breakpoints}
                    style={{
                      marginHorizontal: [28, 0],
                      marginBottom: [12, 0],
                      width: ['auto', '100%'],
                    }}
                  >
                    <View style={{ width: '100%', flex: 1 }}>
                      <Image
                        source={require('./public/img/OnoLanding.png')}
                        resizeMode="cover"
                        style={{ flex: 1, width: '100%', paddingTop: '56.25%' }}
                      />
                    </View>
                  </Responsive>
                </ColumnToRowChild>
              </ColumnToRow>
            </Container>
          </NoFlexToFlex>
        </View>
      </Responsive>
      <RolesList />
      <PageFooter />
    </GenericPage>
  );
}

CareersPage.navigationOptions = {
  title: 'Join Ono',
};

export default CareersPage;
