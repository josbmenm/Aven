import React from 'react';
import { createAppContainer } from '../navigation-native';

import { useCloud } from '../cloud-core/KiteReact';
import FeedbackCompleteScreen from '../screens/FeedbackCompleteScreen';
import FeedbackHomeScreen from '../screens/FeedbackHomeScreen';
import FeedbackRatingScreen from '../screens/FeedbackRatingScreen';
import FeedbackReceiptScreen from '../screens/FeedbackReceiptScreen';
import FeedbackContext from './FeedbackContext';

import createStackTransitionNavigator from '../navigation-transitioner/createStackTransitionNavigator';
import { PopoverContainer } from '../views/Popover';

const FeedbackAppTransitionNavigator = createStackTransitionNavigator({
  FeedbackHome: FeedbackHomeScreen,
  FeedbackRating: FeedbackRatingScreen,
  FeedbackReceipt: FeedbackReceiptScreen,
  FeedbackComplete: FeedbackCompleteScreen,
});

export function FeedbackAppNavigator(props) {
  const cloud = useCloud();
  const feedbackState = React.useRef({});
  function startFeedback(data) {
    feedbackState.current = data;
  }
  function sendWithContactInfo(info) {
    const results = {
      ...info,
      ...feedbackState.current,
    };
    cloud.get('CompanyActivity').putTransactionValue({
      type: 'Feedback',
      feedback: results,
    });
  }
  return (
    <FeedbackContext.Provider value={{ startFeedback, sendWithContactInfo }}>
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
