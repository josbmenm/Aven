import React from 'react';
import { createAppContainer } from '../navigation-native';

import useCloud from '../cloud-core/useCloud';
import FeedbackCompleteScreen from '../screens/FeedbackCompleteScreen';
import FeedbackHomeScreen from '../screens/FeedbackHomeScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import FeedbackRatingScreen from '../screens/FeedbackRatingScreen';
import FeedbackReceiptScreen from '../screens/FeedbackReceiptScreen';
import FeedbackContext from '../components/FeedbackContext';

import createStackTransitionNavigator from '../navigation-transitioner/createStackTransitionNavigator';
import { PopoverContainer } from '../views/Popover';

const FeedbackAppNavigator = createStackTransitionNavigator({
  FeedbackHome: FeedbackHomeScreen,
  Feedback: FeedbackScreen,
  FeedbackRating: FeedbackRatingScreen,
  FeedbackReceipt: FeedbackReceiptScreen,
  FeedbackComplete: FeedbackCompleteScreen,
});

const FeedbackAppContainer = createAppContainer(FeedbackAppNavigator);

export default function FeedbackApp() {
  const cloud = useCloud();
  const [feedbackDoc, setFeedbackDoc] = React.useState();
  function submit() {
    if (feedbackDoc) {
      feedbackDoc
        .transact(f => ({ ...f, isSubmitted: true }))
        .then(() => {
          setFeedbackDoc(null);
        });
    }
  }
  function reset() {
    const feedback = cloud.get('CustomerFeedback').children.post();
    setFeedbackDoc(feedback);
  }
  return (
    <PopoverContainer>
      <FeedbackContext.Provider value={{ submit, reset, feedbackDoc }}>
        <FeedbackAppContainer />
      </FeedbackContext.Provider>
    </PopoverContainer>
  );
}
