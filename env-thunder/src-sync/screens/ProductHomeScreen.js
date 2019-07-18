import React from 'react';
import { useMenu } from '../ono-cloud/OnoKitchen';
import ProductHomePage from '../components/ProductHomePage';
import { useOrder } from '../ono-cloud/OnoKitchen';

function ProductHomeScreen({ ...props }) {
  const menu = useMenu();

  const { startOrder } = useOrder();

  React.useEffect(() => {
    startOrder();
  }, []);

  return <ProductHomePage {...props} menu={menu} />;
}

ProductHomeScreen.navigationOptions = ProductHomePage.navigationOptions;

export default ProductHomeScreen;
