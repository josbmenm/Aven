import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TouchableHighlight,
  AlertIOS,
  Image,
} from 'react-native';
import { createStackNavigator, withNavigation } from 'react-navigation';
import { Page, InputPage, ButtonRow, TitleView } from './Components';
import { Provider, Subscribe } from 'unstated';
import Debug from './Debug';
import truck from './Truck';
import {
  AirtableData,
  connectComponent,
  writeRef,
  OnoClient,
} from './DataClient';

StatusBar.setHidden(true, 'none');

console.ignoredYellowBox = ['Warning:'];

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

const productPhotoAspectRatio = 1;

const Products = [
  {
    id: 'focus',
    name: 'Focus Function',
    description: 'this blend will boost your mental sharpness for the day.',
    color: '#6666aa',
    size: '20oz',
    price: '$5.00',
    nutrition: '595 cal',
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
    size: '20oz',
    price: '$5.00',
    nutrition: '595 cal',
    description: 'this blend will help you recover after an intense workout.',
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
    size: '20oz',
    price: '$5.00',
    nutrition: '595 cal',
    description: 'this blend supports digestion and boosts your immunity.',
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
    size: '20oz',
    price: '$5.00',
    nutrition: '595 cal',
    description: 'this blend helps you recover after a long weekend.',
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
const ingredientFontSize = 26;

const PlaceholderImage = ({ style, color }) => (
  <Image
    source={{ uri: 'https://i.imgur.com/jyD9vCX.jpg' }}
    resizeMode="stretch"
    style={style}
  />
);

const makeHitSlop = slop => ({
  top: slop,
  right: slop,
  bottom: slop,
  left: slop,
});

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
          style={{ width: 200, aspectRatio: 1 }}
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

const ProductListD = ({ airtable }) => {
  return null;
  // return (
  //   <Text>
  //     {airtable.getValue() ? Object.keys(airtable.getValue()) : 'nope'}
  //   </Text>
  // );
};
const ProductList = connectComponent(ProductListD);

const DashButton = ({ title, onPress, isSelected }) => (
  <TouchableHighlight style={{}} onPress={onPress}>
    <View
      style={{
        backgroundColor: '#efefef',
        paddingHorizontal: 40,
        paddingVertical: 20,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#ccc',
      }}
    >
      <Text
        style={{
          ...genericFont,
          fontSize: 40,
          color: '#111',
        }}
      >
        {title}
      </Text>
    </View>
  </TouchableHighlight>
);

const handleAsyncFailure = promise => {
  promise.then(
    () => {},
    e => {
      alert('An error occurred');
      console.error(e);
    },
  );
};

const setCustomerName = async name =>
  await writeRef('truckState', lastState => ({
    ...lastState,
    customerName: name,
  }));

const resetStatus = async () =>
  await writeRef('truckState', lastState => ({
    ...lastState,
    customerQueued: false,
    blendReady: false,
  }));

const setBlendReady = async () =>
  await writeRef('truckState', lastState => ({
    ...lastState,
    customerQueued: true,
    blendReady: true,
  }));

const setCustomerQueued = async () =>
  await writeRef('truckState', lastState => ({
    ...lastState,
    blendReady: false,
    customerQueued:
      lastState.customerQueued == null ? true : !lastState.customerQueued,
  }));

let JSONView;
JSONView = ({ data }) => {
  let type = typeof data;
  if (Array.isArray(data)) {
    type = 'array';
  } else if (data === null || data === undefined) {
    type = 'null';
  }
  switch (type) {
    case 'null':
      return <Text>Empty</Text>;
    case 'number':
    case 'string':
    case 'boolean':
      return <Text>{JSON.stringify(data)}</Text>;
    case 'array':
      return (
        <View style={{ borderWidth: 1, borderRadius: 5, borderColor: '#ccf' }}>
          {data.map(item => (
            <JSONView data={item} />
          ))}
        </View>
      );
    case 'object':
      return (
        <View style={{ borderWidth: 1, borderRadius: 5, borderColor: '#ccc' }}>
          {Object.keys(data)
            .sort()
            .map(itemName => (
              <View style={{ flexDirection: 'row', marginVertical: 5 }}>
                <View style={{ width: 200, padding: 10 }}>
                  <Text style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    {itemName}
                  </Text>
                </View>
                <View
                  style={{ padding: 10, backgroundColor: '#fff9', flex: 1 }}
                >
                  <JSONView data={data[itemName]} />
                </View>
              </View>
            ))}
        </View>
      );
  }
};

const DebugDataD = ({ input }) => {
  const val = input.getValue();
  return (
    <View style={{ padding: 40 }}>
      <JSONView data={val && val.value} />
    </View>
  );
};
const DebugData = connectComponent(DebugDataD);

const RobotStatusD = ({ robot }) => {
  const statusColor = robot.isConnected ? '#090' : '#900';
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 40,
      }}
    >
      <View
        style={{
          backgroundColor: statusColor,
          padding: 8,
          paddingHorizontal: 18,
          borderRadius: 25,
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 26 }}>
          {robot.isConnected ? 'Robot Connected' : 'Robot Disconnected'}
        </Text>
      </View>
    </View>
  );
};
const RobotStatus = () => (
  <Provider>
    <Subscribe to={[truck]}>
      {robot => <RobotStatusD robot={robot.state} />}
    </Subscribe>
  </Provider>
);

class DebugHome extends Component {
  render() {
    return (
      <ScreenContent>
        <ScrollView
          style={{ flex: 1, borderWidth: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <TitleView>Ono Dashboard</TitleView>
          <RobotStatus />
          <ProductList airtable={AirtableData} />
          <DebugData input={OnoClient.getRef('truckState').watchObject()} />
          <DashButton
            title="0. Customer Name"
            onPress={() => {
              AlertIOS.prompt('Customer Name:', null, val => {
                handleAsyncFailure(setCustomerName(val));
              });
            }}
          />
          <DashButton
            title="1. Set customer queued"
            onPress={() => {
              handleAsyncFailure(setCustomerQueued());
            }}
          />
          <DashButton
            title="2. Start Blend!"
            onPress={() => {
              handleAsyncFailure(truck.sendDebugCommand('o'));
            }}
          />
          <DashButton
            title="3. Set blend ready"
            onPress={() => {
              handleAsyncFailure(setBlendReady());
            }}
          />

          <DashButton
            title="4. Reset"
            onPress={() => {
              handleAsyncFailure(resetStatus());
            }}
          />
          <DashButton
            title="🤖 Robot Debug Signals"
            onPress={() => {
              this.props.navigation.navigate('Debug');
            }}
          />
        </ScrollView>
      </ScreenContent>
    );
  }
}

class Home extends Component {
  render() {
    return <DebugHome {...this.props} />;
    return (
      <ScreenContent>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <TitleView>Select a blend</TitleView>
          <ProductList airtable={AirtableData} />
          {Products.map(product => (
            <ProductLink product={product} key={product.id} />
          ))}
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate('Debug');
            }}
          >
            <Text
              style={{
                ...genericFont,
                textAlign: 'center',
                margin: 40,
                color: '#444',
              }}
            >
              Robot Debugging
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </ScreenContent>
    );
  }
}

class Button extends Component {
  render() {
    const { onPress, label } = this.props;
    return (
      <TouchableOpacity onPress={onPress} style={{ margin: 30 }}>
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
      <View
        style={{ alignItems: 'center', marginTop: 20, marginRight: 20 }}
        key={feature.name}
      >
        <PlaceholderImage
          style={{ width: 100, height: 100, marginBottom: 30 }}
          color="#22cc22"
        />
        <Text
          style={{
            flex: 1,
            ...genericFont,
            marginRight: 60,
            marginTop: 8,
            textAlign: 'center',
            alignSelf: 'center',
            fontSize: ingredientFontSize,
          }}
        >
          {feature.name}
        </Text>
      </View>
    ))}
  </View>
);

const Ingredients = ({ product }) => (
  <View style={{ flexDirection: 'row', padding: 0 }}>
    {product.ingredients.map(i => (
      <View
        style={{ alignItems: 'center', marginTop: 20, marginRight: 20 }}
        key={i.name}
      >
        <PlaceholderImage
          style={{ width: 100, height: 100, marginBottom: 30 }}
          color="#22cc22"
        />
        <Text
          style={{
            ...genericFont,
            fontSize: ingredientFontSize,
            marginTop: 8,
            textAlign: 'center',
            minWidth: 190,
          }}
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
      <Page {...this.props} title={product.name} disableScroll>
        <PlaceholderImage
          color={product.color}
          style={{
            aspectRatio: 3,
            alignSelf: 'stretch',
          }}
        />
        <ScreenContent>
          <View style={{ padding: 30 }}>
            <Features product={product} />
            <Text style={{ ...genericFont, fontSize: 42, marginBottom: 30 }}>
              {product.description}
            </Text>
            <Text style={{ ...genericFont, fontSize: 52 }}>
              <Text style={{ fontSize: 54 }}>ingredients | </Text>
              {product.size} - {product.nutrition}
            </Text>
            <Ingredients product={product} />
          </View>
        </ScreenContent>
        <Button
          label="Checkout"
          onPress={() => {
            this.props.navigation.navigate('Payment', { id });
          }}
        />
      </Page>
    );
  }
}

class Payment extends Component {
  render() {
    const id = this.props.navigation.getParam('id');
    const product = Products.find(p => p.id === id);
    return (
      <Page {...this.props} title={product.name}>
        <TitleView>Dip Card Now</TitleView>
        <TitleView secondary>Total is {product.price}</TitleView>
        <Button
          label="Done"
          onPress={() => {
            this.props.navigation.navigate('CollectName');
            // this.props.navigation.navigate('InProgress');
          }}
        />
      </Page>
    );
  }
}

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

class CollectEmail extends Component {
  render() {
    const { getParam } = this.props.navigation;
    return (
      <InputPage
        {...this.props}
        title={'Enter email'}
        type="email-address"
        onSubmit={email => {
          truck.makeOrder({
            name: getParam('name'),
            email,
            product: 'Fitness',
          });

          this.props.navigation.navigate('InProgress');
        }}
      />
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
        <TitleView>Preparing your blend now..</TitleView>
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
    Debug,
    CollectName,
    CollectEmail,
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

// class ReadyOrders extends React.Component {
//   state = {clearedIds: []}
//   render() {
//     const {orders} = this.props;
//     const output = [];
//     for (let orderId in orders) {
//       if (this.state.clearedIds.indexOf(orderId)!==-1) { return}
//       const order = orders[orderId];
//       output.push(
//     <TouchableOpacity onPress={() => {
//       this.setState(state => ({clearedIds: [...state.clearedIds, orderId]}))
//     }}><Text style={{fontSize: 80, textAlign: 'center'}}>{JSON.stringify(order.details.name)}</Text></TouchableOpacity>)
//   }
//   return <React.Fragment>{output}<React.Fragment>;
//   }
// }
//
// const OrderStatus = ({orders}) => {
//   const readyOrders = [];
//   for (let orderId in orders) {
//     const order = orders[orderId];
//     // if (order.status === 'ready') {
//       readyOrders.push(order);
//     // }
//   }
//   return <ReadyOrders orders={readyOrders} />
// }
//
// const PickupScreen = () => <Provider><Subscribe to={[truck]}>{truck => <OrderStatus orders={truck.state.orders} />}</Subscribe></Provider>

// export default PickupScreen;
