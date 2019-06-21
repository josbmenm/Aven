import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Container from './Container';
import { useTheme } from '../dashboard/Theme'
import { Button, Link, StyledButton } from './Tokens';
import OnoBlendsLogo from './OnoBlendsLogo';
import FunctionalLink from '../navigation-web/Link';
import {
  ResponsiveDisplay,
  HideDesktopView,
  HideMobileView,
} from './Responsive';

function SidebarMenuIcon({ color, ...rest }) {
  const theme = useTheme();
  const fill = color || theme.colors.primary40;
  return (
    <svg width="28" height="26" viewBox="0 0 28 26" {...rest}>
      <path
        d="M2 11h24a2 2 0 1 1 0 4H2a2 2 0 1 1 0-4zm0 11h24a2 2 0 1 1 0 4H2a2 2 0 1 1 0-4zM2 0h24a2 2 0 1 1 0 4H2a2 2 0 1 1 0-4z"
        fill={fill}
      />
    </svg>
  );
}

function MenuLink({
  title,
  buttonStyle,
  titleStyle,
  active,
  routeName,
  ...rest
}) {
  const theme = useTheme();
  return (
    <FunctionalLink
      routeName={routeName}
      renderContent={active => (
        <StyledButton
          title={title}
          type="outline"
          buttonStyle={{
            borderRadius: 0,
            borderWidth: 0,
            borderColor: 'transparent',
            borderBottomWidth: 3,
            borderBottomColor: active ? theme.colors.primary : 'transparent',
            ...buttonStyle,
          }}
          titleStyle={titleStyle}
          {...rest}
        />
      )}
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
            <MenuLink routeName="Menu" title="menu" />
            <MenuLink routeName="Schedule" title="schedule" />
            <MenuLink routeName="OurStory" title="our story" />
            <Button
              type="outline"
              title="book with us"
              routeName="BookUs"
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
  let translateX = sidebar ? 0 : '-100%';
  return (
    <React.Fragment>
      <HideDesktopView
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          zIndex: 10,
          transform: [{ translateX }],
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'stretch',
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          }}
        >
          <View
            style={{
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
              <Link
                noActive
                size="Large"
                routeName="Schedule"
                title="schedule"
              />
              <Link
                noActive
                size="Large"
                routeName="OurStory"
                title="our story"
              />
              <Link
                noActive
                size="Large"
                routeName="BookUs"
                title="book with us"
              />
            </View>
            <View
              style={{
                paddingTop: 32,
                paddingLeft: 48,
                paddingRight: 24,
                paddingBottom: 24,
              }}
            >
              <Link
                noActive
                size="Small"
                url="https://google.com"
                title="press kit"
              />
              <Link
                noActive
                size="Small"
                routeName="Terms"
                title="terms & privacy"
              />
              <Link
                noActive
                size="Small"
                url="mailto:aloha@onofood.co"
                title="contact us"
              />
            </View>
          </View>
          <TouchableOpacity
            onPress={toggleSidebar}
            style={{
              flex: 1,
              alignSelf: 'stretch',
            }}
          />
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
              <FunctionalLink
                routeName="Home"
                renderContent={() => <OnoBlendsLogo width={68} />}
              />
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
          <SidebarMenuIcon color={sidebar ? theme.colors.primary : null} />
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
