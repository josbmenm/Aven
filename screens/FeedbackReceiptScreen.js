import React from 'react';
import FeedbackReceiptPage from '../components/FeedbackReceiptPage';
import FeedbackContext from '../components/FeedbackContext';

import { useCloud } from '../cloud-core/KiteReact';
import { useNavigation } from '../navigation-hooks/Hooks';

export default function FeedbackReceiptScreen({ ...props }) {
  const cloud = useCloud();
  const { navigate } = useNavigation();
  const feedbackContext = React.useContext(FeedbackContext);
  // feedbackContext &&
  // feedbackContext.feedbackDoc &&
  // feedbackContext.feedbackDoc.transact(f => ({
  //   ...(f || {}),
  //   comment: response.comment,
  // }));
  return (
    <FeedbackReceiptPage
      {...props}
      onSubmit={info => {
        console.log('info is..', info.email);
        cloud
          .dispatch({
            type: 'SubmitFeedback',
            feedbackId:
              feedbackContext &&
              feedbackContext.feedbackDoc &&
              feedbackContext.feedbackDoc.getName(),
            email: info.email,
          })
          .then(result => {
            console.log('haz result', result);
            navigate('FeedbackComplete');
          })
          .catch(e => {
            console.error(e);
          });
      }}
    />
  );
}

FeedbackReceiptScreen.navigationOptions = FeedbackReceiptPage.navigationOptions;
