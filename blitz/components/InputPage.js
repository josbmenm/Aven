import React from 'react';
import { TextInput } from 'react-native';
import {
  inputPageStyle,
  keyboardAppearance,
  textInputLargeStyle,
} from '../../components/Styles';
import Title from '../../components/Title';
import GenericPage from './GenericPage';

export default class InputPage extends React.Component {
  state = { value: '' };
  componentDidMount() {
    this.refs.ti.focus();
  }
  render() {
    return (
      <GenericPage style={{ flex: 1, ...inputPageStyle }}>
        <Title>{this.props.title}</Title>
        <TextInput
          ref="ti"
          autoCorrect={false}
          autoCapitalize={
            this.props.type === 'email-address' ? 'none' : 'words'
          }
          keyboardType={this.props.type}
          keyboardAppearance={keyboardAppearance}
          onSubmitEditing={() => this.props.onSubmit(this.state.value)}
          onChangeText={t => this.setState({ value: t })}
          enablesReturnKeyAutomatically
          returnKeyType="done"
          style={{ textAlign: 'center', ...textInputLargeStyle }}
        />
      </GenericPage>
    );
  }
}
