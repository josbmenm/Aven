import React from 'react';
import FeedbackPage from '../components/FeedbackPage';
import { useNavigation } from '../navigation-hooks/Hooks';
import FeedbackContext from '../components/FeedbackContext';

export default function FeedbackScreen({ ...props }) {
  const { navigate } = useNavigation();
  const feedbackContext = React.useContext(FeedbackContext);
  return (
    <FeedbackPage
      {...props}
      onSubmit={response => {
        // if (!feedbackContext || !feedbackContext.feedbackDoc) {
        //   return;
        // }
        navigate('FeedbackReceipt');
        // feedbackContext.feedbackDoc
        //   .transact(f => ({
        //     ...(f || {}),
        //     comment: response.comment,
        //   }))
        //   .then(() => {
        //     navigate('FeedbackReceipt');
        //   });
      }}
    />
  );
}

FeedbackScreen.navigationOptions = FeedbackPage.navigationOptions;
