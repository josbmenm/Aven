import React from 'react';
import { useNavigation } from '../navigation-hooks/Hooks';
import FeedbackPage from '../components/FeedbackPage';

export default function FeedbackScreen({ props }) {
  const { navigate } = useNavigation();
  return (
    <FeedbackPage
      {...props}
      onSubmit={feedback => {
        console.log('feedback is..', feedback);
        debugger;
        navigate('FeedbackComplete');
      }}
    />
  );
}
FeedbackScreen.navigationOptions = FeedbackPage.navigationOptions;
