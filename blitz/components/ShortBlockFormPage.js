import React from 'react';
import { KeyboardAvoidingView, View, StyleSheet } from 'react-native';
import BackButton from './BackButton';
import { pageBackgroundColor } from '../../components/Styles';
import { useNavigation } from '../../navigation-hooks/Hooks';
import FadeTransition from './FadeTransition';

export default function ShortBlockFormPage({
  children,
  backBehavior,
  ...props
}) {
  const { goBack } = useNavigation();
  const doGoBack = () => goBack(); // call me crazy...
  let realBackBehavior =
    backBehavior === null ? null : backBehavior || doGoBack;
  return (
    <FadeTransition backgroundColor={pageBackgroundColor} {...props}>
      <KeyboardAvoidingView
        behavior="padding"
        style={{
          ...StyleSheet.absoluteFillObject,
        }}
      >
        {children}
      </KeyboardAvoidingView>
      {realBackBehavior && <BackButton backBehavior={realBackBehavior} />}
    </FadeTransition>
  );
}
ShortBlockFormPage.navigationOptions = FadeTransition.navigationOptions;
