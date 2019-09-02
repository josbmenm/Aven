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
      onSubmit={async email => {
        navigate('FeedbackComplete');
        await feedbackContext.sendWithEmail(email);
      }}
    />
  );
}

FeedbackReceiptScreen.navigationOptions = FeedbackReceiptPage.navigationOptions;
