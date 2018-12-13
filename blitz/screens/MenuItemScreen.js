import React, { useState, useContext } from 'react';
import { View, Text, Image, TouchableHighlight } from 'react-native';
import ActionPage from '../components/ActionPage';
import Button from '../../components/Button';
import { withMenuItem, withOrder } from '../../ono-cloud/OnoKitchen';
import AirtableImage from '../components/AirtableImage';
import { pageBackgroundColor } from '../../components/Styles';
import { useNavigation } from '../../navigation-hooks/Hooks';
import CloudContext from '../../aven-cloud/CloudContext';

function Ingredient({ ingredient }) {
  return (
    <View
      style={{
        alignItems: 'center',
        marginTop: 20,
        marginRight: 20,
        width: 180,
      }}
    >
      <AirtableImage
        image={ingredient['Ingredient Image']}
        style={{ width: 100, height: 100 }}
      />
      <Text
        style={{
          marginTop: 8,
          textAlign: 'center',
          fontSize: 20,
          color: '#444',
        }}
      >
        {ingredient.Name.toUpperCase()}
      </Text>
    </View>
  );
}

function CustomizationSection({ children, title, subtitle }) {
  return (
    <View>
      <View style={{ flexDirection: 'row' }}>
        <Text style={{ fontSize: 36, color: '#111' }}>{title}</Text>
        {subtitle && (
          <Text style={{ fontSize: 36, color: '#555', marginHorizontal: 30 }}>
            {subtitle}
          </Text>
        )}
      </View>
      <View
        style={{
          paddingVertical: 15,
          flexWrap: 'wrap',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {children}
      </View>
    </View>
  );
}

function CustomizationPuck({ isSelected, title, image, onToggle }) {
  return (
    <TouchableHighlight
      onPress={onToggle}
      underlayColor={pageBackgroundColor}
      style={{ marginRight: 15, marginBottom: 15 }}
    >
      <View
        style={{
          minHeight: 120,
          borderRadius: 15,
          borderWidth: 2,
          borderColor: isSelected ? '#111' : '#fff',
          alignItems: 'center',
          width: 280,
          backgroundColor: 'white',
          flexDirection: 'row',
        }}
      >
        {image && (
          <AirtableImage
            image={image}
            style={{ width: 100, height: 100, marginLeft: 15 }}
          />
        )}
        <Text
          style={{
            flex: 1,
            marginTop: 8,
            textAlign: 'center',
            fontSize: 20,
            color: isSelected ? '#111' : '#555',
            margin: 15,
          }}
        >
          {title}
        </Text>
      </View>
    </TouchableHighlight>
  );
}

function CustomIngredientPuck({ ingredient, onToggle, selectedCount }) {
  return (
    <CustomizationPuck
      isSelected={!!selectedCount}
      title={ingredient.Name}
      image={ingredient['Ingredient Image']}
      onToggle={onToggle}
    />
  );
}

function IngredientCustomization({ customization, state, onState }) {
  return (
    <CustomizationSection
      title={customization['Display Name']}
      subtitle={`Choose ${customization.optionLimit}`}
    >
      {customization.Ingredients.map((Ingredient, i) => (
        <CustomIngredientPuck
          ingredient={Ingredient}
          key={i}
          selectedCount={state.filter(i => i === Ingredient.id).length}
          onToggle={() => {
            if (state.filter(i => i === Ingredient.id).length) {
              onState(state.filter(i => i !== Ingredient.id));
              return;
            }
            if (state.length < customization.optionLimit) {
              onState([...state, Ingredient.id]);
              return;
            }
          }}
        />
      ))}
    </CustomizationSection>
  );
}

function CustomFunctionPuck({ fn, onToggle, state }) {
  return (
    <CustomizationPuck
      isSelected={state.indexOf(fn.id) !== -1}
      title={fn.Name}
      image={fn['Photo']}
      onToggle={onToggle}
    />
  );
}

const MAX_FUNCTIONS = 2;

function FunctionCustomization({ customization, state, onState, menuItem }) {
  return (
    <CustomizationSection
      title="Blend Function"
      subtitle={`Choose ${MAX_FUNCTIONS}`}
    >
      {Object.keys(menuItem.FunctionCustomization).map(functionId => (
        <CustomFunctionPuck
          key={functionId}
          fn={menuItem.FunctionCustomization[functionId]}
          state={state}
          onToggle={() => {
            const wasSelected = state.indexOf(functionId) !== -1;
            if (wasSelected) {
              onState(state.filter(f => f !== functionId));
              return;
            }
            if (state.length < MAX_FUNCTIONS) {
              onState([...state, functionId]);
            }
          }}
        />
      ))}
    </CustomizationSection>
  );
}

function Customization({ menuItem, setCustomization, customizationState }) {
  if (!menuItem) {
    return null;
  }
  const ingredientStates = customizationState.ingredients || {};
  const functionState = customizationState.functions || [];
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 42 }}>Blend Customization</Text>
      <FunctionCustomization
        menuItem={menuItem}
        state={customizationState.functions || menuItem.Recipe.DefaultFunction}
        onState={v => {
          setCustomization({
            ...customizationState,
            functions: v,
          });
        }}
      />
      {menuItem.IngredientCustomization.map((c, i) => (
        <IngredientCustomization
          customization={c}
          key={i}
          state={ingredientStates[c.Name] || c.defaultValue}
          onState={v => {
            setCustomization({
              ...customizationState,
              ingredients: { ...ingredientStates, [c.Name]: v },
            });
          }}
        />
      ))}
    </View>
  );
}

function Ingredients({ menuItem }) {
  return (
    <View
      style={{
        padding: 10,
        paddingLeft: 30,
        backgroundColor: 'white',
        flexWrap: 'wrap',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {menuItem.Recipe.Ingredients.map(i => (
        <Ingredient ingredient={i.Ingredient} key={i.id} />
      ))}
    </View>
  );
}

function ActiveFunctions({ menuItem, customizationState }) {
  const activeFunctionIds =
    customizationState.functions || menuItem.Recipe.DefaultFunction;
  return activeFunctionIds.map(id => {
    const fn = menuItem.FunctionCustomization[id];
    return (
      <React.Fragment key={id}>
        <Text
          style={{
            fontSize: 32,
            marginBottom: 30,
            color: '#444',
            margin: 20,
          }}
        >
          {fn.Name}
        </Text>
        <Text
          style={{
            fontSize: 24,
            marginBottom: 30,
            color: '#444',
            margin: 20,
          }}
        >
          {fn.Description}
        </Text>
      </React.Fragment>
    );
  });
}

function useOrder() {
  let cloud = useContext(CloudContext);
  let [order, setOrder] = useState();
  return [order, setOrder];
}

function useOrderItem(orderItemId) {
  let [order, setOrder] = useOrder();

  const item = null;
  function setItem(itemId, item) {
    // setOrder()
  }
  return {
    item,
    setItem,
    order,
  };
}

function MenuItemScreenWithItem({ menuItem, orderItemId }) {
  let [isCustomizing, setIsCustomizing] = useState(false);
  let [customizationState, setCustomization] = useState({});

  let { item, order, setItem } = useOrderItem(orderItemId);
  if (!menuItem) {
    return null;
  }
  const navigation = useNavigation();
  return (
    <ActionPage
      actions={[
        {
          title: 'Add to Cart',
          onPress: () => {
            setItem(orderItemId, {
              menuItemId: menuItem.id,
              customization: customizationState,
            });
            navigation.navigate('OrderConfirm');
          },
        },
        {
          title: 'Customize',
          onPress: () => {
            setIsCustomizing(!isCustomizing);
          },
        },
      ]}
    >
      <View style={{ flexDirection: 'row' }}>
        <View style={{ padding: 30, width: 440, marginTop: 120 }}>
          <Text style={{ fontSize: 42 }}>{menuItem['Display Name']}</Text>
          <AirtableImage
            image={menuItem.Recipe['Recipe Image']}
            style={{
              resizeMode: 'contain',
              height: 440,
              width: 380,
            }}
          />
          <Text style={{ fontSize: 36, color: '#444', textAlign: 'right' }}>
            {menuItem.DisplayPrice}
          </Text>
          <Text
            style={{
              fontSize: 32,
              marginBottom: 30,
              color: '#444',
              margin: 20,
            }}
          >
            {menuItem['Display Description']}
          </Text>
          <ActiveFunctions
            menuItem={menuItem}
            customizationState={customizationState}
          />
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-start',
          }}
        >
          {isCustomizing && (
            <Customization
              menuItem={menuItem}
              customizationState={customizationState}
              setCustomization={setCustomization}
            />
          )}
          {!isCustomizing && <Ingredients menuItem={menuItem} />}
        </View>
      </View>
    </ActionPage>
  );
}

const MenuItemScreenWithId = withMenuItem(MenuItemScreenWithItem);

export default function MenuItemScreen({ navigation, ...props }) {
  return (
    <MenuItemScreenWithId
      menuItemId={navigation.getParam('id')}
      orderItemId={navigation.getParam('orderItemId')}
      {...props}
    />
  );
}
