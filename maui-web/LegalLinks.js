import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '../navigation-hooks/Hooks';
import Link from '../navigation-web/Link';

export default function LegalLinks() {
  return (
    <View
      style={{
        borderWidth: 1,
        flexDirection: 'row',
      }}
    >
      <Link routeName="Terms">Terms of Service</Link>
      <Link routeName="Privacy">Privacy Policy</Link>
    </View>
  );
}
