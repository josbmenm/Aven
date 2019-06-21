import React from 'react';
import { View } from 'react-native';
import GenericPage from './GenericPage';
import GenericHeroHeader from './GenericHeroHeader';
import { useNavigation } from '../navigation-hooks/Hooks';
import PageFooter from './PageFooter';
import { useTheme } from '../dashboard/Theme'
import { useMenuItemSlug, useCompanyConfig } from '../ono-cloud/OnoKitchen';
import AirtableImage from '../components/AirtableImage';
import { dietaryInfosOfMenuItem } from '../logic/configLogic';

import {
  displayNameOfMenuItem,
  getSelectedIngredients,
} from '../logic/configLogic';

function BlendContent({ displayName, blend, recipe }) {
  const theme = useTheme();
  const dietaryInfos = dietaryInfosOfMenuItem(
    blend,
    recipe.ingredients.map(i => i.id),
  );
  return (
    <React.Fragment>
      <GenericHeroHeader
        backgroundColor={theme.colors.lightGrey}
        title={displayName}
      />
      <AirtableImage
        image={blend.Recipe['Recipe Image']}
        style={{
          width: 400,
          height: 400,
        }}
      />
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
      <View style={{ flex: 1, paddingBottom: 40 }}>
        {blend && (
          <BlendContent
            blend={blend}
            displayName={displayName}
            recipe={itemRecipe}
          />
        )}
      </View>
      <PageFooter />
    </GenericPage>
  );
}

BlendPage.navigationOptions = {
  title: 'Blend',
};

export default BlendPage;
