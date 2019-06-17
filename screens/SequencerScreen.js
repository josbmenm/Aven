import React from 'react';
import TwoPanePage from '../components/TwoPanePage';
import useCloudValue from '../cloud-core/useCloudValue';
import useCloudReducer from '../cloud-core/useCloudReducer';
import RestaurantReducer from '../logic/RestaurantReducer';
import ControlPanel from './ControlPanel';
import TextRow from '../components/TextRow';

function FooView() {
  const lastAction = useCloudValue('RestaurantActionsUnburnt');
  return <TextRow text={JSON.stringify(lastAction)} />;

  return actions.map(a => {
    return <TextRow text={'Hello'} />;
  });
}

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
      side={<FooView />}
    >
      {null}
    </TwoPanePage>
  );
}

SequencerScreen.navigationOptions = TwoPanePage.navigationOptions;
