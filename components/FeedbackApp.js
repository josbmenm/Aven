import React from 'react';
import { createAppContainer } from '../navigation-native';

import { useCloud } from '../cloud-core/KiteReact';
import FeedbackCompleteScreen from '../screens/FeedbackCompleteScreen';
import FeedbackHomeScreen from '../screens/FeedbackHomeScreen';
import FeedbackReceiptScreen from '../screens/FeedbackReceiptScreen';
import FeedbackContext from './FeedbackContext';

import createStackTransitionNavigator from '../navigation-transitioner/createStackTransitionNavigator';
import { PopoverContainer } from '../views/Popover';

const FeedbackAppTransitionNavigator = createStackTransitionNavigator({
  FeedbackHome: FeedbackHomeScreen,
  FeedbackReceipt: FeedbackReceiptScreen,
  FeedbackComplete: FeedbackCompleteScreen,
});

export function FeedbackAppNavigator(props) {
  const cloud = useCloud();
  const feedbackState = React.useRef({});
  function startFeedback(data) {
    feedbackState.current = data;
  }
  async function sendWithEmail(email) {
    await cloud.dispatch({
      type: 'SubmitFeedback',
      email,
      feedback: feedbackState.current,
    });
  }
  return (
    <FeedbackContext.Provider value={{ startFeedback, sendWithEmail }}>
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
