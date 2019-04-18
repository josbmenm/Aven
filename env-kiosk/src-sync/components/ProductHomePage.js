import React, { memo } from 'react';
import GenericPage from './GenericPage';
import FoodMenu from './FoodMenu';
import BlendMenu from './BlendMenu';
import loadImages from '../components/Image';
import { preloadImages } from '../components/AirtableImage';

function ProductHomePage({ menu, ...props }) {
  React.useEffect(() => {
    if (!menu) {
      return;
    }
    const images = menu.blends
      .map(blend => blend.Recipe.SplashImage)
      .filter(Boolean);
    preloadImages(images).then(results => {
      console.log('splash images preloaded!');
    });
  }, [menu]);
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
