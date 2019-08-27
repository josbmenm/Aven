import React from 'react';
import ActionPage from '../components/ActionPage';
import BlendCustomization from './BlendCustomization';
import { useNavigation } from '../navigation-hooks/Hooks';
import { useCompanyConfig } from '../ono-cloud/OnoKitchen';
import { getSelectedIngredients } from '../logic/configLogic';

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
      <BlendCustomization
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
