import React from 'react';
import { ScrollView, StyleSheet, View, Text, Button } from 'react-native';

const createGenericScreen = (name, color, opts) => {
  class GenericScreen extends React.Component {
    static path = opts.path;
    static navigationOptions = ({ navigation }) => ({
      headerTitle: opts.titleForParams
        ? opts.titleForParams(navigation.state.params)
        : name,
    });
    render() {
      return (
        <ScrollView
          style={{
            backgroundColor: 'white',
            flex: 1,
            borderWidth: 25,
            borderColor: color,
          }}
          contentContainerStyle={{
            justifyContent: 'center',
            minHeight: '100%',
          }}
        >
          <Text style={{ color, fontSize: 42, textAlign: 'center' }}>
            {opts.titleForParams
              ? opts.titleForParams(this.props.navigation.state.params)
              : name}
          </Text>
          {opts.links &&
            Object.keys(opts.links).map(linkName => (
              <View key={linkName} style={{ padding: 20 }}>
                <Button
                  title={linkName}
                  onPress={() => {
                    const link = opts.links[linkName];
                    const { navigation } = this.props;
                    if (typeof link === 'string') {
                      navigation.navigate(link);
                      return;
                    }
                    if (link.type === 'push') {
                      navigation.push(link.routeName, link.params);
                      return;
                    }
                    navigation.navigate({
                      routeName: link.routeName,
                      params: link.params,
                      key: link.key,
                    });
                  }}
                />
              </View>
            ))}
        </ScrollView>
      );
    }
  }
  return GenericScreen;
};

export const Login = createGenericScreen('Login', '#3a3', {
  path: 'login',
  links: {
    'To Home': 'Home',
  },
});

export const Home = createGenericScreen('Welcome', '#aa3', {
  path: '',
  links: {
    'Lesson A': {
      routeName: 'Lesson',
      key: 'LessonA',
      params: { id: 'A' },
    },
    'Lesson B': {
      routeName: 'Lesson',
      key: 'LessonB',
      params: { id: 'B' },
    },
    'Lesson C': {
      routeName: 'Lesson',
      key: 'LessonC',
      params: { id: 'C' },
    },
  },
});

export const Overview = createGenericScreen('Overview', '#c33', {
  path: 'overview',
  links: {
    'Lesson A': {
      routeName: 'Lesson',
      key: 'LessonA',
      params: { id: 'A' },
    },
    'Lesson B': {
      routeName: 'Lesson',
      key: 'LessonB',
      params: { id: 'B' },
    },
    'Lesson C': {
      routeName: 'Lesson',
      key: 'LessonC',
      params: { id: 'C' },
    },
  },
});

export const Lesson = createGenericScreen('Lesson', '#33c', {
  titleForParams: ({ id }) => `Lesson ${id ? id : ''}`,
  links: {
    'Lesson A': {
      routeName: 'Lesson',
      key: 'LessonA',
      params: { id: 'A' },
    },
    'Lesson B': {
      routeName: 'Lesson',
      key: 'LessonB',
      params: { id: 'B' },
    },
    'Lesson C': {
      routeName: 'Lesson',
      key: 'LessonC',
      params: { id: 'C' },
    },
  },
});

export const LessonWithPushBug2 = createGenericScreen('Lesson', '#33c', {
  titleForParams: ({ id }) => `Lesson ${id}`,
  links: {
    'Lesson A': { routeName: 'Lesson', params: { id: 'A' }, type: 'push' },
    'Lesson B': { routeName: 'Lesson', params: { id: 'B' }, type: 'push' },
    'Lesson C': { routeName: 'Lesson', params: { id: 'C' }, type: 'push' },
  },
});

export const LessonWithPushBug = createGenericScreen('Lesson', '#33c', {
  titleForParams: ({ id }) => `Lesson ${id}`,
  links: {
    'Lesson A': { routeName: 'Lesson', params: { id: 'A' } },
    'Lesson B': { routeName: 'Lesson', params: { id: 'B' } },
    'Lesson C': { routeName: 'Lesson', params: { id: 'C' } },
  },
});

export const Settings = createGenericScreen('Settings', '#333', {
  links: {
    'Account Settings': 'AccountSettings',
    'Privacy Settings': 'PrivacySettings',
    'Notification Settings': 'NotifSettings',
  },
});
export const AccountSettings = createGenericScreen(
  'Account Settings',
  '#3c3',
  {},
);
export const PrivacySettings = createGenericScreen(
  'Privacy Settings',
  '#c33',
  {},
);
export const NotifSettings = createGenericScreen('Notif Settings', '#33c', {});
