import React from 'react';
import { Image } from 'react-native';
import View from '../views/View';
import GenericPage from './GenericPage';
import { useNavigation } from '../navigation-hooks/Hooks';
import PageFooter from './PageFooter';
import Container from '../dashboard/Container';
import Heading from '../dashboard/Heading';
import Text from '../dashboard/Text';
import Tag from '../dashboard/Tag';
import { useTheme } from '../dashboard/Theme';
import { useMenuItemSlug, useCompanyConfig } from '../ono-cloud/OnoKitchen';
import AirtableImage from '../components/AirtableImage';
import { dietaryInfosOfMenuItem } from '../logic/configLogic';

import {
  displayNameOfMenuItem,
  getSelectedIngredients,
} from '../logic/configLogic';
import { ColumnToRow, ColumnToRowChild } from './Responsive';
import { Responsive } from '../dashboard/Responsive';
import { BlendsCarousel } from './BlendsList';
import BenefitDetails from './BenefitDetails';

function BlendContent({ displayName, blend, recipe }) {
  const theme = useTheme();
  const dietaryInfos = dietaryInfosOfMenuItem(
    blend,
    recipe.ingredients.map(i => i.id),
  );
  const dietary = [
    `${blend.Recipe.DisplayCalories} Calories`,
    blend.Recipe['Nutrition Detail'],
  ];
  return (
    <React.Fragment>
      <Responsive
        style={{
          marginBottom: [40, 100],
        }}
      >
        <View>
          <Container
            style={{
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            }}
            responsiveStyle={{
              paddingBottom: [40, 120],
            }}
          >
            <ColumnToRow>
              <ColumnToRowChild
                style={{
                  position: 'relative',
                }}
              >
                <Responsive
                  style={{
                    position: ['relative', 'absolute'],
                    transform: [[{ scale: 1 }], [{ scale: 1.2 }]],
                  }}
                >
                  <View
                    style={{
                      width: '100%',
                      height: '100%',
                      bottom: 0,
                      right: 0,
                      zIndex: -1,
                    }}
                  >
                    <AirtableImage
                      image={blend.Recipe.DecorationImage}
                      resizeMode="contain"
                      style={{
                        flex: 1,
                        width: '100%',
                        height: '100%',
                        paddingTop: '56.25%',
                      }}
                    />
                    {/* <Image
                      source={require('./public/img/blend-preview.png')}
                      resizeMode="contain"
                      style={{
                        flex: 1,
                        width: '100%',
                        height: '100%',
                        paddingTop: '56.25%',
                      }}
                    /> */}
                  </View>
                </Responsive>
                <Image
                  style={{
                    position: 'absolute',
                    bottom: -48,
                    right: 0,
                    left: 0,
                    height: 100,
                    width: '100%',
                  }}
                  source={require('./public/img/white-gradient-bottom.png')}
                  resizeMode="repeat"
                />
              </ColumnToRowChild>
              <Responsive
                style={{
                  alignItems: ['center', 'flex-start'],
                }}
              >
                <ColumnToRowChild>
                  <Responsive
                    style={{
                      alignSelf: ['center !important', 'flex-start !important'],
                    }}
                  >
                    <Tag
                      style={{ marginBottom: 8 }}
                      title={blend.DefaultBenefitName}
                    />
                  </Responsive>
                  <Heading
                    size="large"
                    responsiveStyle={{
                      marginBottom: [16, 8],
                    }}
                  >
                    {displayName}
                  </Heading>
                  <Responsive
                    style={{
                      marginBottom: [28, 36],
                    }}
                  >
                    <View
                      style={{
                        alignItems: 'flex-start',
                        flexDirection: 'row',
                      }}
                    >
                      {blend.Benefits.map(benefit => (
                        <View
                          key={benefit.id}
                          style={{
                            marginRight: 12,
                            alignItems: 'center',
                          }}
                        >
                          <AirtableImage
                            image={benefit.Icon}
                            tintColor={theme.colors.monsterras[0]}
                            resizeMode="contain"
                            style={{ width: 60, height: 60 }}
                          />
                          <Text
                            bold
                            style={{
                              fontSize: 10,
                              fontFamily: theme.fonts.bold,
                              lineHeight: 24,
                              textTransform: 'uppercase',
                            }}
                          >
                            {benefit.Name}
                            siz{' '}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </Responsive>
                  <Text
                    size="large"
                    style={{ marginBottom: 48 }}
                    responsiveStyle={{
                      textAlign: ['center', 'left'],
                      marginBottom: [32, 48],
                    }}
                  >
                    {blend['Display Description']}
                  </Text>
                  <Responsive
                    style={{
                      marginBottom: [40, 20],
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                      }}
                    >
                      {dietary.map((dietaryMessage, index) => (
                        <View
                          key={index}
                          style={{
                            borderRightColor:
                              index + 1 === dietary.length
                                ? 'transparent'
                                : theme.colors.monsterra,
                            borderRightWidth: 1,
                            justifyContent: 'center',
                            marginRight: 8,
                            paddingRight: 8,
                            height: 16,
                          }}
                        >
                          <Text
                            style={{
                              marginBottom: 0,
                              fontSize: 12,
                              letterSpacing: 0.3,
                              fontFamily: theme.fonts.normal,
                            }}
                          >
                            {dietaryMessage}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </Responsive>
                  <View
                    style={{
                      flexDirection: 'row',
                      marginBottom: 20,
                    }}
                  >
                    {dietaryInfos.map(d => (
                      <View
                        key={d.id}
                        style={{
                          marginRight: 20,
                          alignItems: 'center',
                        }}
                      >
                        <AirtableImage
                          key={d.id}
                          image={d.Icon}
                          style={{
                            width: 32,
                            height: 32,
                            marginBottom: 8,
                          }}
                          tintColor={theme.colors.monsterra}
                        />
                        <Text
                          bold
                          style={{
                            fontSize: 12,
                            fontFamily: theme.fonts.bold,
                            textTransform: 'uppercase',
                          }}
                        >
                          {d.Name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </ColumnToRowChild>
              </Responsive>
            </ColumnToRow>
          </Container>
        </View>
      </Responsive>
      <BenefitDetails benefit={blend.DefaultBenefit} />
      <View>
        <Container
          style={{
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}
          responsiveStyle={{
            paddingBottom: [60, 100],
            marginBottom: [40, 100],
          }}
        >
          <Heading style={{ marginBottom: 16 }}>organic ingredients</Heading>
          <Text
            size="large"
            style={{ maxWidth: 520, textAlign: 'center' }}
            responsiveStyle={{
              marginBottom: [60, 90],
            }}
          >
            All of our ingredients for our drinks are locally sourced, fully
            organic, and guarenteed to taste amazing.
          </Text>
          <View
            style={{
              flexWrap: 'wrap',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {recipe.ingredients.map((ing, index) => (
              <View
                index={index}
                style={{
                  margin: 10,
                }}
              >
                <AirtableImage
                  key={ing.id}
                  image={ing.Image}
                  style={{
                    width: 196,
                    height: 196,
                    marginBottom: 8,
                  }}
                />
                <Text
                  size="small"
                  bold
                  style={{
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    fontFamily: theme.fonts.bold,
                    lineHeight: 24,
                  }}
                >
                  {ing.Name}
                </Text>
              </View>
            ))}
          </View>
        </Container>
      </View>
    </React.Fragment>
  );
}

function BlendPage() {
  const { getParam } = useNavigation();
  const companyConfig = useCompanyConfig();
  const blendSlug = getParam('slug');
  const blend = useMenuItemSlug(blendSlug);
  const itemRecipe = React.useMemo(() => {
    const result = getSelectedIngredients(
      blend,
      { customization: null },
      companyConfig,
    );
    return result;
  }, [blend, companyConfig]);

  const displayName = displayNameOfMenuItem(blend);
  return (
    <GenericPage>
      {blend && (
        <BlendContent
          blend={blend}
          displayName={displayName}
          recipe={itemRecipe}
        />
      )}
      <View>
        <Container style={{ overflow: 'hidden' }}>
          <Heading
            style={{ textAlign: 'center' }}
            responsiveStyle={{
              marginBottom: [28, 52],
            }}
          >
            our blends
          </Heading>
          <BlendsCarousel style={{ alignSelf: 'flex-start' }} />
        </Container>
      </View>
      <PageFooter />
    </GenericPage>
  );
}

BlendPage.navigationOptions = {
  title: 'Blend',
};

export default BlendPage;
