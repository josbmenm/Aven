import React from 'react';
import GenericPage from '../GenericPage';
import PageFooter from '../PageFooter';
import Header from './Header';
import BlendsList from './BlendsList';

function Menu() {
  return (
    <GenericPage>
      <Header />
      <BlendsList />
      <PageFooter />
    </GenericPage>
  );
}

Menu.navigationOptions = {
  title: 'Our Blends',
};

export default Menu;
