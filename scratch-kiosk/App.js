/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TouchableHighlight,
} from 'react-native';
import { createStackNavigator, withNavigation } from 'react-navigation';

console.ignoredYellowBox = ['Warning:'];

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

const ProductIngredients = {
  peanutButter: {
    name: 'Peanut Butter',
    color: '#87672C',
  },
  blueberries: {
    name: 'Blueberries',
    color: '#2C3A87',
  },
  proteinPowder: {
    name: 'Protein Powder',
    color: '#656A86',
  },
};

const ProductFeatures = {
  brain: { name: 'brain' },
  stress: { name: 'stress' },
  energy: { name: 'energy' },
};

const genericFont = {
  fontFamily: 'Courier New',
  color: '#111',
};

const placeholderPadding = 30;
const productPhotoAspectRatio = 4 / 3;

const Products = [
  {
    id: 'focus',
    name: 'Focus Function',
    description: 'this smoothie will boost your mental sharpness for the day',
    color: '#6666aa',
    size: '24oz',
    nutrition: '795 cal',
    ingredients: [
      ProductIngredients.peanutButter,
      ProductIngredients.blueberries,
    ],
    features: [
      ProductFeatures.brain,
      ProductFeatures.stress,
      ProductFeatures.energy,
    ],
  },
  {
    id: 'fitness',
    name: 'Fitness Function',
    color: '#aa6666',
    size: '24oz',
    nutrition: '795 cal',
    description: 'this smoothie will boost your mental sharpness for the day',
    ingredients: [
      ProductIngredients.peanutButter,
      ProductIngredients.blueberries,
    ],
    features: [
      ProductFeatures.brain,
      ProductFeatures.stress,
      ProductFeatures.energy,
    ],
  },
  {
    id: 'digest',
    name: 'Digestive Function',
    color: '#66aa66',
    size: '24oz',
    nutrition: '795 cal',
    description: 'this smoothie will boost your mental sharpness for the day',
    ingredients: [
      ProductIngredients.peanutButter,
      ProductIngredients.blueberries,
    ],
    features: [
      ProductFeatures.brain,
      ProductFeatures.stress,
      ProductFeatures.energy,
    ],
  },
  {
    id: 'detox',
    name: 'Detox Function',
    color: '#666666',
    size: '24oz',
    nutrition: '795 cal',
    description: 'this smoothie will boost your mental sharpness for the day',
    ingredients: [
      ProductIngredients.peanutButter,
      ProductIngredients.blueberries,
    ],
    features: [
      ProductFeatures.brain,
      ProductFeatures.stress,
      ProductFeatures.energy,
    ],
  },
];

const placeholderBorderWidth = 5;
const placeholderTitleSize = 90;

const PlaceholderImage = ({ style, color }) => (
  <View
    style={{
      ...style,
      borderWidth: placeholderBorderWidth,
      borderColor: color,
      backgroundColor: color + '66',
    }}
  />
);

const PlaceholderTitle = ({ children, secondary }) => (
  <Text
    style={{
      ...genericFont,
      fontSize: placeholderTitleSize,
      textAlign: 'center',
      padding: 100,
      color: secondary ? '#666' : '#111',
    }}
  >
    {children}
  </Text>
);

const makeHitSlop = slop => ({
  top: slop,
  right: slop,
  bottom: slop,
  left: slop,
});

const PageHeader = ({ navigation, title }) => (
  <View
    style={{
      backgroundColor: '#ccc',
      alignSelf: 'stretch',
      flexDirection: 'column',
    }}
  >
    <View
      style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center' }}
    >
      <Text
        style={{
          color: '#111',
          fontSize: placeholderTitleSize,
          textAlign: 'center',
          padding: 60,
        }}
      >
        {title}
      </Text>
    </View>
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={{
        paddingVertical: 20,
        aspectRatio: 1,
        height: 260,
      }}
    >
      <Text
        style={{
          marginVertical: 20,
          marginHorizontal: 20 + placeholderPadding,
          fontSize: 120,
          color: '#111',
        }}
      >
        ←
      </Text>
    </TouchableOpacity>
  </View>
);

const ProductLinkWithNav = ({ product, navigation }) => {
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('Product', { id: product.id });
      }}
    >
      <View
        style={{
          borderWidth: 1,
          padding: 40,
          marginHorizontal: 80,
          flexDirection: 'row',
          marginVertical: 30,
        }}
      >
        <PlaceholderImage
          color={product.color}
          style={{ width: 200, aspectRatio: productPhotoAspectRatio }}
        />
        <View style={{ flex: 1, marginLeft: 40, justifyContent: 'center' }}>
          <Text style={{ fontSize: 42, ...genericFont }}>{product.name}</Text>
          <Text style={{ ...genericFont }}>{product.description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
const ProductLink = withNavigation(ProductLinkWithNav);

class Home extends Component {
  render() {
    return (
      <ScreenContent>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <PlaceholderTitle>Welcome to ono food co!</PlaceholderTitle>
          <PlaceholderTitle secondary>Select a smoothie</PlaceholderTitle>
          {Products.map(product => (
            <ProductLink product={product} key={product.id} />
          ))}
        </ScrollView>
      </ScreenContent>
    );
  }
}

class Button extends Component {
  render() {
    const { onPress, label } = this.props;
    return (
      <TouchableOpacity
        onPress={onPress}
        style={{ margin: placeholderPadding }}
      >
        <View
          style={{ padding: 40, backgroundColor: '#222', borderRadius: 30 }}
        >
          <Text
            style={{
              fontSize: 40,
              textAlign: 'center',
              ...genericFont,
              color: 'white',
            }}
          >
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const Features = ({ product }) => (
  <View style={{ flexDirection: 'row', marginBottom: 60 }}>
    {product.features.map(feature => (
      <Text style={{ ...genericFont, marginRight: 60, fontSize: 42 }}>
        {feature.name}
      </Text>
    ))}
  </View>
);

const Ingredients = ({ product }) => (
  <View style={{ flexDirection: 'row', padding: 0 }}>
    {product.ingredients.map(i => (
      <View style={{ marginRight: 40, marginBottom: 40 }}>
        <PlaceholderImage
          style={{ width: 140, aspectRatio: 1 }}
          color="#22cc22"
        />
        <Text
          style={{ ...genericFont, fontSize: 26, maxWidth: 140, marginTop: 8 }}
        >
          {i.name}
        </Text>
      </View>
    ))}
  </View>
);

class Product extends Component {
  render() {
    const id = this.props.navigation.getParam('id');
    const product = Products.find(p => p.id === id);
    return (
      <View style={{ flex: 1 }}>
        <PageHeader navigation={this.props.navigation} title={product.name} />
        <PlaceholderImage
          color={product.color}
          style={{ aspectRatio: productPhotoAspectRatio, alignSelf: 'stretch' }}
        />
        <ScreenContent>
          <View style={{ padding: placeholderPadding }}>
            <Features product={product} />
            <Text style={{ ...genericFont, fontSize: 42, marginBottom: 30 }}>
              {product.description}
            </Text>
            <Text style={{ ...genericFont, fontSize: 52 }}>
              <Text style={{ fontSize: 64 }}>ingredients | </Text>
              {product.size} - {product.nutrition}
            </Text>
            <Ingredients product={product} />
          </View>
        </ScreenContent>

        <Button
          label="Order Smoothie"
          onPress={() => {
            this.props.navigation.navigate('Payment', { id });
          }}
        />
      </View>
    );
  }
}

class Payment extends Component {
  render() {
    const id = this.props.navigation.getParam('id');
    const product = Products.find(p => p.id === id);
    return (
      <View style={{ flex: 1 }}>
        <PageHeader navigation={this.props.navigation} title={product.name} />
        <ScreenContent>
          <PlaceholderTitle>Dip Card Now</PlaceholderTitle>
          <PlaceholderTitle secondary>Total is $6.66</PlaceholderTitle>
        </ScreenContent>
        <Button
          label="Done"
          onPress={() => {
            this.props.navigation.navigate('InProgress');
          }}
        />
      </View>
    );
  }
}

const ScreenContent = ({ children }) => (
  <View style={{ flex: 1, justifyContent: 'center' }}>{children}</View>
);

class InProgress extends Component {
  componentDidMount() {
    setTimeout(() => {
      this.props.navigation.navigate('Home');
    }, 2000);
  }
  render() {
    return (
      <ScreenContent>
        <PlaceholderTitle>Preparing your smoothie now..</PlaceholderTitle>
      </ScreenContent>
    );
  }
}

const App = createStackNavigator(
  {
    Home,
    Product,
    Payment,
    InProgress,
  },
  {
    navigationOptions: {
      header: <View style={{ height: 0 }} />,
    },
  },
);

const AppContainer = () => (
  <View style={{ flex: 1 }}>
    <App />
  </View>
);

export default AppContainer;
