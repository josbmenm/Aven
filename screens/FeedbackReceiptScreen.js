import React from 'react';
import FeedbackReceiptPage from '../components/FeedbackReceiptPage';

export default function FeedbackReceiptScreen({ ...props }) {
  return (
    <FeedbackReceiptPage
      {...props}
      onSubmit={info => {
        console.log('info is..', info);
        props.navigation.navigate('FeedbackComplete');
      }}
    />
  );
}

FeedbackReceiptScreen.navigationOptions = FeedbackReceiptPage.navigationOptions;
