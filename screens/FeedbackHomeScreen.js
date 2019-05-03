import React from 'react';
import { useNavigation } from '../navigation-hooks/Hooks';
import FeedbackHomePage from '../components/FeedbackHomePage';

export default function FeedbackHomeScreen({ props }) {
  const { navigate } = useNavigation();
  return <FeedbackHomePage {...props} />;
}
FeedbackHomeScreen.navigationOptions = FeedbackHomePage.navigationOptions;
