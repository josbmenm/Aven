import React from 'react';
import { useNavigation } from '../navigation-hooks/Hooks';
import FeedbackCompletePage from '../components/FeedbackCompletePage';

export default function FeedbackCompleteScreen({ props }) {
  const { navigate } = useNavigation();
  return <FeedbackCompletePage {...props} />;
}
FeedbackCompleteScreen.navigationOptions =
  FeedbackCompletePage.navigationOptions;
