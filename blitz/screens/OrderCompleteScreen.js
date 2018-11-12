import React from 'react';
import GenericPage from '../components/GenericPage';
import Title from '../ono-components/Title';

export default class OrderComplete extends Component {
  componentDidMount() {
    setTimeout(() => {
      this.props.navigation.navigate('Home');
    }, 2000);
  }
  render() {
    return (
      <GenericPage>
        <Title>
          Your order will be ready in 5 minutes. Get the app to skip the line
          next time:
        </Title>
      </GenericPage>
    );
  }
}
