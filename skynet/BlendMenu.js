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

function BlendDisplay({ menuItem, companyConfig }) {
  const computed = React.useMemo(() => {
    const result = getSelectedIngredients(
      menuItem,
      { customization: null },
      companyConfig,
    );
    console.log(result);
    return result;
  }, [menuItem, companyConfig]);
  if (!computed) {
    return <Text>Loading..</Text>;
  }
  return (
    <View style={{ padding: 10, marginVertical: 10 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 32 }}>
        {menuItem['Display Name']}
      </Text>
      <Text>{menuItem['Display Description']}</Text>
      <Text>{`
${computed.ingredients
  .map(ing => `${ing.Name} (${ing.amount} x ${ing.amountVolumeRatio}ml)`)
  .join('\n')}

Ingredients: ${computed.ingredientsVolume}ml
Enhancements: ${computed.enhancementsVolume}ml
Liquid: ${computed.liquidVolume}ml
===
Final Volume: ${computed.finalVolume}ml`}</Text>
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
