import React from 'react';
import FeedbackCompletePage from '../components/FeedbackCompletePage';

export default function FeedbackCompleteScreen({ ...props }) {
  return <FeedbackCompletePage {...props} hideBackButton={true} />;
}

FeedbackCompleteScreen.navigationOptions =
  FeedbackCompletePage.navigationOptions;
