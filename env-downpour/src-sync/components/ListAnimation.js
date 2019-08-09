import React from 'react';
import { LayoutAnimation } from 'react-native';

export default class ListAnimation extends React.Component {
  UNSAFE_componentWillUpdate(nextProps) {
    if (nextProps.list !== this.props.list) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  }
  render() {
    const { list, renderItem } = this.props;
    if (!list) {
      return null;
    }
    return list.map((li, index) => renderItem(li, index));
  }
}
