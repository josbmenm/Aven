import React from 'react';
import { useInStockInventoryMenu } from '../ono-cloud/OnoKitchen';
import ProductHomePage from '../components/ProductHomePage';
import { useOrder } from '../ono-cloud/OrderContext';

function ProductHomeScreen({ ...props }) {
  const menu = useInStockInventoryMenu();

  const { startOrder } = useOrder();

  React.useEffect(() => {
    startOrder();
  }, []);

  return <ProductHomePage {...props} menu={menu} />;
}

ProductHomeScreen.navigationOptions = ProductHomePage.navigationOptions;

export default ProductHomeScreen;
