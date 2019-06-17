import React from 'react';
import { View, Image } from 'react-native';
import GenericPage from '../GenericPage';
import PageFooter from '../PageFooter';
import Container from '../Container';
import MainMenu from '../MainMenu';
import { aspectRatio169 } from '../../components/Styles';
import { Heading, BodyText } from '../Tokens';
import { useTheme } from '../ThemeContext';
import Header from './OurStoryHeader';

function OurStory() {
  const theme = useTheme();
  return (
    <GenericPage>
      <Header />
      <PageFooter />
    </GenericPage>
  );
}

OurStory.navigationOptions = {
  title: 'Our Story',
};

export default OurStory;
