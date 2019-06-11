import React from 'react';
import TwoPanePage from '../components/TwoPanePage';
import useCloudReducer from '../cloud-core/useCloudReducer';
import RestaurantReducer from '../logic/RestaurantReducer';
import ControlPanel from './ControlPanel';

export default function SequencerScreen(props) {
  const [restaurantState, dispatch] = useCloudReducer(
    'RestaurantActionsUnburnt',
    RestaurantReducer,
  );
  return (
    <TwoPanePage
      {...props}
      title="Sequencer"
      icon="🚦"
      afterSide={
        <ControlPanel
          restaurantState={restaurantState}
          restaurantDispatch={dispatch}
        />
      }
      side={null}
    >
      {null}
    </TwoPanePage>
  );
}

SequencerScreen.navigationOptions = TwoPanePage.navigationOptions;
