import React, { useState, useRef, useEffect } from 'react';
import ShortBlockFormPage from './ShortBlockFormPage';
import BlockForm from './BlockForm';
import BlockFormTitle from './BlockFormTitle';
import BlockFormMessage from './BlockFormMessage';
import BlockFormRow from './BlockFormRow';
import BlockFormButton from './BlockFormButton';
import { View } from 'react-native';
import BlockFormInput from './BlockFormInput';
import BlockFormHorizontalRule from './BlockFormHorizontalRule';
import TextButton from './TextButton';
import { headerHeight, rightSidebarWidth } from './Styles';
import {
  useNavigation,
  useNavigationWillBlurEffect,
} from '../navigation-hooks/Hooks';

export default function OrderCompletePage({ backBehavior, ...props }) {
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
        navigate('KioskHome');
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
      <BlockForm>
        <BlockFormMessage message="Your order is on its way!" />
        <BlockFormTitle title="mahalo! enjoy your blend." />
      </BlockForm>
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
          onLongPress={() => {
            navigate('Home');
          }}
          onPress={() => {
            navigate('KioskHome');
          }}
        />
      </View>
    </ShortBlockFormPage>
  );
}

// <BlockFormHorizontalRule />
// <BlockFormMessage message="Next time, skip the line and order ahead with our mobile app" />
// <BlockFormRow>
//   <BlockFormInput
//     mode="phone"
//     label="phone number"
//     value={phoneNumber}
//     onValue={setPhoneNumber}
//   />
// </BlockFormRow>
// <BlockFormRow>
//   <BlockFormButton title="text me a link" onPress={() => {}} />
// </BlockFormRow>

OrderCompletePage.navigationOptions = ShortBlockFormPage.navigationOptions;