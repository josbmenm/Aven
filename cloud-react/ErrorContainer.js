import React from 'react';

// This simple class component allows us to use functions to define an error boundary ;-)

export default class ErrorContainer extends React.Component {
  state = { error: null, errorInfo: null };
  componentDidCatch(e, i) {
    this.setState({ error: e, errorInfo: i });
    this.props.onCatch(e, i, this.retry);
  }
  retry = () => {
    this.setState({ error: null, errorInfo: null });
  };
  render() {
    if (this.state.error) {
      return this.props.renderError({
        error: this.state.error,
        errorInfo: this.state.errorInfo,
        onRetry: this.retry,
      });
    }
    return this.props.children;
  }
}
