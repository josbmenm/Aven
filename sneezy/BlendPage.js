import React from 'react';
import { View } from 'react-native';
import GenericPage from './GenericPage';
import { useNavigation } from '../navigation-hooks/Hooks';
import PageFooter from './PageFooter';
import Container from './Container';
import Heading from './Heading';
import BodyText from './BodyText';
import FootNote from './FootNote';
import Tag from './Tag';
import { useTheme } from '../dashboard/Theme';
import { useMenuItemSlug, useCompanyConfig } from '../ono-cloud/OnoKitchen';
import AirtableImage from '../components/AirtableImage';
import { dietaryInfosOfMenuItem } from '../logic/configLogic';

import {
  displayNameOfMenuItem,
  getSelectedIngredients,
} from '../logic/configLogic';
import { ColumnToRow, ColumnToRowChild, Responsive } from './Responsive';
import { BlendsCarousel } from './BlendsList';

const dietary = [
  {
    name: 'Calories',
    value: 480,
  },
  {
    name: 'Fiber',
    value: '3g',
  },
  {
    name: 'Protein',
    value: '4g',
  },
  {
    name: 'Sugars',
    value: '23g',
  },
];

function BlendContent({ displayName, blend, recipe }) {
  const theme = useTheme();
  const dietaryInfos = dietaryInfosOfMenuItem(
    blend,
    recipe.ingredients.map(i => i.id),
  );
  return (
    <React.Fragment>
      <View>
        <Container
          style={{
            paddingBottom: 80,
            marginBottom: 80,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}
        >
          <ColumnToRow>
            <ColumnToRowChild>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <AirtableImage
                  image={blend.Recipe['Recipe Image']}
                  resizeMode="contain"
                  style={{ flex: 1, width: 400, paddingTop: '56.25%' }}
                />
              </View>
            </ColumnToRowChild>
            <Responsive
              style={{
                alignItems: ['center', 'flex-start'],
              }}
            >
              <ColumnToRowChild>
                <Responsive
                  style={{
                    flexDirection: ['column-reverse', 'column'],
                    marginVertical: [40, 0],
                  }}
                >
                  <View>
                    <Heading>{displayName}</Heading>
                    <Responsive
                      style={{
                        alignSelf: [
                          'center !important',
                          'flex-start !important',
                        ],
                      }}
                    >
                      <Tag title={blend.DefaultBenefitName} />
                    </Responsive>
                  </View>
                </Responsive>
                <View
                  style={{
                    alignItems: 'flex-start',
                    marginBottom: 40,
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
                        tintColor={theme.colors.primary80}
                        resizeMode="contain"
                        style={{ width: 44, height: 44 }}
                      />
                      <FootNote
                        bold
                        style={{
                          fontSize: 10,
                          textTransform: 'uppercase',
                        }}
                      >
                        {benefit.Name}
                      </FootNote>
                    </View>
                  ))}
                </View>
                <Responsive
                  style={{
                    textAlign: ['center', 'left'],
                  }}
                >
                  <BodyText style={{ marginBottom: 48 }}>
                    {blend['Display Description']}
                  </BodyText>
                </Responsive>
                <View
                  style={{
                    flexDirection: 'row',
                    marginBottom: 20,
                  }}
                >
                  {dietary.map((elem, index) => (
                    <View
                      style={{
                        borderRightColor:
                          index + 1 === dietary.length
                            ? 'transparent'
                            : theme.colors.primary,
                        borderRightWidth: 1,
                        // alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 8,
                        paddingRight: 8,
                        height: 16,
                      }}
                    >
                      <FootNote style={{ marginBottom: 0 }}>{`${elem.name} ${
                        elem.value
                      }`}</FootNote>
                    </View>
                  ))}
                </View>
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
                        tintColor={theme.colors.primary}
                      />
                      <FootNote
                        bold
                        style={{
                          fontSize: theme.fontSizes[0],
                          textTransform: 'uppercase',
                        }}
                      >
                        {d.Name}
                      </FootNote>
                    </View>
                  ))}
                </View>
              </ColumnToRowChild>
            </Responsive>
          </ColumnToRow>
        </Container>
      </View>
      <View>
        <Container
          style={{
            alignItems: 'center',
            paddingVertical: 60,
          }}
        >
          <Heading style={{ marginBottom: 20 }}>organic ingredients</Heading>
          <BodyText
            style={{ marginBottom: 80, maxWidth: 520, textAlign: 'center' }}
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
            {recipe.ingredients.map(ing => (
              <View
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
                <FootNote style={{ textAlign: 'center' }}>{ing.Name}</FootNote>
              </View>
            ))}
          </View>
        </Container>
      </View>
      <View>
        <Container style={{ alignitems: 'center', marginVertical: 80 }}>
          <Heading style={{ textAlign: 'center', marginBottom: 52 }}>our blends</Heading>
          <BlendsCarousel />
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

      <PageFooter />
    </GenericPage>
  );
}

BlendPage.navigationOptions = {
  title: 'Blend',
};

export default BlendPage;
