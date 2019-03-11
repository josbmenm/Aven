import React from 'react';
import { useMenu } from '../../ono-cloud/OnoKitchen';
import ProductHomePage from '../../components/ProductHomePage';

function ProductHomeScreen({ ...props }) {
  const menu = useMenu();
  return <ProductHomePage {...props} menu={menu} />;
}

ProductHomeScreen.navigationOptions = ProductHomePage.navigationOptions;

export default ProductHomeScreen;
