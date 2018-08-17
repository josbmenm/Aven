import React from 'react';
import { ScrollView, StyleSheet, View, Text, Button } from 'react-native';
import { Transitioner } from '../react-navigation-transitioner';

const commonTextStyle = { color: '#222' };

const Title = ({ children }) => (
  <Text style={{ ...commonTextStyle, fontSize: 48 }}>{children}</Text>
);

const Vimeo = ({ id }) => (
  <iframe
    src={`https://player.vimeo.com/video/${id}`}
    width="640"
    height="480"
    frameborder="0"
    allowFullscreen
  />
);

const EPISODES = [
  {
    id: '',
    title: 'Hello World',
    date: 'Thu Aug 16 2018',
    description: 'yess',
    vimeoId: '285292327',
  },
  {
    title: 'Hello World2',
    date: 'Fri Aug 17 2018',
  },
];

const Episode = ({ episode }) => (
  <View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ ...commonTextStyle }}>{episode.title}</Text>
      <Text style={{ ...commonTextStyle }}>{episode.description}</Text>
    </View>
    <Vimeo id={episode.vimeoId} />
  </View>
);

const Main = () => (
  <View>
    <Title>Aven Liveshow</Title>
    {EPISODES.map(ep => (
      <Episode episode={ep} />
    ))}
  </View>
);

Main.navigationOptions = {
  title: 'Aven Liveshow',
};

const App = Transitioner({
  Main,
});

export default App;
