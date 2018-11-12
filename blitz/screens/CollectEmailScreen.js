class CollectEmail extends Component {
  render() {
    const { getParam } = this.props.navigation;
    return (
      <InputPage
        {...this.props}
        title={'Enter email'}
        type="email-address"
        onSubmit={email => {
          this.props.navigation.navigate('CheckoutComplete');
        }}
      />
    );
  }
}
