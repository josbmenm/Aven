import React from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import Button from './Button';
import { Easing } from 'react-native-reanimated';
import BlockFormInput from './BlockFormInput';
import { usePopover } from '../views/Popover';
import AirtableImage from './AirtableImage';
import KeyboardPopover from './KeyboardPopover';
import useFocus from '../navigation-hooks/useFocus';
import { useMenu, useCompanyConfig } from '../ono-cloud/OnoKitchen';
import { titleStyle } from './Styles';
import { getFillsOfOrder } from '../logic/configLogic';

export default function useBlendPickPopover({
  blendId,
  setBlendId,
  setBlendName,
  setBlendFills,
}) {
  const menu = useMenu();
  const companyConfig = useCompanyConfig();
  const { onPopover } = usePopover(
    ({ onClose, popoverOpenValue }) => {
      return (
        <KeyboardPopover onClose={onClose}>
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
                    const fills = getFillsOfOrder(
                      blend,
                      { customization: null },
                      companyConfig,
                    );
                    setBlendFills(fills);
                    setBlendId(blend.id);
                    onClose();
                  }}
                >
                  <AirtableImage
                    style={{ width: 100, height: 100 }}
                    image={blend.Recipe['Recipe Image']}
                  />
                  <Text style={{ ...titleStyle, alignSelf: 'center' }}>
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
