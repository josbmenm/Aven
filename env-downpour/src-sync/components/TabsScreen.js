import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { boldPrimaryFontFace, monsterra } from './Styles';

export default function TabsScreen({ tabs, navigation, children }) {
  const activeRoute = navigation.state.routes[navigation.state.index];
  return (
    <View style={{ flex: 1 }}>
      {children}
      <View style={{ height: 50, flexDirection: 'row' }}>
        {tabs.map((tab, tabIndex) => {
          const isActive = tab.routeName === activeRoute.routeName;
          return (
            <View
              key={tab.routeName}
              style={{
                flex: 1,
                backgroundColor: isActive ? monsterra : 'white',
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate(tab.routeName);
                }}
                style={{ padding: 10, alignSelf: 'stretch' }}
              >
                <Text
                  style={{
                    ...boldPrimaryFontFace,
                    fontSize: 20,
                    color: isActive ? 'white' : monsterra,
                    textAlign: 'center',
                  }}
                >
                  {tab.title}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
}
