import React, { useState, useRef, useEffect } from 'react';
import ShortBlockFormPage from './ShortBlockFormPage';
import { View, Text, Image } from 'react-native';
import TextButton from './TextButton';
import { headerHeight, rightSidebarWidth, pinkColor } from './Styles';
import {
  useNavigation,
  useNavigationWillBlurEffect,
} from '../navigation-hooks/Hooks';

import { blockFormMessageTextStyle } from './Styles';
import { blockFormTitleTextStyle } from './Styles';

function PageMessage({ message }) {
  return (
    <Text
      style={{
        marginHorizontal: 10,
        ...blockFormMessageTextStyle,
        textAlign: 'center',
      }}
    >
      {message}
    </Text>
  );
}

function PageTitle({ title }) {
  return (
    <Text
      style={{
        marginHorizontal: 10,
        ...blockFormTitleTextStyle,
        textAlign: 'center',
      }}
    >
      {title}
    </Text>
  );
}

export default function FeedbackCompletePage({ backBehavior, ...props }) {
  const { navigate } = useNavigation();
  let [countdown, setCountdown] = useState(10);
  let countRef = useRef({
    count: 10,
  });
  useNavigationWillBlurEffect(() => {
    countRef.current = -1;
    clearTimeout(countRef.current.timout);
  });
  useEffect(() => {
    function doCount() {
      let count = countRef.current.count;
      if (count === 0) {
        navigate('FeedbackHome');
        return;
      } else if (count > 0) {
        const nextCount = count - 1;
        countRef.current.count = nextCount;
        setCountdown(nextCount);
        countRef.current.timeout = setTimeout(doCount, 1000);
      }
    }
    countRef.current.timeout = setTimeout(doCount, 1000);
    return () => {
      countRef.current.count = -1;
      clearTimeout(countRef.current.timout);
    };
  }, []);
  return (
    <ShortBlockFormPage backBehavior={backBehavior} {...props}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <PageMessage message="Thanks for your feedback!" />
        <PageTitle title="mahalo! see you again soon." />
        <Image
          style={{
            tintColor: pinkColor,
            width: 200,
            height: 200,
            marginVertical: 30,
            alignSelf: 'center',
          }}
          source={require('./assets/Shaka.png')}
        />
      </View>
      <View
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          height: headerHeight,
          width: rightSidebarWidth,
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}
        pointerEvents="box-none"
      >
        <TextButton
          title={`done (${countdown})`}
          onPress={() => {
            navigate('FeedbackHome');
          }}
        />
      </View>
    </ShortBlockFormPage>
  );
}

FeedbackCompletePage.navigationOptions = ShortBlockFormPage.navigationOptions;
