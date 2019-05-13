import React, { memo } from 'react';
import GenericPage from './GenericPage';
import { Image, StyleSheet } from 'react-native';
import FoodMenu from './FoodMenu';
import BlendMenu from './BlendMenu';
import loadImages from '../components/Image';
import { usePreloadedImages } from '../components/AirtableImage';

function ProductHomePage({ menu, ...props }) {
  usePreloadedImages(() => {
    if (!menu) {
      return;
    }
    const images = menu.blends
      .map(blend => blend.Recipe.SplashImage)
      .filter(Boolean);
    return images;
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
    <GenericPage
      background={
        <Image
          source={require('./assets/BgMenu.png')}
          style={{
            ...StyleSheet.absoluteFillObject,
            width: 1366,
            height: 1024,
            resizeMode: 'contain',
          }}
          resizeMode="contain"
        />
      }
      hideBackButton={true}
      {...props}
    >
      {menuViews}
    </GenericPage>
  );
}

ProductHomePage.navigationOptions = GenericPage.navigationOptions;

export default ProductHomePage;
