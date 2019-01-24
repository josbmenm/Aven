import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  Image,
} from 'react-native';
import AirtableImage from './AirtableImage';
import {
  pageBackgroundColor,
  prettyShadow,
  menuZoneTopInset,
  titleStyle,
  monsterra40,
  monsterra60,
  proseFontFace,
  monsterra,
  primaryFontFace,
} from '../../components/Styles';
import { MenuZone, MenuHLayout } from './MenuZone';
import ActionPage from '../components/ActionPage';
import { ScrollView } from 'react-native-gesture-handler';

const tagSize = {
  width: 144,
  height: 80,
};

function TextButton({ title, onPress, style }) {
  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <Text style={{ fontSize: 18, color: monsterra, ...primaryFontFace }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function IngredientTag({ image, onPress, onRemove, inlineStyle, style }) {
  return (
    <TouchableHighlight
      onPress={onPress}
      underlayColor={'red'}
      style={{ ...style }}
    >
      <View
        style={{
          ...tagSize,
        }}
      >
        <View
          style={{
            borderRadius: 4,
            alignItems: 'center',
            ...tagSize,
            backgroundColor: 'white',
            flexDirection: 'row',
            justifyContent: 'center',
            ...(inlineStyle
              ? {
                  borderWidth: 1,
                  borderColor: '#00000014',
                }
              : {
                  ...prettyShadow,
                }),
            alignSelf: 'center',
          }}
        >
          {image && (
            <View style={{ overflow: 'hidden', flex: 1 }}>
              <AirtableImage
                image={image}
                resizeMode="contain"
                style={{
                  flex: 1,
                }}
              />
            </View>
          )}
        </View>
        {onRemove && <XButton onPress={onRemove} />}
      </View>
    </TouchableHighlight>
  );
}

function CustomizationMainSection({ section }) {
  let message = `Choose up to ${section.slotCount} of ${section.displayName}`;
  if (section.slotCount === 1) {
    message = `Choose a ${section.displayName}`;
  }
  return (
    <View>
      <Text style={{ fontSize: 24, ...titleStyle }}>{section.displayName}</Text>
      {message && (
        <Text style={{ fontSize: 18, color: monsterra60, ...proseFontFace }}>
          {message}
        </Text>
      )}
      <View
        style={{
          paddingVertical: 15,
          flexWrap: 'wrap',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {section.options.map(option => (
          <IngredientTag
            style={{ marginRight: 16, marginBottom: 16 }}
            key={option.key}
            image={option.image}
            onPress={option.onSelect}
          />
        ))}
      </View>
    </View>
  );
}

// function CustomIngredientPuck({ ingredient, onPress }) {
//   return (
//     <IngredientTag
//       image={ingredient['Ingredient Image']}
//       onPress={onPress}
//     />
//   );
// }

// function IngredientCustomization({ customization, state, onState }) {
//   return (
//     <CustomizationSection
//       title={customization['Display Name']}
//       subtitle={`Choose ${customization.optionLimit}`}
//     >
//       {customization.Ingredients.map((Ingredient, i) => (
//         <CustomIngredientPuck
//           ingredient={Ingredient}
//           key={i}
//           onPress={() => {
//             if (state.filter(i => i === Ingredient.id).length) {
//               onState(state.filter(i => i !== Ingredient.id));
//               return;
//             }
//             if (state.length < customization.optionLimit) {
//               onState([...state, Ingredient.id]);
//               return;
//             }
//           }}
//         />
//       ))}
//     </CustomizationSection>
//   );
// }

// function CustomFunctionPuck({ fn, onPress, state }) {
//   return <IngredientTag image={fn['Photo']} onPress={onPress} />;
// }

// const MAX_FUNCTIONS = 2;

// function FunctionCustomization({ customization, state, onState, menuItem }) {
//   return (
//     <CustomizationSection
//       title="Blend Function"
//       subtitle={`Choose ${MAX_FUNCTIONS}`}
//     >
//       {Object.keys(menuItem.FunctionCustomization).map(functionId => (
//         <CustomFunctionPuck
//           key={functionId}
//           fn={menuItem.FunctionCustomization[functionId]}
//           state={state}
//           onPress={() => {
//             const wasSelected = state.indexOf(functionId) !== -1;
//             if (wasSelected) {
//               onState(state.filter(f => f !== functionId));
//               return;
//             }
//             if (state.length < MAX_FUNCTIONS) {
//               onState([...state, functionId]);
//             }
//           }}
//         />
//       ))}
//     </CustomizationSection>
//   );
// }

function getCustomizationSections(
  menuItem,
  customizationState,
  setCustomization,
) {
  const sections = [
    {
      name: 'benefit',
      displayName: 'Benefit',
      slotCount: 1,
      options: [],
      selectedIngredients: [],
      addIngredient: () => {},
      removeIngredient: () => {},
    },
    ...menuItem.IngredientCustomization.map(customSpec => {
      const name = customSpec['Name'];
      const customIngredientsByCustomizationCategory =
        (customizationState && customizationState.ingredients) || {};
      const customIngredients = customIngredientsByCustomizationCategory[name];
      const selectedIngredients = customIngredients || customSpec.defaultValue;
      const slotCount =
        customSpec.defaultValue.length + customSpec['Overflow Limit'];
      function setIngredientCustomization(ingredientIds) {
        setCustomization({
          ...customizationState,
          ingredients: {
            ...customIngredientsByCustomizationCategory,
            [name]: ingredientIds,
          },
        });
      }
      function addIngredient(addIngredientId) {
        setIngredientCustomization([...selectedIngredients, addIngredientId]);
      }
      function removeIngredient(removeIngredientId) {
        setIngredientCustomization(
          selectedIngredients.filter(id => id !== removeIngredientId),
        );
      }

      return {
        name,
        displayName: customSpec['Display Name'],
        options: customSpec.Ingredients.map(ingredient => ({
          key: ingredient.id,
          image: ingredient['Ingredient Image'],
          onSelect: () => {
            if (slotCount === 1) {
              setIngredientCustomization([ingredient.id]);
              return;
            }
            if (slotCount > selectedIngredients.length) {
              addIngredient(ingredient.id);

              return;
            }
            console.warn('cannot add more because there are no more slots');
          },
        })),
        removeIngredient,
        addIngredient,
        selectedIngredients: selectedIngredients.map(ingredientId => {
          return customSpec.Ingredients.find(i => i.id === ingredientId);
        }),
        slotCount,
      };
    }),
  ];
  return sections;
}
const xButtonSize = 22;
const xButtonInset = 3;
function XButton({ onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        borderWidth: 1,
        borderColor: '#00000014',
        position: 'absolute',
        width: xButtonSize,
        height: xButtonSize,
        borderRadius: xButtonSize / 2,
        top: -xButtonSize / 2 + xButtonInset,
        left: -xButtonSize / 2 + xButtonInset,
        backgroundColor: 'white',
        ...prettyShadow,
      }}
    >
      <Image
        style={{
          width: 9,
          height: 9,
          tintColor: monsterra40,
          marginLeft: 5,
          marginTop: 5,
        }}
        source={require('../assets/CustomizeCross.png')}
      />
    </TouchableOpacity>
  );
}

function AddItem({ onPress, style }) {
  return (
    <TouchableOpacity
      style={{
        ...tagSize,
        borderRadius: 4,
        backgroundColor: '#ddd',
        justifyContent: 'center',
        ...style,
      }}
      onPress={onPress}
    >
      <Text style={{ fontSize: 42, lineHeight: 38, textAlign: 'center' }}>
        +
      </Text>
    </TouchableOpacity>
  );
}

function CustomizationSidebar({
  setCustomization,
  customizationState,
  menuItem,
}) {
  const sections = getCustomizationSections(
    menuItem,
    customizationState,
    setCustomization,
  );
  return (
    <View
      style={{
        backgroundColor: 'white',
        borderRadius: 15,
        paddingVertical: 14,
        ...prettyShadow,
      }}
    >
      <TextButton
        style={{ position: 'absolute', right: 20, top: 14 }}
        onPress={() => {
          setCustomization(null);
        }}
        title="reset"
      />
      <View style={{}}>
        {sections.map(section => {
          return (
            <View style={{}} key={section.name}>
              <Text
                style={{
                  ...titleStyle,
                  paddingLeft: 20,
                  marginBottom: 4,
                  marginTop: 6,
                  fontSize: 16,
                }}
              >
                {section.name}
              </Text>
              <View
                style={{
                  flexWrap: 'wrap',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingLeft: 20,
                }}
              >
                {Array(section.slotCount)
                  .fill(0)
                  .map((_, index) => {
                    const ingredient = section.selectedIngredients[index];
                    if (!ingredient) {
                      return (
                        <AddItem
                          key={index}
                          style={{ marginRight: 12, marginBottom: 12 }}
                        />
                      );
                    }
                    return (
                      <IngredientTag
                        key={index}
                        onRemove={() => {
                          section.removeIngredient(ingredient.id);
                        }}
                        image={ingredient['Ingredient Image']}
                        inlineStyle
                        style={{ marginRight: 12, marginBottom: 12 }}
                      />
                    );
                  })}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function TabSectionScrollView({ sections, style }) {
  const [topMeasurements] = useState({});
  function setSectionTop(sectionName, top) {
    topMeasurements[sectionName] = top;
    console.log(
      'heyho',
      sectionName,
      Object.keys(topMeasurements).length,
      sections.length,
    );
    if (Object.keys(topMeasurements).length === sections.length) {
      console.log('whey there!', topMeasurements);
    }
  }
  return (
    <ScrollView style={{ flex: 1, ...style }}>
      {sections.map(section => (
        <View
          key={section.name}
          style={{}}
          onLayout={e => {
            setSectionTop(section.name, e.nativeEvent.layout.y);
          }}
        >
          {section.content}
        </View>
      ))}
    </ScrollView>
  );
}

function Customization({ menuItem, setCustomization, customizationState }) {
  if (!menuItem) {
    return null;
  }
  const ingredientStates =
    (customizationState && customizationState.ingredients) || {};
  const sections = getCustomizationSections(
    menuItem,
    customizationState,
    setCustomization,
  );
  return (
    <MenuZone>
      <MenuHLayout
        side={
          <CustomizationSidebar
            menuItem={menuItem}
            setCustomization={setCustomization}
            customizationState={customizationState}
          />
        }
      >
        <TabSectionScrollView
          style={{}}
          sections={sections.map(section => {
            return {
              name: section.name,
              title: section.displayName,
              content: <CustomizationMainSection section={section} />,
            };
          })}
        />
      </MenuHLayout>
    </MenuZone>
  );
}

// <ScrollView>

// </ScrollView>

export default function CustomizePage({
  menuItem,
  customizationState,
  setCustomization,
  orderItemId,
  cartItem,
  setCartItem,
  ...props
}) {
  let customizeContent = null;
  if (menuItem) {
    customizeContent = (
      <Customization
        menuItem={menuItem}
        customizationState={customizationState}
        setCustomization={setCustomization}
      />
    );
  }
  const actions = [
    {
      secondary: true,
      title: 'cancel',
      onPress: () => {
        goBack();
      },
    },
  ];
  if (!cartItem || cartItem.quantity < 1) {
    actions.push({
      title: 'add to cart',
      onPress: () => {
        setCartItem({
          id: orderItemId,
          type: 'blend',
          menuItemId: menuItem.id,
          customization: customizationState,
          quantity: 1,
        });
      },
    });
  } else {
    actions.push({
      title: 'save',
      onPress: () => {
        setCartItem({
          ...cartItem,
          customization: customizationState,
        });
      },
    });
  }
  return (
    <ActionPage actions={actions.reverse()} {...props} disableScrollView>
      {customizeContent}
    </ActionPage>
  );
}

CustomizePage.navigationOptions = ActionPage.navigationOptions;
