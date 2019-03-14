import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import AirtableImage from './AirtableImage';
import {
  pageBackgroundColor,
  prettyShadow,
  prettyShadowSmall,
  menuZoneTopInset,
  titleStyle,
  monsterra40,
  monsterra60,
  proseFontFace,
  monsterra,
  primaryFontFace,
  boldPrimaryFontFace,
  black8,
} from './Styles';
import { MenuZone, MenuHLayout } from './MenuZone';
import ActionPage from '../components/ActionPage';
import TabSectionScrollView from './TabSectionScrollView';
import ListAnimation from './ListAnimation';
import { ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '../navigation-hooks/Hooks';
import { EnhancementDetail } from './Enhancements';
import { getactiveEnhancement } from '../ono-cloud/OnoKitchen';

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
    <TouchableOpacity
      onPress={onPress}
      style={{ ...style }}
      disabled={!onPress}
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
                  ...prettyShadowSmall,
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
    </TouchableOpacity>
  );
}
function SideSpacer() {
  return (
    <View
      style={{
        flex: 1,
        marginTop: 16,
        marginRight: 16,
        padding: 12,
      }}
    />
  );
}
function SideBySide({ items }) {
  const rows = [];
  for (let i = 0; i <= Math.ceil(items.length / 2) - 1; i++) {
    const itemA = items[i * 2];
    const itemB = items[i * 2 + 1] || <SideSpacer />;
    rows.push(
      <View style={{ flexDirection: 'row', alignSelf: 'stretch' }}>
        {itemA}
        {itemB}
      </View>,
    );
  }
  return rows;
}

function EnhancementSection({ section }) {
  return (
    <View style={{ marginRight: 14, marginBottom: 20 }}>
      <SideBySide
        items={section.options.map((enhancement, index) => (
          <TouchableOpacity
            key={index}
            style={{
              marginTop: 16,
              marginRight: 16,
              flex: 1,
              ...prettyShadowSmall,
              backgroundColor: 'white',
              borderRadius: 4,
            }}
            onPress={() => {
              section.addIngredient(enhancement.id);
            }}
          >
            <EnhancementDetail enhancement={enhancement} key={enhancement.id} />
          </TouchableOpacity>
        ))}
      />
    </View>
  );
}

function CustomizationMainSection({ section }) {
  if (section.name === 'enhancement') {
    return <EnhancementSection section={section} />;
  }
  let message = `Choose up to ${section.slotCount} of ${section.displayName}`;
  if (section.slotCount === 1) {
    message = `Choose a ${section.displayName}`;
  }
  return (
    <View style={{ paddingBottom: 60 }}>
      {message && (
        <Text
          style={{
            fontSize: 20,
            paddingTop: 6,
            color: monsterra60,
            ...proseFontFace,
          }}
        >
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

// function EnhancementCustomization({ customization, state, onState, menuItem }) {
//   return (
//     <CustomizationSection
//       title="Blend Function"
//       subtitle={`Choose ${MAX_FUNCTIONS}`}
//     >
//       {Object.keys(menuItem.EnhancementCustomization).map(functionId => (
//         <CustomFunctionPuck
//           key={functionId}
//           fn={menuItem.EnhancementCustomization[functionId]}
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
  if (!menuItem) {
    return [];
  }
  let activeEnhancement = menuItem.DefaultEnhancement;
  if (customizationState && customizationState.enhancement !== undefined) {
    activeEnhancement =
      menuItem.EnhancementCustomization[customizationState.enhancement];
  }
  const sections = [
    {
      name: 'enhancement',
      displayName: 'Enhancement',
      slotCount: 1,
      options: Object.keys(menuItem.EnhancementCustomization).map(
        id => menuItem.EnhancementCustomization[id],
      ),
      selectedIngredients: [activeEnhancement],
      addIngredient: enhancementId => {
        setCustomization({
          ...customizationState,
          enhancement: enhancementId,
        });
      },
      removeIngredient: () => {
        setCustomization({
          ...customizationState,
          enhancement: null,
        });
      },
    },
    ...menuItem.IngredientCustomization.map(customSpec => {
      const name = customSpec['Name'];
      const customIngredientsByCustomizationCategory =
        (customizationState && customizationState.ingredients) || {};
      const customIngredients = customIngredientsByCustomizationCategory[name];
      const selectedIngredients = customIngredients || customSpec.defaultValue;
      const slotCount =
        customSpec.defaultValue.length + (customSpec['Overflow Limit'] || 0);
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
        const ingredientToRemove = selectedIngredients.findIndex(
          id => id === removeIngredientId,
        );
        if (ingredientToRemove !== -1) {
          const ingredientsAfterRemoval = [...selectedIngredients];
          ingredientsAfterRemoval.splice(ingredientToRemove, 1);
          setIngredientCustomization(ingredientsAfterRemoval);
        }
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
      hitSlop={{
        left: 40,
        top: 40,
        right: 40,
        bottom: 40,
      }}
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
        source={require('./assets/CustomizeCross.png')}
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
      <Text
        style={{
          fontSize: 26,
          lineHeight: 24,
          textAlign: 'center',
          color: monsterra60,
          ...primaryFontFace,
        }}
      >
        +
      </Text>
    </TouchableOpacity>
  );
}

function CustomizationSidebar({
  setCustomization,
  customizationState,
  menuItem,
  onAddToSection,
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
        borderRadius: 4,
        paddingVertical: 14,
        ...prettyShadow,
      }}
    >
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
                {section.displayName}
              </Text>
              <View
                style={{
                  flexWrap: 'wrap',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingLeft: 20,
                }}
              >
                <ListAnimation
                  list={Array(section.slotCount)
                    .fill(0)
                    .map((_, index) => {
                      if (section.name === 'enhancement') {
                        const enhancement = section.selectedIngredients[index];
                        if (!enhancement) {
                          return 'add';
                        }
                        return {
                          onRemove: () => {
                            section.removeIngredient(enhancement.id);
                          },
                          image: enhancement.Photo,
                          key: `${enhancement.id}-${index}`,
                        };
                      }
                      const ingredient = section.selectedIngredients[index];
                      if (!ingredient) {
                        return 'add';
                      }
                      const hasMany =
                        section.selectedIngredients.filter(
                          i => i.id === ingredient.id,
                        ).length > 1;
                      return {
                        onRemove: () => {
                          section.removeIngredient(ingredient.id);
                        },
                        image: ingredient['Ingredient Image'],
                        key: `${ingredient.id}-${index}`,
                      };
                    })}
                  renderItem={(item, index) => {
                    if (item === 'add') {
                      return (
                        <AddItem
                          key={index}
                          style={{ marginRight: 12, marginBottom: 12 }}
                          onPress={() => onAddToSection(section)}
                        />
                      );
                    }
                    return (
                      <IngredientTag
                        key={item.key}
                        onRemove={item.onRemove}
                        image={item.image}
                        inlineStyle
                        style={{ marginRight: 12, marginBottom: 12 }}
                      />
                    );
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>
      <TextButton
        style={{ position: 'absolute', right: 20, top: 14 }}
        onPress={() => {
          setCustomization(null);
        }}
        title="reset"
      />
    </View>
  );
}

function Customization({ menuItem, setCustomization, customizationState }) {
  const sections = getCustomizationSections(
    menuItem,
    customizationState,
    setCustomization,
  );
  const [activeSection, setActiveSection] = useState({
    name: sections[0].name,
  });

  return (
    <MenuZone>
      <MenuHLayout
        side={
          <CustomizationSidebar
            menuItem={menuItem}
            setCustomization={setCustomization}
            customizationState={customizationState}
            onAddToSection={section => setActiveSection({ name: section.name })}
          />
        }
      >
        <TabSectionScrollView
          style={{}}
          contentContainerStyle={{ paddingLeft: 30, paddingTop: 30 }}
          activeSection={activeSection}
          onActiveSection={setActiveSection}
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
  const { goBack, navigate } = useNavigation();
  if (menuItem) {
    customizeContent = (
      <Customization
        menuItem={menuItem}
        customizationState={customizationState}
        setCustomization={setCustomization}
      />
    );
  }
  const isSave = cartItem && !!cartItem.quantity;
  const actions = [
    {
      title: isSave ? 'save' : 'add to cart',
      onPress: () => {
        console.log('waaah', isSave, cartItem, customizationState);
        const nextItem = isSave
          ? {
              ...cartItem.state,
              customization: customizationState,
            }
          : {
              id: orderItemId,
              type: 'blend',
              menuItemId: menuItem.id,
              customization: customizationState,
              quantity: 1,
            };
        setCartItem(nextItem);
        navigate({
          routeName: 'Blend',
          params: {
            orderItemId,
            menuItemId: menuItem.id,
          },
          key: `blend-item-${orderItemId}`,
        });
      },
    },
    {
      secondary: true,
      title: 'cancel',
      onPress: () => {
        goBack();
      },
    },
  ];
  return (
    <ActionPage actions={actions.reverse()} {...props} disableScrollView>
      {customizeContent}
    </ActionPage>
  );
}

CustomizePage.navigationOptions = ActionPage.navigationOptions;
