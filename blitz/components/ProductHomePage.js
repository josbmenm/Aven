import React, { memo } from 'react';
import GenericPage from '../components/GenericPage';
import FoodMenu from '../components/FoodMenu';
import BlendMenu from '../components/BlendMenu';

function ProductHomePageMemo({ menu, ...props }) {
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
const ProductHomePage = memo(ProductHomePageMemo);

ProductHomePage.navigationOptions = GenericPage.navigationOptions;

export default ProductHomePage;
