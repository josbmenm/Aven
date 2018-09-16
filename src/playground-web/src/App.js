import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { createSwitchNavigator } from '@react-navigation/core';

const commonTextStyle = {
  color: '#656A86',
  fontFamily: '"Lucida Console", Monaco, monospace',
};
const liveColor = '#866565';
const Title = ({ children }) => (
  <Text style={{ ...commonTextStyle, fontSize: 48 }}>{children}</Text>
);

const NotFound = ({}) => (
  <Text style={{ ...commonTextStyle, fontSize: 48 }}>Not Found</Text>
);

const Vimeo = ({ id }) => {
  if (!id) {
    return null;
  }
  return (
    <React.Fragment>
      <style
        dangerouslySetInnerHTML={{
          __html: `
      .media-frame {
        width: 100%;
        padding-top: 56%;
        position: relative;
      }
      .media-frame-iframe {
        position: absolute;
        left: 0; right: 0; top: 0; bottom: 0;
        width: 100%;
        height: 100%;
      }
      @media only screen and (min-width: 1280px) {
        .media-frame {
          margin: 0 auto;
          width: 1280px;
          height: 720px;
          padding-top: 0px;
        }
    }
    `,
        }}
      />
      <div
        className="media-frame"
        style={{
          backgroundColor: 'black',
        }}
      >
        <iframe
          className="media-frame-iframe"
          src={`https://player.vimeo.com/video/${id}`}
          frameBorder="0"
          allowFullScreen
        />
      </div>
    </React.Fragment>
  );
};

const EPISODES = [
  {
    title: 'Hello World',
    date: 'Thu Aug 17 2018',
    vimeoId: '285449881',
  },
];
const EPISODES_BY_ID = {};
EPISODES.forEach(ep => {
  const d = new Date(ep.date);
  ep.id = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  EPISODES_BY_ID[ep.id] = ep;
});

const Episode = ({ episode }) => (
  <View style={{}}>
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          maxWidth: 1280,
          padding: 30,
          marginTop: 60,
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ ...commonTextStyle, fontSize: 42 }}>
          {episode.title}
        </Text>
        <Text style={{ ...commonTextStyle, fontSize: 42 }}>{episode.id}</Text>
      </View>
    </View>
    <Vimeo id={episode.vimeoId} />
  </View>
);

const SocialLink = ({ image, color, url, label }) => (
  <a target="_blank" href={url} style={{ textDecoration: 'none' }}>
    <View style={{ flexDirection: 'row', padding: 30 }}>
      <Image
        style={{ width: 60, height: 60 }}
        resizeMode="contain"
        source={image}
      />
      <Text style={{ color, fontSize: 46, marginLeft: 25, marginVertical: 1 }}>
        {label}
      </Text>
    </View>
  </a>
);

const Footer = () => (
  <View
    style={{
      marginVertical: 60,
      flexWrap: 'wrap',
      flexDirection: 'row',
      justifyContent: 'center',
    }}
  >
    <SocialLink
      label="AvenCloud/Globe"
      url="https://github.com/AvenCloud/Globe"
      image={require('./gh.svg')}
      color={'#656565'}
    />
    <SocialLink
      label="@EricVicenti"
      url="https://twitter.com/EricVicenti"
      image={require('./tw.svg')}
      color={'#278DB3'}
    />
  </View>
);

const Main = () => (
  <View style={{ alignItems: 'stretch' }}>
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'space-around',
        alignSelf: 'stretch',
        minHeight: 500,
      }}
    >
      <Image
        source={require('./cloud.jpg')}
        style={{
          ...StyleSheet.absoluteFillObject,
          width: null,
          height: null,
        }}
        resizeMode="cover"
      />
      <View style={{ alignSelf: 'stretch', marginVertical: 100 }}>
        <Image
          source={require('./avencodelive.svg')}
          style={{ height: 440, margin: 50, alignSelf: 'stretch' }}
          resizeMode="contain"
        />
      </View>
    </View>
    {EPISODES.map(ep => (
      <Episode episode={ep} key={ep.id} />
    ))}
    <Footer />
  </View>
);

Main.navigationOptions = {
  title: 'Aven Code Live',
};

const EpisodeScreen = ({ navigation }) => {
  const id = navigation.getParam('episodeId');
  const ep = EPISODES_BY_ID[id];
  if (!ep) {
    return <NotFound />;
  }
  return (
    <View>
      <Episode episode={ep} />
      <Footer />
    </View>
  );
};
EpisodeScreen.navigationOptions = ({ navigation }) => {
  const id = navigation.getParam('episodeId');
  const ep = EPISODES_BY_ID[id];
  let title = 'Aven Code Live';
  if (ep) {
    title = `${ep.title} - Aven Code Live`;
  }
  return { title };
};
EpisodeScreen.path = 'ep/:episodeId';

const App = createSwitchNavigator({
  Main,
  Episode: EpisodeScreen,
});

export default App;
