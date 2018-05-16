import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Button,
  ImageBackground,
  TouchableWithoutFeedback,
  TouchableHighlight,
} from 'react-native';

const ScrollContainer = ({ children, style }) => (
  <ScrollView
    style={{
      backgroundColor: 'white',
      flex: 1,
      ...style,
    }}
    contentContainerStyle={{
      justifyContent: 'center',
      minHeight: '100%',
    }}
    children={children}
  />
);

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
        <ScrollContainer
          style={{
            borderWidth: 25,
            borderColor: color,
          }}>
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
        </ScrollContainer>
      );
    }
  }
  return GenericScreen;
};

export const Login = createGenericScreen('Login', '#3a3', {
  path: 'login',
  links: {
    Login: { routeName: 'HomeRoute' },
  },
});

const RealLessons = [
  {
    id: 'AppArchitecture',
    coverImage: require('./assets/AppArchitecture.png'),
    name: 'Intro to App Development',
  },
  {
    id: 'FullStackData',
    coverImage: require('./assets/FullStackData.png'),
    name: 'Full stack Data Management',
  },
  {
    id: 'MobileOptimization',
    coverImage: require('./assets/MobileOptimization.png'),
    name: 'Mobile App Optimization',
  },
];

export class Home extends React.Component {
  static navigationOptions = {
    headerTitle: 'Welcome',
  };
  render() {
    return (
      <ScrollContainer>
        {RealLessons.map(lesson => (
          <View style={{ marginBottom: 20 }}>
            <TouchableWithoutFeedback
              onPress={() => {
                this.props.navigation.navigate({
                  routeName: 'LessonRoute',
                  params: { id: lesson.id },
                  key: `Lesson-${lesson.id}`,
                });
              }}>
              <ImageBackground
                source={lesson.coverImage}
                style={{
                  aspectRatio: 1.5,
                  marginBottom: 0,
                  justifyContent: 'flex-end',
                }}>
                <View style={{ padding: 15, backgroundColor: '#0007' }}>
                  <Text style={{ color: 'white', fontSize: 32 }}>
                    {lesson.name}
                  </Text>
                </View>
              </ImageBackground>
            </TouchableWithoutFeedback>
          </View>
        ))}
      </ScrollContainer>
    );
  }
}

export const Overview = createGenericScreen('Overview', '#c33', {
  path: 'overview',
  links: {
    'Lesson A': { routeName: 'Lesson', key: 'LessonA', params: { id: 'A' } },
    'Lesson B': { routeName: 'Lesson', key: 'LessonB', params: { id: 'B' } },
    'Lesson C': { routeName: 'Lesson', key: 'LessonC', params: { id: 'C' } },
  },
});

export const Lesson = createGenericScreen('Lesson', '#33c', {
  titleForParams: ({ id }) => `Lesson ${id}`,
  links: {
    'Lesson A': { routeName: 'Lesson', key: 'LessonA', params: { id: 'A' } },
    'Lesson B': { routeName: 'Lesson', key: 'LessonB', params: { id: 'B' } },
    'Lesson C': { routeName: 'Lesson', key: 'LessonC', params: { id: 'C' } },
  },
});

// export const Settings = createGenericScreen('Settings', '#333', {
//   links: {
//     'Account Settings': 'AccountSettings',
//     'Privacy Settings': 'PrivacySettings',
//     'Notification Settings': 'NotifSettings',
//   },
// });

const SettingsScreens = ['AccountSettings', 'PrivacySettings', 'NotifSettings'];

const SettingsListItem = ({ item, navigation }) => (
  <TouchableHighlight
    onPress={() => {
      navigation.navigate(item);
    }}>
    <View>
      <Text>{item}</Text>
    </View>
  </TouchableHighlight>
);

export class Settings extends React.Component {
  render() {
    return (
      <ScrollContainer>
        <Text>Settings</Text>
        {SettingsScreens.map(setting => (
          <SettingsListItem item={setting} navigation={this.props.navigation} />
        ))}
      </ScrollContainer>
    );
  }
}
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
