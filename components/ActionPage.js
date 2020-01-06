import React, { useContext } from 'react';
import {
  View,
  ScrollView,
  LayoutAnimation,
  Image,
  StyleSheet,
} from 'react-native';
import Button from '../dash-ui/Button';
import {
  prettyShadow,
  buttonHeight,
  actionPagePadding,
  genericPageStyle,
  pageBackgroundColor,
} from './Styles';
import { SidebarOverlayContext } from './OrderSidebarPage';
import BackButton from './BackButton';
import { useNavigation } from '../navigation-hooks/Hooks';
import Animated from 'react-native-reanimated';
import FadeTransition from './FadeTransition';

class ActionPageWithNavigation extends React.Component {
  UNSAFE_componentWillUpdate(nextProps) {
    if (nextProps.actions.length !== this.props.actions.length) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  }
  render() {
    const {
      children,
      actions,
      navigation,
      sidebarContext,
      disableScrollView,
      hideBackButton,
    } = this.props;
    let transform = [];
    if (sidebarContext && sidebarContext.openProgress) {
      transform.push({
        translateX: Animated.interpolate(sidebarContext.openProgress, {
          inputRange: [0, 1],
          outputRange: [0, -sidebarContext.width / 2],
        }),
      });
    }
    let content = children;
    if (!disableScrollView) {
      content = (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{}}>
          {children}
        </ScrollView>
      );
    }
    return (
      <View
        style={{
          flex: 1,
          ...genericPageStyle,
          paddingBottom: buttonHeight + actionPagePadding * 2,
        }}
      >
        {content}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: actionPagePadding * 2 + buttonHeight,
            paddingVertical: 10,
            backgroundColor: pageBackgroundColor,
            ...prettyShadow,
          }}
        >
          <Animated.View
            style={{
              flex: 1,
              alignSelf: 'stretch',
              flexDirection: 'row',
              justifyContent: 'center',
              transform,
            }}
          >
            {actions.map((action, i) => (
              <View
                style={{
                  flex: 1,
                  marginHorizontal: 10,
                  marginVertical: 12,
                  maxWidth: 488,
                }}
              >
                <Button
                  key={action.title}
                  secondary={action.secondary}
                  title={action.title}
                  onPress={action.onPress}
                  onLongPress={action.onLongPress}
                  buttonStyle={{ height: buttonHeight }}
                  titleStyle={{ fontSize: 24 }}
                />
              </View>
            ))}
          </Animated.View>
        </View>
        {!hideBackButton && (
          <BackButton
            backBehavior={() => {
              navigation.goBack(null);
            }}
          />
        )}
      </View>
    );
  }
}

export default function ActionPage({ children, ...props }) {
  const navigation = useNavigation();
  const sidebar = useContext(SidebarOverlayContext);
  return (
    <FadeTransition
      {...props}
      background={
        <View style={{ flex: 1, backgroundColor: pageBackgroundColor }} />
      }
    >
      <ActionPageWithNavigation
        navigation={navigation}
        sidebarContext={sidebar}
        {...props}
      >
        {children}
      </ActionPageWithNavigation>
    </FadeTransition>
  );
}

ActionPage.navigationOptions = FadeTransition.navigationOptions;
