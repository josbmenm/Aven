import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Button,
  TouchableOpacity,
  Image,
} from 'react-native';
import { monsterra } from '../components/Styles';
import useCloud from '../cloud-core/useCloud';
import { useMenu, useCompanyConfig } from '../ono-cloud/OnoKitchen';
import useObservable from '../cloud-core/useObservable';
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
      {computed.ingredients.map(ing => {
        return (
          <View key={ing.id}>
            <AirtableImage
              image={ing.Image}
              style={{
                width: 50,
                height: 50,
                resizeMode: 'contain',
              }}
            />
            <Text>{`${ing.Name} (${ing.amount} x ${
              ing.amountVolumeRatio
            }ml)`}</Text>
          </View>
        );
      })}
      <Text>{`
Ingredients: ${computed.ingredientsVolume}ml
Enhancements: ${computed.enhancementsVolume}ml
Liquid: ${computed.liquidVolume}ml
===
Final Volume: ${computed.finalVolume}ml
`}</Text>
    </View>
  );
}
export default function BlendMenu() {
  const menu = useMenu();
  const companyConfig = useCompanyConfig();
  if (!menu) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        <View
          style={{
            maxWidth: 400,
            flex: 1,
            alignSelf: 'stretch',
          }}
        >
          {menu.blends &&
            menu.blends.map(menuItem => {
              return (
                <BlendDisplay
                  menuItem={menuItem}
                  companyConfig={companyConfig}
                />
              );
            })}
        </View>
      </ScrollView>
    </View>
  );
}

BlendMenu.navigationOptions = {
  title: 'Secret Blend Menu',
};
