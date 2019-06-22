import React from 'react';
import { View } from 'react-native';
import GenericPage from './GenericPage';
import GenericHeroHeader from './GenericHeroHeader';
import { useNavigation } from '../navigation-hooks/Hooks';
import PageFooter from './PageFooter';
import Container from './Container';
import { Tag, BodyText } from './Tokens';
import { useTheme } from '../dashboard/Theme';
import { useMenuItemSlug, useCompanyConfig } from '../ono-cloud/OnoKitchen';
import AirtableImage from '../components/AirtableImage';
import { dietaryInfosOfMenuItem } from '../logic/configLogic';

import {
  displayNameOfMenuItem,
  getSelectedIngredients,
} from '../logic/configLogic';
import { ColumnToRow, ColumnToRowChild, Responsive } from './Responsive';
import { FootNote, Heading } from './Tokens';

function BlendContent({ displayName, blend, recipe }) {
  const theme = useTheme();
  const dietaryInfos = dietaryInfosOfMenuItem(
    blend,
    recipe.ingredients.map(i => i.id),
  );
  console.log('TCL: BlendContent -> blend', blend);
  return (
    <View>
      <Container>
        <ColumnToRow>
          <ColumnToRowChild>
            <View
              style={{
                backgroundColor: 'red',
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <AirtableImage
                image={blend.Recipe['Recipe Image']}
                resizeMode="cover"
                style={{ flex: 1, width: 400, paddingTop: '56.25%' }}
              />
            </View>
          </ColumnToRowChild>
          <Responsive>
            <ColumnToRowChild>
              <Heading>{displayName}</Heading>
              <Tag title={blend.DefaultBenefitName} />
              <BodyText>{blend['Display Description']}</BodyText>
            </ColumnToRowChild>
          </Responsive>
        </ColumnToRow>
      </Container>
      <Container>
        {recipe.ingredients.map(ing => (
          <AirtableImage
            key={ing.id}
            image={ing.Image}
            style={{
              width: 100,
              height: 100,
            }}
          />
        ))}
        {dietaryInfos.map(d => (
          <AirtableImage
            key={d.id}
            image={d.Icon}
            style={{
              width: 50,
              height: 50,
            }}
            tintColor="red"
          />
        ))}
      </Container>
    </View>
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
