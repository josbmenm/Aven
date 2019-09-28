import React from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '../navigation-hooks/Hooks';
import Link from '../navigation-web/Link';
import { titleStyle, monsterra80 } from '../components/Styles';

function LinkBar({ children }) {
  return (
    <View
      style={{
        marginVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          borderWidth: 2,
          borderColor: monsterra80,
          borderRadius: 4,
          flexDirection: 'row',
        }}
      >
        {children}
      </View>
    </View>
  );
}

function LinkBarLink({ routeName, label }) {
  const { state } = useNavigation();
  const linkStyle = { ...titleStyle };
  const isActive = state.routeName === routeName;
  if (isActive) {
    linkStyle.color = 'white';
  }
  return (
    <Link routeName={routeName}>
      <View
        style={{
          backgroundColor: isActive ? monsterra80 : null,
          padding: 8,
          paddingHorizontal: 20,
        }}
      >
        <Text style={linkStyle}>{label}</Text>
      </View>
    </Link>
  );
}

export default function LegalLinks() {
  return (
    <LinkBar>
      <LinkBarLink routeName="Terms" label="Terms of Service" />
      <LinkBarLink routeName="Privacy" label="Privacy Policy" />
    </LinkBar>
  );
}
