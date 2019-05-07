import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import AirtableImage from './AirtableImage';
import {
  prettyShadow,
  prettyShadowSmall,
  titleStyle,
  monsterra40,
  monsterra60,
  proseFontFace,
  monsterra,
  boldPrimaryFontFace,
  primaryFontFace,
  monsterraBlack,
  monsterra50,
  largeHorizontalPadding,
  rightSidebarWidth,
  midPageHorizPadding,
} from './Styles';
import { MenuZone } from './MenuZone';
import ActionPage from '../components/ActionPage';
import TabSectionScrollView from './TabSectionScrollView';
import ListAnimation from './ListAnimation';
import { useNavigation } from '../navigation-hooks/Hooks';
import { EnhancementDetail } from './Enhancements';
import { useCompanyConfig } from '../ono-cloud/OnoKitchen';
import { getSelectedIngredients } from '../logic/configLogic';

const tagSize = {
  width: 100,
  height: 76,
};

export function MenuHLayout({ side, children }) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        paddingLeft: largeHorizontalPadding,
        marginRight: rightSidebarWidth + midPageHorizPadding,
      }}
    >
      <View
        style={{
          marginRight: midPageHorizPadding,
          width: 248,
        }}
      >
        {side}
      </View>
      <View
        style={{
          flex: 1,
          minWidth: 100,
          alignSelf: 'stretch',
        }}
      >
        {children}
      </View>
    </View>
  );
}

function TextButton({ title, onPress, style }) {
  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <Text style={{ fontSize: 16, color: monsterra, ...primaryFontFace }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function IngredientTag({ children, onPress, onRemove, inlineStyle, style }) {
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
          {children}
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
    const key = i;
    const itemA = items[i * 2];
    const itemB = items[i * 2 + 1] || null;
    rows.push(
      <View
        style={{
          flexDirection: 'row',
          alignSelf: 'stretch',
          justifyContent: 'flex-start',
        }}
        key={key}
      >
        {itemA}
        {itemB}
      </View>,
    );
  }
  return rows;
}

function CustomizationPuck({
  isActive,
  children,
  onPress,
  disabled,
  isSingleOption,
}) {
  if (disabled) {
    return (
      <View
        style={{
          marginTop: 16,
          marginRight: 16,
          backgroundColor: 'white',
          flex: 1,
          alignSelf: 'stretch',
          borderRadius: 4,
          borderWidth: 3,
          borderColor: isActive ? monsterra : 'white',
        }}
      >
        {children}
      </View>
    );
  }
  let accessory = null;
  if (isSingleOption) {
    accessory = (
      <View
        style={{
          justifyContent: 'center',
          top: 6,
          right: 8,
          bottom: 6,
          position: 'absolute',
          width: 27,
        }}
      >
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 13,
            borderColor: monsterra,
            borderWidth: 2,
          }}
        >
          {isActive && (
            <View
              style={{
                backgroundColor: monsterra,
                width: 10,
                borderRadius: 6,
                height: 10,
                margin: 2,
              }}
            />
          )}
        </View>
      </View>
    );
  } else if (isActive) {
    accessory = (
      <View
        style={{
          justifyContent: 'center',
          top: 6,
          right: 8,
          bottom: 6,
          position: 'absolute',
          width: 27,
        }}
      >
        <Image
          source={require('./assets/CheckMark.png')}
          style={{
            width: 27,
            height: 27,
            resizeMode: 'contain',
            bottom: 3,
          }}
        />
      </View>
    );
  }
  return (
    <TouchableOpacity
      style={{
        marginTop: 16,
        marginRight: 16,
        flex: 1,
        alignSelf: 'stretch',
        ...prettyShadowSmall,
        backgroundColor: 'white',
        borderRadius: 4,
        borderWidth: 3,
        borderColor: isActive ? monsterra : 'white',
      }}
      onPress={disabled ? undefined : onPress}
    >
      {children}
      {accessory}
    </TouchableOpacity>
  );
}

function Subtitle({ children, style }) {
  return (
    <Text
      style={{ ...proseFontFace, fontSize: 20, color: monsterra60, ...style }}
    >
      {children}
    </Text>
  );
}

function EnhancementSection({ section }) {
  return (
    <View style={{ marginRight: 14, marginBottom: 20 }}>
      <Subtitle>
        Enhancements for fitness, immunity, focus, digestion, and skin & body
      </Subtitle>
      {section.options.map((enhancement, index) => {
        const isActive = section.selectedIds.indexOf(enhancement.id) !== -1;
        const disabled = !isActive && section.selectedIds.length === 2;
        return (
          <CustomizationPuck
            key={index}
            isActive={isActive}
            disabled={disabled}
            onPress={() => {
              section.addIngredient(enhancement.id);
            }}
          >
            <EnhancementDetail
              enhancement={enhancement}
              key={enhancement.id}
              disabled={disabled}
              price={
                section.selectedIds.length &&
                section.selectedIds[0] !== enhancement.id &&
                0.5
              }
            />
          </CustomizationPuck>
        );
      })}
    </View>
  );
}

function StepperButton({ onPress, icon, disabled }) {
  return (
    <TouchableOpacity
      disabled={disabled}
      style={{
        borderWidth: 1,
        height: 26,
        width: 26,
        borderRadius: 13,
        opacity: disabled ? 0.35 : 1,
        borderColor: monsterra50,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onPress={onPress}
    >
      <Image
        source={icon}
        style={{ width: 11, height: 11, resizeMode: 'contain' }}
      />
    </TouchableOpacity>
  );
}

function StepperSection({ section }) {
  return (
    <View style={{ paddingBottom: 60, overflow: 'visible' }}>
      <SectionDescription message={section.description} />
      <View
        style={{
          paddingVertical: 15,
          alignItems: 'stretch',
          paddingRight: 20,
        }}
      >
        {section.options.map(option => {
          const qty = section.selectedIngredients.filter(
            i => i.id === option.key,
          ).length;
          return (
            <View
              key={option.key}
              style={{
                ...prettyShadowSmall,
                borderRadius: 4,
                minHeight: 72,
                marginBottom: 16,
                backgroundColor: 'white',
                flexDirection: 'row',
                alignSelf: 'stretch',
              }}
            >
              {option.image && (
                <AirtableImage
                  image={option.image}
                  resizeMode="contain"
                  style={{
                    position: 'absolute',
                    width: 142,
                    height: 72,
                    left: -35,
                  }}
                />
              )}
              <View
                style={{
                  flex: 1,
                  marginLeft: 70,
                  marginTop: 8,
                  paddingHorizontal: 10,
                  alignSelf: 'stretch',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ ...titleStyle, fontSize: 12 }}>
                  {option.name.toUpperCase()}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: 16,
                }}
              >
                <StepperButton
                  disabled={qty === 0}
                  onPress={() => {
                    section.removeIngredient(option.key);
                  }}
                  icon={require('./assets/MinusIcon.png')}
                />
                <Text
                  style={{
                    width: 33,
                    textAlign: 'center',
                    ...primaryFontFace,
                    fontSize: 16,
                    color: monsterraBlack,
                  }}
                >
                  {qty}
                </Text>
                <StepperButton
                  disabled={
                    section.selectedIngredients.length >= section.slotCount
                  }
                  onPress={() => {
                    section.addIngredient(option.key);
                  }}
                  icon={require('./assets/PlusIcon.png')}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function SectionDescription({ message }) {
  if (!message) {
    return null;
  }
  return (
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
  );
}

function CustomizationMainSection({ section }) {
  if (section.name === 'enhancement') {
    return <EnhancementSection section={section} />;
  }
  if (section.name !== 'Beverage') {
    // hardcoding, great..
    return <StepperSection section={section} />;
  }
  return (
    <View style={{ paddingBottom: 60 }}>
      <SectionDescription message={section.description} />
      <View
        style={{
          paddingVertical: 15,
          alignItems: 'center',
        }}
      >
        {section.options.map(option => (
          <CustomizationPuck
            isSingleOption={section.name === 'Beverage'}
            key={option.key}
            onPress={option.onSelect}
            isActive={section.selectedIngredients.find(
              i => i.id === option.key,
            )}
          >
            <View
              style={{
                flexDirection: 'row',
                minHeight: 72,
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <AirtableImage
                image={option.image}
                resizeMode="contain"
                style={{
                  position: 'absolute',
                  left: -35,
                  width: 142,
                  height: 72,
                }}
              />
              <View
                style={{
                  flex: 1,
                  marginLeft: 70,
                  paddingHorizontal: 10,
                  justifyContent: 'center',
                }}
              >
                <Text style={{ ...titleStyle, fontSize: 12 }}>
                  {option.name.toUpperCase()}
                </Text>
              </View>
            </View>
          </CustomizationPuck>
        ))}
      </View>
    </View>
  );
}

function getCustomizationSections(
  menuItem,
  customizationState,
  setCustomization,
) {
  if (!menuItem) {
    return [];
  }
  let activeEnhancementIds = [menuItem.DefaultEnhancementId];
  if (customizationState && customizationState.enhancements !== undefined) {
    activeEnhancementIds = customizationState.enhancements;
  }
  const activeEnhancements = activeEnhancementIds.map(
    eId => menuItem.BenefitCustomization[eId],
  );

  const sections = [
    {
      name: 'enhancement',
      displayName: 'benefit',
      slotCount: 2,
      options: Object.keys(menuItem.BenefitCustomization).map(
        id => menuItem.BenefitCustomization[id],
      ),
      selectedIngredients: activeEnhancements,
      selectedIds: activeEnhancementIds,
      addIngredient: enhancementId => {
        let nextEnhancements = null;
        if (activeEnhancementIds.indexOf(enhancementId) !== -1) {
          nextEnhancements = activeEnhancementIds.filter(
            eId => eId !== enhancementId,
          );
        } else if (activeEnhancementIds.length < 2) {
          nextEnhancements = [...(activeEnhancementIds || []), enhancementId];
        }
        if (!nextEnhancements) {
          return;
        }
        setCustomization({
          ...customizationState,
          enhancements: nextEnhancements,
        });
      },
      removeIngredient: enhancementId => {
        setCustomization({
          ...customizationState,
          enhancements: activeEnhancementIds.filter(
            eId => eId !== enhancementId,
          ),
        });
      },
    },
    ...menuItem.IngredientCustomization.map(customSpec => {
      const name = customSpec['Name'];
      const description = customSpec['Description'];
      const customIngredientsByCustomizationCategory =
        (customizationState && customizationState.ingredients) || {};
      const customIngredients = customIngredientsByCustomizationCategory[name];
      const selectedIngredients = customIngredients || customSpec.defaultValue;
      // console.log('wheyo!!!', name, customSpec.defaultValue.length, customSpec);
      const slotCount =
        customSpec.defaultValue.length + (customSpec['Overflow Limit'] || 0);
      const slotCountMin =
        customSpec.defaultValue.length - (customSpec['Underflow Limit'] || 0);
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
        description,
        displayName: customSpec['Display Name'].toLowerCase(),
        options: customSpec.Ingredients.map(ingredient => ({
          key: ingredient.id,
          name: ingredient.Name,
          description: ingredient.Description,
          image: ingredient['Image'],
          onSelect: () => {
            if (name === 'Beverage') {
              setIngredientCustomization(Array(slotCount).fill(ingredient.id));
              return;
            }
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
          const ing = customSpec.Ingredients.find(i => i.id === ingredientId);
          if (!ing) {
            console.log('you!!', name, ingredientId, customSpec.Ingredients);
            throw new Error('Bad bad bad');
          }
          return ing;
        }),
        slotCount,
        slotCountMin,
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
        backgroundColor: '#f7f7f7',
        justifyContent: 'center',
        ...style,
      }}
      onPress={onPress}
    >
      <Text
        style={{
          fontSize: 26,
          lineHeight: 24,
          top: 2,
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
  onScrollToSection,
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
        paddingTop: 14,
        paddingBottom: 8,
        width: 248,
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
                  paddingLeft: 16,
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
                  paddingLeft: 16,
                }}
              >
                <ListAnimation
                  list={Array(
                    section.name === 'Beverage' ? 1 : section.slotCount,
                  )
                    .fill(0)
                    .map((_, index) => {
                      if (section.name === 'enhancement') {
                        const enhancement = section.selectedIngredients[index];
                        if (!enhancement) {
                          if (index === 0) {
                            return 'add';
                          } else {
                            return null;
                          }
                        }
                        return {
                          onRemove: () => {
                            section.removeIngredient(enhancement.id);
                          },
                          // enhancement.Icon
                          children: (
                            <View style={{ alignItems: 'center' }}>
                              <AirtableImage
                                image={enhancement.Icon}
                                style={{ width: 50, height: 50 }}
                                tintColor={monsterra}
                              />
                              <Text
                                style={{
                                  color: monsterra,
                                  ...boldPrimaryFontFace,
                                  fontSize: 12,
                                }}
                              >
                                {enhancement.Name.toUpperCase()}
                              </Text>
                            </View>
                          ),
                          key: `${enhancement.id}-${index}`,
                        };
                      }
                      const ingredient = section.selectedIngredients[index];
                      if (!ingredient) {
                        return 'add';
                      }
                      const ingCount = section.selectedIngredients.filter(
                        i => i && i.id === ingredient.id,
                      ).length;

                      return {
                        onRemove:
                          section.name !== 'Beverage'
                            ? () => {
                                section.removeIngredient(ingredient.id);
                              }
                            : null,
                        children: (
                          <View
                            style={{
                              overflow: 'hidden',
                              flex: 1,
                            }}
                          >
                            <AirtableImage
                              image={ingredient['Image']}
                              resizeMode="contain"
                              style={{
                                flex: 1,
                              }}
                            />
                          </View>
                        ),
                        key: `${ingredient.id}-${index}`,
                      };
                    })}
                  renderItem={(item, index) => {
                    if (item === 'add') {
                      return (
                        <AddItem
                          key={index}
                          style={{ marginRight: 16, marginBottom: 16 }}
                          onPress={() => onScrollToSection(section)}
                        />
                      );
                    }
                    if (item) {
                      return (
                        <IngredientTag
                          key={item.key}
                          onRemove={item.onRemove}
                          style={{ marginRight: 16, marginBottom: 16 }}
                          inlineStyle
                        >
                          {item.children}
                        </IngredientTag>
                      );
                    }
                    return null;
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>
      <TextButton
        style={{ position: 'absolute', right: 20, top: 21 }}
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
            onScrollToSection={section =>
              setActiveSection({ name: section.name })
            }
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
  const companyConfig = useCompanyConfig();
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
        console.log('owahhahaha', nextItem);
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
      onLongPress: () => {
        const results = getSelectedIngredients(
          menuItem,
          { customization: customizationState },
          companyConfig,
        );
        console.log(results);
        alert(`
${results.ingredients
  .map(ing => `${ing.Name} (${ing.amount} x ${ing.amountVolumeRatio}ml)`)
  .join('\n')}

Ingredients: ${results.ingredientsVolume}ml
Enhancements: ${results.enhancementsVolume}ml
===
Final Volume: ${results.finalVolume}ml
(Original Recipe: ${results.origRecipeVolume}ml)`);
      },
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
