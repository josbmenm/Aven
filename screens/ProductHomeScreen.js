import React from 'react';
import { useMenu } from '../ono-cloud/OnoKitchen';
import ProductHomePage from '../components/ProductHomePage';
import useEmptyOrderEscape from './useEmptyOrderEscape';

function ProductHomeScreen({ ...props }) {
  const menu = useMenu();
  useEmptyOrderEscape();
  return <ProductHomePage {...props} menu={menu} />;
}

ProductHomeScreen.navigationOptions = ProductHomePage.navigationOptions;

export default ProductHomeScreen;
