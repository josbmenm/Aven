import React from 'react';
import CollectNamePage from '../components/CollectNamePage';
import { useOrder } from '../ono-cloud/OrderContext';
import { useNavigation } from '../navigation-hooks/Hooks';
import useEmptyOrderEscape from './useEmptyOrderEscape';

export default function CollectNameScreen(props) {
  const { navigate } = useNavigation();
  const { setOrderName, order } = useOrder();
  // React.useEffect(() => {
  //   // this isnt the best place to do it, but this is near the end of the checkout, should silently succeed, and shouldn't happen at the same time as the card reading (mostly to avoid potential confusion of crash causes)
  //   navigator.geolocation &&
  //     navigator.geolocation.getCurrentPosition(
  //       location => {
  //         order
  //           .transact(o => ({
  //             ...o,
  //             kioskLocation: location,
  //           }))
  //           .catch(err => {
  //             console.error('Failed to save kiosk location', err);
  //           });
  //       },
  //       e => {
  //         console.error('Failed to get kiosk location', err);
  //       },
  //       {
  //         timeout: 10000,
  //         maximumAge: 0,
  //         enableHighAccuracy: true,
  //       },
  //     );
  // }, [!!order]);

  useEmptyOrderEscape();
  return (
    <CollectNamePage
      {...props}
      onChangeName={setOrderName}
      initialName={(order && order.value.get().orderName) || {}}
      onSubmit={name => {
        navigate('OrderConfirm');
      }}
    />
  );
}

CollectNameScreen.navigationOptions = CollectNamePage.navigationOptions;
