import React from 'react';
import { View, Text } from 'react-native';
import SpinnerButton from '../components/SpinnerButton';
import useAsyncErrorPopover from '../components/useAsyncErrorPopover';
import useKeyboardPopover from './useKeyboardPopover';
import { primaryFontFace } from './Styles';
import Tag from './Tag';

export default function AsyncButton({ onPress, title, ...props }) {
  const [isLoading, setIsLoading] = React.useState(false);
  // const { onPopover } = useKeyboardPopover(({ onClose, openArguments }) => (
  //   <View
  //     style={{
  //       minHeight: 100,
  //       width: 320,
  //       backgroundColor: Tag.negativeColor,
  //       padding: 30,
  //     }}
  //   >
  //     <Text style={{ color: 'white', ...primaryFontFace, fontSize: 18 }}>
  //       {openArguments[0].toString()}
  //     </Text>
  //   </View>
  // ));
  const handleErrors = useAsyncErrorPopover();
  function handlePress() {
    setIsLoading(true);
    handleErrors(
      onPress()
        .then(() => {})
        .finally(() => {
          setIsLoading(false);
        }),
    );
  }

  return (
    <SpinnerButton
      onPress={handlePress}
      isLoading={isLoading}
      title={title}
      {...props}
    />
  );
}
