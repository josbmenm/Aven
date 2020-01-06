import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Easing } from 'react-native-reanimated';
import { usePopover } from '../views/Popover';
import AirtableImage from './AirtableImage';
import KeyboardPopover from './KeyboardPopover';
import { useMenu } from '../ono-cloud/OnoKitchen';
import { titleStyle, monsterra } from './Styles';
import { Spinner } from '../dash-ui';

function BlendsPicker({ menu, blendId, onBlendPick, onClose }) {
  if (!menu) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Spinner />
      </View>
    );
  }
  return (
    <ScrollView style={{ width: 400, height: 600 }}>
      {menu.blends.map(blend => {
        return (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              padding: 12,
              marginHorizontal: 12,
            }}
            onPress={() => {
              onBlendPick({
                blendId: blend.id,
                blendName: blend.Recipe.Name,
              });
              onClose();
            }}
          >
            <AirtableImage
              style={{ width: 100, height: 100 }}
              image={blend.Recipe['Recipe Image']}
            />
            <Text
              style={{
                ...titleStyle,
                color: blendId === blend.id ? 'black' : monsterra,
                alignSelf: 'center',
              }}
            >
              {blend.Recipe.Name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export default function useBlendPickPopover({ blendId, onBlendPick }) {
  const menu = useMenu();
  const { onPopover } = usePopover(
    ({ onClose, ...props }) => {
      return (
        <KeyboardPopover onClose={onClose} {...props}>
          <BlendsPicker
            menu={menu}
            blendId={blendId}
            onBlendPick={onBlendPick}
            onClose={onClose}
          />
        </KeyboardPopover>
      );
    },
    { easing: Easing.linear, duration: 100 },
  );
  return onPopover;
}
