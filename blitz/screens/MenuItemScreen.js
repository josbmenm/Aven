import React, { useState, useContext } from 'react';
import { View, Text, Image, TouchableHighlight } from 'react-native';
import ActionPage from '../components/ActionPage';
import { useOrderItem, useMenuItem } from '../../ono-cloud/OnoKitchen';
import AirtableImage from '../components/AirtableImage';
import { pageBackgroundColor } from '../../components/Styles';
import OrderSidebar from '../components/OrderSidebar';
import MenuCard from '../components/MenuCard';
import useObservable from '../../aven-cloud/useObservable';

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

function MenuItemScreenWithId({ orderItemId, menuItemId }) {
  console.log('whahah', orderItemId);
  let [isCustomizing, setIsCustomizing] = useState(false);
  let [customizationState, setCustomization] = useState({});

  let { order, setItem, orderItem } = useOrderItem(orderItemId);
  const menuItem = useMenuItem(menuItemId);
  const item = orderItem && useObservable(orderItem.observeValue);
  console.log('woaahhhhh order iteeeeeem', { item, order, orderItem });
  if (!menuItem || !order) {
    return null;
  }
  const actions = [
    {
      secondary: true,
      title: 'customize',
      onPress: () => {
        setIsCustomizing(!isCustomizing);
      },
    },
  ];
  if (!item || item.quantity < 1) {
    actions.push({
      title: 'add to cart',
      onPress: () => {
        setItem({
          id: orderItemId,
          type: 'blend',
          menuItemId: menuItem.id,
          customization: customizationState,
          quantity: 1,
        });
      },
    });
  }
  return (
    <ActionPage actions={actions.reverse()}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ padding: 30, width: 440, marginTop: 120 }}>
          <MenuCard
            key={menuItem.id}
            title={menuItem['Display Name']}
            tag={menuItem.DefaultFunctionName}
            price={menuItem.Recipe['Sell Price']}
            photo={menuItem.Recipe['Recipe Image']}
            onPress={null}
          />
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-start',
          }}
        >
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
      <OrderSidebar />
    </ActionPage>
  );
}

export default function MenuItemScreen({ navigation, ...props }) {
  return (
    <MenuItemScreenWithId
      menuItemId={navigation.getParam('id')}
      orderItemId={navigation.getParam('orderItemId')}
      {...props}
    />
  );
}
