import React from 'react';
import {View, Text, TextInput, ScrollView} from 'react-native';
import {Button as DashButton} from '@aven/dash';

export default function App() {
  return (
    <View style={{padding: 50}}>
      <Text>Hell1o, R11N!</Text>

      <DashButton />
    </View>
  );
}

// import 'react-native-gesture-handler';

// import * as React from 'react';
// import {View, Text, TextInput, ScrollView} from 'react-native';
// import {NavigationNativeContainer} from '@react-navigation/native';
// import {createStackNavigator} from '@react-navigation/stack';
// // import {NetworkCloudProvider} from '@aven/cloud-native';
// import {useNavigation, useFocusEffect} from '@react-navigation/core';
// import {TouchableOpacity} from 'react-native-gesture-handler';
// import Animated, {Easing} from 'react-native-reanimated';
// // import {useCloudValue} from '@aven/cloud-core';

// const defaultTheme = {
//   backgroundColor: '#eaeaea',
//   backgroundHighlightColor: 'white',
//   textColor: '#333',
//   invertTextColor: '#eee',
//   tintColor: '#d77',
//   fontSize: 16,
//   headingFontSize: 32,
//   borderRadius: 6,
//   paddingHorizontal: 12,
//   paddingVertical: 18,
//   borderWidth: 2,
// };

// const ThemeContext = React.createContext(defaultTheme);

// function useTheme() {
//   const theme = React.useContext(ThemeContext);
//   return theme;
// }

// function DashInputWithRef(
//   {
//     value,
//     onValue,
//     label,
//     mode,
//     onSubmit,
//     onFocus,
//     onBlur,
//     style,
//     name,
//     required,
//     maxLength,
//   },
//   ref,
// ) {
//   const theme = useTheme();

//   const [focus, setFocus] = React.useState(0);
//   const desiredFocus = focus ? 1 : 0;
//   const desiredPlaceholderOpen = desiredFocus || value ? 0 : 1;

//   const [placeholderOpenProgress] = React.useState(
//     new Animated.Value(desiredPlaceholderOpen),
//   );

//   React.useEffect(() => {
//     Animated.timing(placeholderOpenProgress, {
//       toValue: desiredPlaceholderOpen,
//       duration: 500,
//       easing: Easing.out(Easing.cubic),
//     }).start();
//   }, [desiredPlaceholderOpen]);

//   function handleFocus(e) {
//     setFocus(1);
//     onFocus && onFocus(e);
//   }

//   function handleBlur(e) {
//     setFocus(0);
//     onBlur && onBlur(e);
//   }

//   let autoCorrect = false;
//   let secureTextEntry = false;
//   let autoCapitalize = null;
//   let keyboardType = 'default';
//   let enablesReturnKeyAutomatically = true;
//   let Input = TextInput;
//   let inputType = undefined;
//   let inputOptions = undefined;
//   let inputRef = ref;
//   let valueHandler = onValue;
//   let multiline = false;
//   // let valueHandler = onValue;
//   if (mode === 'phone') {
//     Input = TextInput;
//     inputType = 'custom';
//     inputOptions = {
//       mask: '(999) 999-9999',
//     };
//     inputRef = i => {
//       ref.current = i && i.getElement();
//     };
//     valueHandler = onValue;
//     keyboardType = 'phone-pad';
//   } else if (mode === 'password') {
//     secureTextEntry = true;
//     autoCapitalize = 'none';
//   } else if (mode === 'description') {
//     autoCorrect = true;
//     autoCapitalize = 'sentences';
//   } else if (mode === 'number') {
//     keyboardType = 'number-pad';
//   } else if (mode === 'email') {
//     autoCapitalize = 'none';
//     keyboardType = 'email-address';
//   } else if (mode === 'name') {
//     autoCapitalize = 'words';
//   } else if (mode === 'code') {
//     autoCapitalize = 'characters';
//   } else if (mode === 'textarea') {
//     multiline = true;
//   }
//   return (
//     <Animated.View
//       style={{
//         borderRadius: theme.borderRadius,
//         flex: 1,
//         ...style,
//       }}>
//       <View
//         style={{
//           flex: 1,
//           borderRadius: theme.borderRadius,
//           borderColor: theme.tintColor,
//           borderWidth: theme.borderWidth,
//           backgroundColor: focus
//             ? theme.backgroundHighlightColor
//             : theme.backgroundColor,
//           paddingLeft: theme.paddingHorizontal,
//           paddingVertical: theme.paddingVertical,
//           paddingTop: theme.paddingVertical + 14,
//         }}>
//         <Animated.Text
//           style={{
//             // fontFamily: theme.fonts.regular,
//             position: 'absolute',
//             color: theme.tintColor,
//             top: 12,
//             bottom: 12,
//             alignItems: 'center',
//             flex: 1,
//             left: theme.paddingHorizontal,
//             right: theme.paddingHorizontal,
//             zIndex: -1,
//             fontSize: placeholderOpenProgress.interpolate({
//               inputRange: [0, 1],
//               outputRange: [12, theme.fontSize],
//             }),
//             transform: [
//               {
//                 translateY: placeholderOpenProgress.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: [-10, 0],
//                 }),
//               },
//             ],
//           }}
//           accesible="true"
//           // accessibilityLabel={`input label: ${label}`}
//           // accessibilityRole="label"
//         >
//           {label}
//         </Animated.Text>

//         <Input
//           enablesReturnKeyAutomatically={enablesReturnKeyAutomatically}
//           keyboardAppearance="dark"
//           keyboardType={keyboardType}
//           autoCorrect={autoCorrect}
//           secureTextEntry={secureTextEntry}
//           autoCapitalize={autoCapitalize}
//           ref={inputRef}
//           multiline={multiline}
//           value={value}
//           onFocus={handleFocus}
//           onBlur={handleBlur}
//           onChangeText={valueHandler}
//           options={inputOptions}
//           maxLength={maxLength}
//           type={inputType}
//           onSubmitEditing={onSubmit}
//           accesible="true"
//           accessibilityLabel="Location Input"
//           name={name}
//           required={required}
//           style={{
//             flex: 1,
//             color: theme.textColor,
//             fontSize: theme.fontSize,
//             // lineHeight: 20,
//             ...(mode === 'description' ? {minHeight: 120} : {}),
//             ...(mode === 'textarea' ? {minHeight: 200} : {}),
//           }}
//         />
//       </View>
//     </Animated.View>
//   );
// }

// const DashInput = React.forwardRef(DashInputWithRef);

// function DashText({children}) {
//   const theme = useTheme();

//   return (
//     <Text
//       style={{
//         color: theme.textColor,
//         fontSize: theme.fontSize,
//       }}>
//       {children}
//     </Text>
//   );
// }

// function DashHeading({children}) {
//   const theme = useTheme();

//   return (
//     <Text
//       style={{
//         color: theme.textColor,
//         fontSize: theme.headingFontSize,
//       }}>
//       {children}
//     </Text>
//   );
// }
// function DashLinkRow({onPress, title}) {
//   const theme = useTheme();
//   return (
//     <TouchableOpacity onPress={onPress}>
//       <View
//         style={{
//           backgroundColor: theme.backgroundHighlightColor,
//           paddingVertical: theme.paddingVertical,
//           borderBottomColor: theme.tintColor,
//           borderBottomWidth: 1,
//         }}>
//         <Text
//           style={{
//             marginHorizontal: theme.paddingHorizontal,

//             color: theme.textColor,
//             fontSize: theme.fontSize,
//           }}>
//           {title}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );
// }
// // function DashButton({onPress, title}) {
// //   const theme = useTheme();
// //   return (
// //     <TouchableOpacity onPress={onPress}>
// //       <View
// //         style={{
// //           backgroundColor: theme.tintColor,
// //           borderRadius: theme.borderRadius,
// //           paddingHorizontal: theme.paddingHorizontal,
// //           paddingVertical: theme.paddingVertical,
// //         }}>
// //         <Text
// //           style={{
// //             textAlign: 'center',
// //             color: theme.invertTextColor,
// //             fontSize: theme.fontSize,
// //           }}>
// //           {title}
// //         </Text>
// //       </View>
// //     </TouchableOpacity>
// //   );
// // }

// function useFormFocus({inputRenderers, onSubmit}) {
//   const focused = React.useRef(null);
//   const refs = React.useRef([]);

//   useFocusEffect(
//     React.useCallback(() => {
//       const firstInput = refs.current[0];
//       firstInput && firstInput.focus();
//       return () => {
//         if (focused.current !== null) {
//           const activeInputRef = refs.current[focused.current];
//           activeInputRef && activeInputRef.blur();
//         }
//       };
//     }, [refs.current]),
//   );

//   const refHandlers = React.useMemo(() => {
//     return inputRenderers.map((_, index) => {
//       return inputRef => {
//         const refVal = [...refs.current];
//         refVal[index] = inputRef;
//         refs.current = refVal;
//       };
//     });
//   }, [inputRenderers.length]);

//   function handleSubmit(index) {
//     if (index === refs.current.length - 1) {
//       const activeInputRef = refs.current[index];
//       activeInputRef && activeInputRef.blur();
//       onSubmit();
//     } else {
//       const nextInputRef = refs.current[index + 1];
//       nextInputRef && nextInputRef.focus();
//     }
//   }
//   return {
//     inputs: inputRenderers.filter(Boolean).map((renderInput, index) => {
//       return renderInput({
//         key: index,
//         ref: refHandlers[index],
//         onFocus: e => {
//           focused.current = index;
//         },
//         onBlur: e => {
//           if (focused.current === index) {
//             focused.current = null;
//           }
//         },
//         onSubmit: () => {
//           handleSubmit(index);
//         },
//       });
//     }),
//   };
// }

// const DATA_TYPES = [
//   {name: 'String', primitiveType: 'string'},
//   {name: 'Number', primitiveType: 'number'},
//   {name: 'Boolean', primitiveType: 'boolean'},
// ];

// function CreateThingForm({dataType}) {
//   const navigation = useNavigation();
//   function handleSubmit() {
//     return;
//   }
//   const [valueName, setValueName] = React.useState('');
//   const {inputs} = useFormFocus({
//     inputRenderers: [
//       props => (
//         <DashInput
//           value={valueName}
//           onValue={setValueName}
//           label={`${dataType.name} name`}
//           {...props}
//         />
//       ),
//     ],
//     onSubmit: handleSubmit,
//   });

//   return (
//     <ScrollView style={{flex: 1}}>
//       <RowsLayout>
//         <DashHeading>Creating a {dataType.name}</DashHeading>
//         {inputs}
//         <DashButton
//           title={`Create new ${dataType.name}`}
//           onPress={handleSubmit}
//         />
//       </RowsLayout>
//     </ScrollView>
//   );
// }

// function TypePickerList({onDataType}) {
//   return (
//     <ScrollView style={{flex: 1}}>
//       {DATA_TYPES.map(dataType => (
//         <DashLinkRow
//           title={`Create a ${dataType.name}`}
//           onPress={() => {
//             onDataType(dataType);
//           }}
//         />
//       ))}
//     </ScrollView>
//   );
// }

// function NewThingScreen({route}) {
//   const [dataType, setDataType] = React.useState(null);
//   if (dataType) {
//     return <CreateThingForm dataType={dataType} onDataType={setDataType} />;
//   }
//   return <TypePickerList onDataType={setDataType} />;
// }

// function RowsLayout({children}) {
//   const theme = useTheme();

//   return (
//     <View
//       style={{
//         paddingHorizontal: theme.paddingHorizontal,
//         paddingVertical: theme.paddingVertical,
//       }}>
//       {React.Children.map(children, (child, childIndex) => (
//         <View
//           style={{
//             marginTop: childIndex !== 0 ? theme.paddingVertical : 0,
//           }}>
//           {child}
//         </View>
//       ))}
//     </View>
//   );
// }
// function TestView() {
//   return null;
//   // const data = useCloudValue('RestaurantSchedule');
//   // return <DashText>{JSON.stringify(data)}</DashText>;
// }
// function HomeScreen() {
//   const navigation = useNavigation();
//   const [textValue, setTextValue] = React.useState();
//   return (
//     <ScrollView style={{flex: 1}}>
//       <RowsLayout>
//         <DashHeading>Hello Dash</DashHeading>
//         <TestView />
//         <DashButton
//           onPress={() => {
//             navigation.navigate('NewThing', {name: 'Goo'});
//           }}
//           title="add thing"
//         />
//         <DashButton
//           onPress={() => {
//             navigation.navigate('NewThing', {name: 'Goo'});
//           }}
//           title="set server"
//         />
//         <DashInput
//           label="First Name"
//           value={textValue}
//           onValue={setTextValue}
//         />
//       </RowsLayout>
//     </ScrollView>
//   );
// }

// function TypesScreen({route}) {
//   return (
//     <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
//       <Text>Edit: {route.params.name}</Text>
//     </View>
//   );
// }

// const Stack = createStackNavigator();

// function App() {
//   // const [] = useAsyncStorage()
//   // <NetworkCloudProvider
//   //     authority="onoblends.co"
//   //     useSSL={true}
//   //     domain="onofood.co">
//   return (
//     <NavigationNativeContainer>
//       <Stack.Navigator>
//         <Stack.Screen name="Home" component={HomeScreen} />
//         <Stack.Screen
//           name="Types"
//           component={TypesScreen}
//           options={({route}) => ({title: route.params.name})}
//         />
//         <Stack.Screen
//           name="NewThing"
//           component={NewThingScreen}
//           options={({route}) => ({
//             title: route.params.dataType
//               ? `New ${route.params.dataType.name}`
//               : 'New..',
//           })}
//         />
//       </Stack.Navigator>
//     </NavigationNativeContainer>
//   );
// }

// export default App;
