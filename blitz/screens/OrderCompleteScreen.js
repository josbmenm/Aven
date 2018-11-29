import React, { Component } from 'react';
import GenericPage from '../components/GenericPage';
import Button from '../../components/Button';
import Title from '../../components/Title';

export default class OrderComplete extends Component {
  componentDidMount() {
    setTimeout(() => {}, 2000);
  }
  render() {
    return (
      <GenericPage>
        <Title>Order placed!</Title>
        <Button
          title="Free blend - text link to app"
          onPress={() => {
            this.props.navigation.navigate('AppUpsell');
          }}
        />
        <Button
          title="Email Reciept"
          onPress={() => {
            this.props.navigation.navigate('CollectEmail');
          }}
        />
        <Button
          title="Done!"
          onPress={() => {
            this.props.navigation.navigate('KioskHome');
          }}
        />
      </GenericPage>
    );
  }
}
