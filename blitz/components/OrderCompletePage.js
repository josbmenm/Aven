import React, { useState } from 'react';
import ShortBlockFormPage from './ShortBlockFormPage';
import BlockForm from './BlockForm';
import BlockFormTitle from './BlockFormTitle';
import BlockFormMessage from './BlockFormMessage';
import BlockFormRow from './BlockFormRow';
import BlockFormButton from './BlockFormButton';
import { View } from 'react-native';
import BlockFormInput from './BlockFormInput';
import BlockFormHorizontalRule from './BlockFormHorizontalRule';
import TextButton from '../../components/TextButton';
import { headerHeight, rightSidebarWidth } from '../../components/Styles';
import { useNavigation } from '../../navigation-hooks/Hooks';

export default function OrderCompletePage({ backBehavior, ...props }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const { navigate } = useNavigation();
  return (
    <ShortBlockFormPage backBehavior={backBehavior} {...props}>
      <BlockForm>
        <BlockFormMessage message="Your order is on its way!" />
        <BlockFormTitle title="mahalo! enjoy your blend." />
        <BlockFormHorizontalRule />
        <BlockFormMessage message="Next time, skip the line and order ahead with our mobile app" />
        <BlockFormRow>
          <BlockFormInput
            mode="phone"
            label="phone number"
            value={phoneNumber}
            onValue={setPhoneNumber}
          />
        </BlockFormRow>
        <BlockFormRow>
          <BlockFormButton title="text me a link" onPress={() => {}} />
        </BlockFormRow>
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
          title="done"
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

OrderCompletePage.navigationOptions = ShortBlockFormPage.navigationOptions;
