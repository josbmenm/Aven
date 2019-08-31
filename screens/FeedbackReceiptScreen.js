import React from 'react';
import FeedbackReceiptPage from '../components/FeedbackReceiptPage';
import FeedbackContext from '../components/FeedbackContext';

import { useNavigation } from '../navigation-hooks/Hooks';

export default function FeedbackReceiptScreen({ ...props }) {
  const { navigate } = useNavigation();
  const feedbackContext = React.useContext(FeedbackContext);
  return (
    <FeedbackReceiptPage
      {...props}
      onSubmit={info => {
        navigate('FeedbackComplete');
        feedbackContext.sendWithContactInfo(info);
      }}
    />
  );
}

FeedbackReceiptScreen.navigationOptions = FeedbackReceiptPage.navigationOptions;
