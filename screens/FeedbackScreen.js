import React from 'react';
import FeedbackPage from '../components/FeedbackPage';
import { useNavigation } from '../navigation-hooks/Hooks';

export default function FeedbackScreen({ ...props }) {
  const { navigate } = useNavigation();
  return (
    <FeedbackPage
      {...props}
      onSubmit={feedback => {
        console.log('feedback is..', feedback);
        navigate('FeedbackReceipt');
      }}
    />
  );
}

FeedbackScreen.navigationOptions = FeedbackPage.navigationOptions;
