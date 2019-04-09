import React, { memo } from 'react';
import GenericPage from './GenericPage';
import FoodMenu from './FoodMenu';
import BlendMenu from './BlendMenu';

function ProductHomePage({ menu, ...props }) {
  let menuViews = null;
  if (menu) {
    menuViews = (
      <React.Fragment>
        <BlendMenu large menu={menu.blends} />
        <FoodMenu foodMenu={menu.food} />
      </React.Fragment>
    );
  }
  return (
    <GenericPage hideBackButton={true} {...props}>
      {menuViews}
    </GenericPage>
  );
}

ProductHomePage.navigationOptions = GenericPage.navigationOptions;

export default ProductHomePage;
