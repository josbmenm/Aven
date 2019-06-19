import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Container from './Container';
import { useTheme } from './ThemeContext';
import { Button } from './Buttons';
import OnoBlendsLogo from './OnoBlendsLogo';
import FunctionalLink from '../navigation-web/Link';
import { Link } from './Buttons';
import { ResponsiveDisplay, HideDesktopView, HideMobileView } from './Tokens';

const SidebarMenuIcon = props => (
  <svg width="28" height="26" viewBox="0 0 28 26" {...props}>
    <path
      d="M2 11h24a2 2 0 1 1 0 4H2a2 2 0 1 1 0-4zm0 11h24a2 2 0 1 1 0 4H2a2 2 0 1 1 0-4zM2 0h24a2 2 0 1 1 0 4H2a2 2 0 1 1 0-4z"
      fill="#005151"
    />
  </svg>
);

function MenuLink({
  text,
  buttonStyle,
  textStyle,
  active,
  routeName,
  ...rest
}) {
  const theme = useTheme();
  return (
    <Button
      text={text}
      type="outline"
      routeName={routeName}
      buttonStyle={{
        borderRadius: 0,
        borderWidth: 0,
        borderColor: 'transparent',
        borderBottomWidth: 3,
        borderBottomColor: active ? theme.colors.primary : 'transparent',
        ...buttonStyle,
      }}
      textStyle={textStyle}
      {...rest}
    />
  );
}

export function DesktopMenu() {
  return (
    <HideMobileView
      style={{
        paddingVertical: 40,
      }}
    >
      <Container>
        <View
          style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
          }}
        >
          {/* Logo */}
          <FunctionalLink
            routeName="Home"
            renderContent={() => <OnoBlendsLogo />}
          />

          {/* Menu Items */}
          <View
            style={{
              alignItems: 'flex-end',
              flexDirection: 'row',
            }}
          >
            <MenuLink routeName="Menu" text="menu" />
            <MenuLink routeName="Schedule" text="schedule" />
            <MenuLink routeName="OurStory" text="our story" />
            <Button
              type="outline"
              text="book with us"
              routeName="BookWithUs"
              // textStyle={{ fontSize: 20 }}
              buttonStyle={{ marginLeft: 16 }}
            />
          </View>
        </View>
      </Container>
    </HideMobileView>
  );
}

export function MobileMenu() {
  const theme = useTheme();
  const [sidebar, setSidebar] = React.useState(false);

  function toggleSidebar() {
    setSidebar(!sidebar);
  }
  let translateX = sidebar ? 0 : -340;
  return (
    <React.Fragment>
      <HideDesktopView
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
      </HideDesktopView>
      <HideDesktopView>
        <Container>
          <View
            style={{
              flexDirection: 'row',
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 24,
              }}
            >
              <OnoBlendsLogo width={68} />
            </View>
          </View>
        </Container>
      </HideDesktopView>
      <HideDesktopView
        style={{
          position: 'absolute',
          top: 21,
          left: 12,
          zIndex: 20,
        }}
      >
        <TouchableOpacity
          onPress={toggleSidebar}
          style={{
            width: 40,
            height: 40,
            padding: 6,
          }}
        >
          <SidebarMenuIcon />
        </TouchableOpacity>
      </HideDesktopView>
    </React.Fragment>
  );
}

export default function LinksMenus() {
  return (
    <React.Fragment>
      <ResponsiveDisplay />
      <MobileMenu />
      <DesktopMenu />
    </React.Fragment>
  );
}
