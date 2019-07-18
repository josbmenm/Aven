import React from 'react';
import FeedbackRatingPage from '../components/FeedbackRatingPage';

export default function FeedbackRatingScreen({ ...props }) {
  return (
    <FeedbackRatingPage
      {...props}
      onSubmit={info => {
        console.log('info is..', info);
        props.navigation.navigate('FeedbackComplete');
      }}
    />
  );
}

FeedbackRatingScreen.navigationOptions = FeedbackRatingPage.navigationOptions;
