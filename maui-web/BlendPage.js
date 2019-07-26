import React from 'react';
import { Image } from 'react-native';
import View from '../views/View';
import GenericPage from './GenericPage';
import { useNavigation } from '../navigation-hooks/Hooks';
import PageFooter from './PageFooter';
import Container from '../dashboard/Container';
import Heading from '../dashboard/Heading';
import BaseText from '../dashboard/BaseText';
import BodyText from '../dashboard/BodyText';
import Tag from '../dashboard/Tag';
import { useTheme } from '../dashboard/Theme';
import { aspectRatio169 } from '../components/Styles';
import { useMenuItemSlug, useCompanyConfig } from '../ono-cloud/OnoKitchen';
import AirtableImage from '../components/AirtableImage';
import { dietaryInfosOfMenuItem } from '../logic/configLogic';

import {
  displayNameOfMenuItem,
  getSelectedIngredients,
} from '../logic/configLogic';
import { ColumnToRow, ColumnToRowChild } from '../dashboard/Responsive';
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
          marginVertical: [40, 100],
        }}
      >
        <View>
          <Container
            style={{
              position: 'relative',
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            }}
            responsiveStyle={{
              paddingBottom: [40, 120],
            }}
          >
            <ColumnToRow>
              <Responsive
                style={{
                  height: [300, 'auto'],
                  marginBottom: [32, 0],
                }}
              >
                <ColumnToRowChild
                  style={{
                    position: 'relative',
                    overflow: 'visible',
                  }}
                >
                  <Responsive
                    style={{
                      position: ['relative', 'absolute'],
                      transform: ['scale(1.2)', 'scale(1.5)'],
                    }}
                  >
                    <View
                      style={{
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                        overflow: 'visible',
                      }}
                    >
                      <AirtableImage
                        image={blend.Recipe.DecorationImage}
                        resizeMode="contain"
                        responsiveStyle={{
                          maxWidth: ['100%', 1024],
                          width: ['100%', '60%'],
                          height: [300, 768],
                          paddingTop: ['56.25%', 0],
                          position: ['relative', 'absolute'],
                        }}
                        style={{
                          flex: 1,
                          overflow: 'visible',
                          right: 0,
                          top: 0,
                        }}
                      />
                    </View>
                  </Responsive>
                  <Responsive
                    style={{
                      display: ['none', 'block'],
                    }}
                  >
                    <Image
                      style={{
                        position: 'absolute',
                        top: -120,
                        right: 0,
                        width: 100,
                        height: 'calc(100% + 200px)',
                      }}
                      source={require('./public/img/white-gradient.png')}
                      resizeMode="repeat"
                    />
                  </Responsive>
                </ColumnToRowChild>
              </Responsive>
              <Responsive
                style={{
                  alignItems: ['center', 'flex-start'],
                }}
              >
                <ColumnToRowChild style={{ backgroundColor: 'white' }}>
                  <Responsive
                    style={{
                      display: ['none', 'block'],
                    }}
                  >
                    <View
                      style={{
                        position: 'absolute',
                        top: -120,
                        right: 0,
                        backgroundColor: 'white',
                        height: 300,
                        width: '100%',
                        zIndex: -1,
                      }}
                    />
                  </Responsive>
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
                            tintColor={theme.colors.primaryBg}
                            resizeMode="contain"
                            style={{ width: 60, height: 60 }}
                          />
                          <BaseText
                            bold
                            style={{
                              fontSize: 10,
                              fontFamily: theme.fonts.bold,
                              lineHeight: 24,
                              textTransform: 'uppercase',
                            }}
                          >
                            {benefit.Name}{' '}
                          </BaseText>
                        </View>
                      ))}
                    </View>
                  </Responsive>
                  <BodyText
                    style={{ marginBottom: 48 }}
                    responsiveStyle={{
                      textAlign: ['center', 'left'],
                      marginBottom: [32, 48],
                    }}
                  >
                    {blend['Display Description']}
                  </BodyText>
                  <Responsive
                    style={{
                      marginBottom: [44, 24],
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
                                : theme.colors.primary,
                            borderRightWidth: 1,
                            justifyContent: 'center',
                            marginRight: 8,
                            paddingRight: 8,
                            height: 16,
                          }}
                        >
                          <BaseText
                            style={{
                              marginBottom: 0,
                              fontSize: 12,
                              letterSpacing: 0.3,
                              fontFamily: theme.fonts.regular,
                            }}
                          >
                            {dietaryMessage}
                          </BaseText>
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
                          tintColor={theme.colors.primaryBg}
                        />
                        <BaseText
                          bold
                          style={{
                            fontSize: 12,
                            fontFamily: theme.fonts.bold,
                            textTransform: 'uppercase',
                          }}
                        >
                          {d.Name}
                        </BaseText>
                      </View>
                    ))}
                  </View>
                </ColumnToRowChild>
              </Responsive>
            </ColumnToRow>
            <Responsive
              style={{
                display: ['none', 'block'],
              }}
            >
              <Image
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  left: 0,
                  height: 100,
                  width: '100%',
                }}
                source={require('./public/img/white-gradient-bottom.png')}
                resizeMode="repeat"
              />
            </Responsive>
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
          <Heading
            size="medium"
            responsiveStyle={{
              fontSize: [24, 36],
              lineHeight: [32, 44],
            }}
            style={{ marginBottom: 16 }}
          >
            organic ingredients
          </Heading>
          <BodyText
            style={{ maxWidth: 520, textAlign: 'center' }}
            responsiveStyle={{
              marginBottom: [60, 90],
            }}
          >
            All of our ingredients for our drinks are locally sourced, fully
            organic, and guarenteed to taste amazing.
          </BodyText>
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
                key={index}
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
                <BaseText
                  size="small"
                  bold
                  style={{
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    fontFamily: theme.fonts.bold,
                    fontSize: 11,
                    lineHeight: 24,
                  }}
                >
                  {ing.Name}
                </BaseText>
              </View>
            ))}
          </View>
        </Container>
      </View>
      <View>
        <Container
          style={{
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}
          responsiveStyle={{
            paddingBottom: [60, 100],
            marginBottom: [40, 100],
          }}
        >
          <AirtableImage
            image={blend.Recipe.StandaloneImage}
            resizeMode="cover"
            style={{ ...aspectRatio169 }}
          />
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
        <Container>
          <Heading
            size="medium"
            style={{ textAlign: 'center' }}
            responsiveStyle={{
              marginBottom: [28, 52],
              fontSize: [24, 36],
              lineHeight: [32, 44],
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