class OrderConfirm extends Component {
  render() {
    const id = this.props.navigation.getParam('id');
    const product = Products.find(p => p.id === id);
    return (
      <GenericPage {...this.props} title={product.name}>
        <TitleView>Dip Card Now</TitleView>
        <TitleView secondary>Total is {product.price}</TitleView>
        <CallToActionButton
          label="Done"
          onPress={() => {
            this.props.navigation.navigate('CollectName');
            // this.props.navigation.navigate('CheckoutComplete');
          }}
        />
      </GenericPage>
    );
  }
}
