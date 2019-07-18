import React from 'react';
import TwoPanePage from '../components/TwoPanePage';
import { useCloudReducer, useCloudValue } from '../cloud-core/KiteReact';
import RestaurantReducer from '../logic/RestaurantReducer';
import ControlPanel from './ControlPanel';
import TextRow from '../components/TextRow';

function FooView() {
  // const lastActions = useCloudValue('RestaurantActions^Last20');
  // return <TextRow text={JSON.stringify(lastActions)} />;

  // return actions.map(a => {
  //   return <TextRow text={'Hello'} />;
  // });
  return null;
}

export default function SequencerScreen(props) {
  const [restaurantState, dispatch] = useCloudReducer(
    'RestaurantActions',
    RestaurantReducer,
  );
  return (
    <TwoPanePage
      {...props}
      title="Sequencer"
      icon="🚦"
      footer={
        <ControlPanel
          restaurantState={restaurantState}
          restaurantDispatch={dispatch}
        />
      }
      side={<FooView />}
    >
      {null}
    </TwoPanePage>
  );
}

SequencerScreen.navigationOptions = TwoPanePage.navigationOptions;
