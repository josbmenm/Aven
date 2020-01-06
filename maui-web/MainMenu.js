import React from 'react';
import { TouchableOpacity } from 'react-native';
import View from '../views/View';
import Text from '../views/Text';
import Container from '../dashboard/Container';
import { useTheme } from '../dashboard/Theme';
import VisualButton from '../dashboard/VisualButton';
import Link from './Link';
import ButtonLink from '../dashboard/ButtonLink';
import OnoBlendsLogo from './OnoBlendsLogo';
import FunctionalLink from '../navigation-web/Link';
import {
  ResponsiveDisplay,
  HideDesktopView,
  HideMobileView,
} from '../dashboard/Responsive';

function SidebarMenuIcon({ color, ...rest }) {
  const theme = useTheme();
  const fill = color || theme.colors.monsterras[1];
  return (
    <svg width="28" height="26" viewBox="0 0 28 26" {...rest}>
      <path
        d="M2 11h24a2 2 0 1 1 0 4H2a2 2 0 1 1 0-4zm0 11h24a2 2 0 1 1 0 4H2a2 2 0 1 1 0-4zM2 0h24a2 2 0 1 1 0 4H2a2 2 0 1 1 0-4z"
        fill={fill}
      />
    </svg>
  );
}

function MobileMenuLink({ routeName, title, ...rest }) {
  return (
    <ButtonLink
      type="link"
      noActive
      size="large"
      routeName={routeName}
      title={title}
      titleStyle={{
        textAlign: 'left',
        fontSize: 24,
      }}
      buttonStyle={{
        marginBottom: 32,
      }}
      accesible="true"
      accessibilityRole="button"
      accessibilityLabel={title}
      {...rest}
    />
  );
}

function MenuLink({
  title,
  buttonStyle,
  titleStyle,
  active,
  routeName,
  alternateActiveCheck,
  ...rest
}) {
  const theme = useTheme();
  return (
    <FunctionalLink
      routeName={routeName}
      accesible="true"
      accessibilityRole="button"
      accessibilityLabel={title}
      alternateActiveCheck={alternateActiveCheck}
      renderContent={active => (
        <VisualButton
          title={title}
          outline
          buttonStyle={{
            paddingHorizontal: 0,
            paddingVertical: 12,
            marginLeft: 32,
            borderRadius: 0,
            borderWidth: 0,
            borderColor: 'transparent',
            borderBottomWidth: 3,
            borderBottomColor: active ? theme.colors.monsterra : 'transparent',
            ...buttonStyle,
          }}
          titleStyle={{
            ...titleStyle,
          }}
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
            accesible="true"
            accessibilityRole="button"
            accessibilityLabel="Logo"
            renderContent={() => <OnoBlendsLogo />}
          />

          {/* Menu Items */}
          <View
            style={{
              alignItems: 'flex-end',
              flexDirection: 'row',
            }}
          >
            <MenuLink
              routeName="Menu"
              title="menu"
              alternateActiveCheck={state => {
                if (state.routeName === 'Blend') return true;
                return false;
              }}
            />
            {/* <MenuLink
              routeName="Schedule"
              title="schedule"
            /> */}
            <MenuLink routeName="OurStory" title="our story" />
            <ButtonLink
              outline
              title="book with us"
              routeName="BookUs"
              buttonStyle={{ marginLeft: 32 }}
              titleStyle={{ fontSize: 20 }}
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
              top: 0,
              bottom: 0,
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
                borderBottomWidth: 1,
              }}
            >
              <MobileMenuLink routeName="Menu" title="menu" />
              {/* <MobileMenuLink routeName="Schedule" title="schedule" /> */}
              <MobileMenuLink routeName="OurStory" title="our story" />
              <MobileMenuLink routeName="BookUs" title="book with us" />
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
                titleStyle={{ textAlign: 'left' }}
                title="press"
                size="small"
                routeName="Press"
                buttonStyle={{
                  paddingHorizontal: 0,
                  paddingLeft: 8,
                }}
              />
              <Link
                titleStyle={{ textAlign: 'left' }}
                title="terms & privacy"
                size="small"
                routeName="Terms"
                buttonStyle={{
                  paddingHorizontal: 0,
                  paddingLeft: 8,
                }}
              />
              <Link
                titleStyle={{ textAlign: 'left' }}
                noActive
                size="small"
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
          <SidebarMenuIcon color={sidebar ? theme.colors.monsterra : null} />
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
