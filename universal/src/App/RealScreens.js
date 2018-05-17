import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Image,
  Button,
  ImageBackground,
  TouchableOpacity,
  TouchableHighlight,
} from 'react-native';
// import { TransitionView } from '../react-navigation-fluid';

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

const BackButtonHeader = ({ navigation }) => (
  <View style={{ marginTop: 20 }}>
    <TouchableOpacity
      onPress={() => {
        navigation.goBack();
      }}>
      <Text style={{ color: 'blue', fontSize: 24 }}>Back</Text>
    </TouchableOpacity>
  </View>
);

const LessonTitle = ({ children }) => (
  <Text style={{ fontSize: 34, color: '#222', paddingBottom: 20 }}>
    {children}
  </Text>
);

const RealLessons = [
  {
    id: 'A',
    coverImage: require('./assets/AppArchitecture.png'),
    name: 'Intro to App Development',
  },
  {
    id: 'B',
    coverImage: require('./assets/FullStackData.png'),
    name: 'Full stack Data Management',
  },
  {
    id: 'C',
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
          <View style={{ marginBottom: 20 }} key={lesson.id}>
            <TouchableOpacity
              onPress={() => {
                this.props.navigation.navigate({
                  routeName: 'Lesson',
                  params: { id: lesson.id },
                  key: `Lesson-${lesson.id}`,
                });
              }}>
              <View
                style={{
                  width: 375,
                  height: 375,
                }}>
                <LessonCoverImage lesson={lesson} />
                <View
                  style={{
                    padding: 15,
                    backgroundColor: '#0007',
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                  }}>
                  <Text style={{ color: 'white', fontSize: 32 }}>
                    {lesson.name}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollContainer>
    );
  }
}

const LessonCoverImage = ({ lesson }) => (
  // <TransitionView shared={lesson.id}>
  <Image source={lesson.coverImage} style={styles.lessonImage} />
  // </TransitionView>
);

export const Lesson = ({ navigation }) => {
  const lesson = RealLessons.find(l => l.id === navigation.getParam('id'));
  return (
    <ScrollContainer>
      {/* <BackButtonHeader navigation={navigation} /> */}
      <LessonTitle>{lesson.name}</LessonTitle>
      <LessonCoverImage lesson={lesson} />
      <Text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </Text>
      <Text>
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem
        accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab
        illo inventore veritatis et quasi architecto beatae vitae dicta sunt
        explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut
        odit aut fugit, sed quia consequuntur magni dolores eos qui ratione
        voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum
        quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam
        eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat
        voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam
        corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?
        Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse
        quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo
        voluptas nulla pariatur?
      </Text>
      <Text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </Text>
    </ScrollContainer>
  );
};

const styles = StyleSheet.create({
  lessonImage: {
    width: 375,
    height: 375,
  },
});
