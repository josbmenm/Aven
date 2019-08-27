import React from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { Easing } from 'react-native-reanimated';
import { usePopover } from '../views/Popover';
import AirtableImage from './AirtableImage';
import KeyboardPopover from './KeyboardPopover';
import { useMenu } from '../ono-cloud/OnoKitchen';
import { titleStyle, monsterra } from './Styles';

export default function useBlendPickPopover({
  blendId,
  setBlendId,
  setBlendName,
}) {
  const menu = useMenu();
  const { onPopover } = usePopover(
    ({ onClose, ...props }) => {
      return (
        <KeyboardPopover onClose={onClose} {...props}>
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
                    setBlendName(blend.Recipe.Name);
                    setBlendId(blend.id);
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
        </KeyboardPopover>
      );
    },
    { easing: Easing.linear, duration: 100 },
  );
  return onPopover;
}
