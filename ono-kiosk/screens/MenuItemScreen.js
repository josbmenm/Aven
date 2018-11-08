import React, { Component } from 'react';
import { View, Text, Image } from 'react-native';
import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from '@react-navigation/native';
import { genericText } from '../../ono-components/Styles';
import GenericPage from '../components/GenericPage';
import Button from '../../ono-components/Button';
import { withMenuItem } from '../../ono-cloud/OnoKitchen';
import AirtableImage from '../components/AirtableImage';

// const PlaceholderImage = () => <View />;

// const Features = ({ product }) => (
//   <View style={{ flexDirection: 'row', marginBottom: 60 }}>
//     {product.features.map(feature => (
//       <View
//         style={{ alignItems: 'center', marginTop: 20, marginRight: 20 }}
//         key={feature.name}
//       >
//         <PlaceholderImage
//           style={{ width: 100, height: 100, marginBottom: 30 }}
//           color="#22cc22"
//         />
//         <Text
//           style={{
//             flex: 1,
//             ...genericText,
//             marginRight: 60,
//             marginTop: 8,
//             textAlign: 'center',
//             alignSelf: 'center',
//             fontSize: ingredientFontSize,
//           }}
//         >
//           {feature.name}
//         </Text>
//       </View>
//     ))}
//   </View>
// );

const Ingredients = ({ menuItem }) => (
  <View style={{ flexDirection: 'row', padding: 0 }}>
    {menuItem.Recipe.Ingredients.map(i => (
      <View
        style={{ alignItems: 'center', marginTop: 20, marginRight: 20 }}
        key={i.id}
      >
        <AirtableImage
          image={i.Ingredient['Ingredient Image']}
          style={{ width: 100, height: 100 }}
        />
        <Text
          style={{
            marginTop: 8,
            textAlign: 'center',
            minWidth: 190,
          }}
        >
          {i.Ingredient && i.Ingredient.Name}
        </Text>
      </View>
    ))}
  </View>
);

// return (
//   <GenericPage {...this.props} title={product.name} disableScroll>
//     <ScreenContent>
//       <View style={{ padding: 30 }}>
//         <Features product={product} />
//         <Text style={{ ...genericText, fontSize: 42, marginBottom: 30 }}>
//           {product.description}
//         </Text>
//         <Text style={{ ...genericText, fontSize: 52 }}>
//           <Text style={{ fontSize: 54 }}>ingredients | </Text>
//           {product.size} - {product.nutrition}
//         </Text>
//         <Ingredients product={product} />
//       </View>
//     </ScreenContent>
//     <CallToActionButton
//       label="Checkout"
//       onPress={() => {
//         this.props.navigation.navigate('Payment', { id });
//       }}
//     />
//   </GenericPage>
// );

function MenuItemScreenWithItem({ menuItem }) {
  console.log(menuItem);
  return (
    <GenericPage title={menuItem.name} disableScroll>
      <View style={{ padding: 30 }}>
        <Text style={{ fontSize: 42, marginBottom: 30 }}>
          {menuItem['Display Description']}
        </Text>
        <Text style={{ fontSize: 52 }}>
          <Text style={{ fontSize: 54 }}>ingredients | </Text>
          {menuItem.Price} - {menuItem.Calories} cal
        </Text>
        <Ingredients menuItem={menuItem} />
        <Button onPress={() => {}} title="Order Blend" />
      </View>
    </GenericPage>
  );
}

const MenuItemScreenWithId = withMenuItem(MenuItemScreenWithItem);

export default class MenuItemScreen extends Component {
  render() {
    return (
      <MenuItemScreenWithId menuItemId={this.props.navigation.getParam('id')} />
    );
  }
}
