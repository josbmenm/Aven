import React from 'react';
import InternalPage from './InternalPage';
import { Heading, Text } from '../dash-ui';
import AuthenticatedRedirectWrapper from './AuthenticatedRedirectWrapper';
import { ScrollView, View } from 'react-native';
import { useMenu, useCompanyConfig } from '../ono-cloud/OnoKitchen';
import { getSelectedIngredients } from '../logic/configLogic';
import AirtableImage from '../components/AirtableImage';

function BlendDisplay({ menuItem, companyConfig }) {
  const computed = React.useMemo(() => {
    const result = getSelectedIngredients(
      menuItem,
      { customization: null },
      companyConfig,
    );
    return result;
  }, [menuItem, companyConfig]);
  if (!computed) {
    return <Text>Loading..</Text>;
  }
  return (
    <View style={{ padding: 10, marginVertical: 10 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 32, color: '#333' }}>
        {menuItem['Display Name']}
      </Text>
      <AirtableImage
        image={menuItem.Recipe['Recipe Image']}
        style={{
          width: 250,
          height: 250,
          resizeMode: 'contain',
        }}
      />
      <Text>{menuItem['Display Description']}</Text>
      <Text>
        {menuItem.Recipe['DisplayCalories']} Calories |{' '}
        {menuItem.Recipe['Nutrition Detail']}
      </Text>
      {computed.ingredients.map((ing, index) => {
        return (
          <View key={index}>
            <AirtableImage
              image={ing.Image}
              style={{
                width: 50,
                height: 50,
                resizeMode: 'contain',
              }}
            />
            <Text>{`${ing.Name} (${ing.amount} x ${ing.amountVolumeRatio}ml)`}</Text>
          </View>
        );
      })}
      <Text>{`
Ingredients: ${computed.ingredientsVolume}ml
Enhancements: ${computed.enhancementsVolume}ml
Beverage Base: ${computed.liquidVolume}ml
===
Final Volume: ${computed.finalVolume}ml
`}</Text>
    </View>
  );
}

function InternalMenuPage() {
  const menu = useMenu();
  const companyConfig = useCompanyConfig();
  return (
    <InternalPage>
      <AuthenticatedRedirectWrapper>
        <Heading title="Blend Menu" />
        <ScrollView style={{ flex: 1 }}>
          <View
            style={{
              maxWidth: 400,
              flex: 1,
              alignSelf: 'stretch',
            }}
          >
            {menu &&
              menu.blends &&
              menu.blends.map(menuItem => {
                return (
                  <BlendDisplay
                    key={menuItem.id}
                    menuItem={menuItem}
                    companyConfig={companyConfig}
                  />
                );
              })}
          </View>
        </ScrollView>
      </AuthenticatedRedirectWrapper>
    </InternalPage>
  );
}

InternalMenuPage.navigationOptions = ({ screenProps }) => {
  return {
    title: 'Menu',
  };
};

export default InternalMenuPage;
