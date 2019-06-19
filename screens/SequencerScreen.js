import React from 'react';
import TwoPanePage from '../components/TwoPanePage';
import useCloud from '../cloud-core/useCloud';
import useCloudValue from '../cloud-core/useCloudValue';
import useCloudReducer from '../cloud-core/useCloudReducer';
import RestaurantReducer from '../logic/RestaurantReducer';
import ControlPanel from './ControlPanel';
import TextRow from '../components/TextRow';

function FooView() {
  const lastActions = useCloudValue('RestaurantActionsUnburnt^Last20');
  return <TextRow text={JSON.stringify(lastActions)} />;

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
