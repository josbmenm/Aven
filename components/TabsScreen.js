import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { boldPrimaryFontFace, monsterra, prettyShadow } from './Styles';

function TabIndicator({ stateStream }) {
  return (
    <Image
      source={require('./assets/Positive.png')}
      style={{
        width: 25,
        height: 25,
        marginHorizontal: 8,
        tintColor: isActive ? 'white' : null,
      }}
    />
  );
}

export default function TabsScreen({ tabs, navigation, children }) {
  const activeRoute = navigation.state.routes[navigation.state.index];
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{ height: 50, flexDirection: 'row', ...prettyShadow, zIndex: 5 }}
      >
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
                style={{
                  padding: 10,
                  alignSelf: 'stretch',
                  flex: 1,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
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
                {tab.stateStream && (
                  <TabIndicator stateStream={tab.stateStream} />
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
      <View style={{ flex: 1, zIndex: 4 }}>{children}</View>
    </View>
  );
}
