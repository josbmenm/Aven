class CollectName extends Component {
  render() {
    return (
      <InputPage
        {...this.props}
        title={'Enter first name'}
        onSubmit={name => {
          this.props.navigation.navigate('CollectEmail', { name });
        }}
      />
    );
  }
}
