import React from 'react';
import { useNavigation } from '../navigation-hooks/Hooks';
import FeedbackHomePage from '../components/FeedbackHomePage';
import FeedbackContext from '../components/FeedbackContext';

export default function FeedbackHomeScreen({ props }) {
  const { navigate } = useNavigation();
  const feedbackContext = React.useContext(FeedbackContext);
  return (
    <FeedbackHomePage
      {...props}
      onSubmit={() => {
        feedbackContext && feedbackContext.reset();
        navigate('FeedbackRating');
      }}
    />
  );
}
FeedbackHomeScreen.navigationOptions = FeedbackHomePage.navigationOptions;
