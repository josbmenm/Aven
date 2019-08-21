import React from 'react';
import { createAppContainer } from '../navigation-native';

import { useCloud } from '../cloud-core/KiteReact';
import FeedbackCompleteScreen from '../screens/FeedbackCompleteScreen';
import FeedbackHomeScreen from '../screens/FeedbackHomeScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import FeedbackRatingScreen from '../screens/FeedbackRatingScreen';
import FeedbackReceiptScreen from '../screens/FeedbackReceiptScreen';
import FeedbackContext from './FeedbackContext';

import createStackTransitionNavigator from '../navigation-transitioner/createStackTransitionNavigator';
import { PopoverContainer } from '../views/Popover';

const FeedbackAppTransitionNavigator = createStackTransitionNavigator({
  FeedbackHome: FeedbackHomeScreen,
  Feedback: FeedbackScreen,
  FeedbackRating: FeedbackRatingScreen,
  FeedbackReceipt: FeedbackReceiptScreen,
  FeedbackComplete: FeedbackCompleteScreen,
});

export function FeedbackAppNavigator(props) {
  const cloud = useCloud();
  const feedbackDoc = null;
  function submit(values) {
    console.log('todo submit feedback', values);
    // throw new Error('Not yet');
  }
  function reset() {
    console.log('todo reset feedback');
    // throw new Error('Not yet');
  }
  return (
    <FeedbackContext.Provider value={{ submit, reset, feedbackDoc }}>
      <FeedbackAppTransitionNavigator {...props} />
    </FeedbackContext.Provider>
  );
}

FeedbackAppNavigator.navigationOptions =
  FeedbackAppTransitionNavigator.navigationOptions;
FeedbackAppNavigator.router = FeedbackAppTransitionNavigator.router;

const FeedbackAppContainer = createAppContainer(FeedbackAppNavigator);

export default function FeedbackApp() {
  return (
    <PopoverContainer>
      <FeedbackAppContainer />
    </PopoverContainer>
  );
}
