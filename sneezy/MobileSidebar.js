import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from './ThemeContext';
import { Link, defaultButtonStyles } from './Buttons';

const SidebarMenuIcon = props => (
  <svg width="28" height="26" viewBox="0 0 28 26" {...props}>
    <path
      d="M2 11h24a2 2 0 1 1 0 4H2a2 2 0 1 1 0-4zm0 11h24a2 2 0 1 1 0 4H2a2 2 0 1 1 0-4zM2 0h24a2 2 0 1 1 0 4H2a2 2 0 1 1 0-4z"
      fill="#005151"
    />
  </svg>
);

function MobileSidebar() {
  const theme = useTheme();
  const [sidebar, setSidebar] = React.useState(false);

  function toggleSidebar() {
    setSidebar(!sidebar);
  }
  let translateX = sidebar ? 0 : -340;
  return (
    <React.Fragment>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 10,
          transform: [{ translateX }],
          backgroundColor: theme.colors.white,
          width: '90%',
          maxWidth: 340,
          paddingLeft: 12,
          ...theme.shadows.medium,
        }}
      >
        <View
          style={{
            paddingTop: 80,
            paddingLeft: 48,
            paddingRight: 24,
            paddingBottom: 24,
            borderBottomColor: theme.colors.border,
            borderBottomWidth: StyleSheet.hairlineWidth,
          }}
        >
          <Link noActive size="Large" routeName="Menu" text="menu" />
          <Link noActive size="Large" routeName="Schedule" text="schedule" />
          <Link noActive size="Large" routeName="OurStory" text="our story" />
          <Link noActive size="Large" routeName="BookUs" text="book with us" />
        </View>
        <View
          style={{
            paddingTop: 32,
            paddingLeft: 48,
            paddingRight: 24,
            paddingBottom: 24,
          }}
        >
          <Link noActive size="Small" routeName="Press" text="press kit" />
          <Link
            noActive
            size="Small"
            routeName="Terms"
            text="terms & privacy"
          />
          <Link noActive size="Small" routeName="ContactUs" text="contact us" />
        </View>
      </View>
      <TouchableOpacity
        onPress={toggleSidebar}
        style={{
          position: 'absolute',
          width: 28,
          height: 26,
          padding: 6,
          top: 21,
          left: 12,
          zIndex: 20,
        }}
      >
        <SidebarMenuIcon />
      </TouchableOpacity>
    </React.Fragment>
  );
}

export default MobileSidebar;
