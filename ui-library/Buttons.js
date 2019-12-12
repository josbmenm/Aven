import React from 'react';
import View from '../views/View';
import Text from '../views/Text';
import Button from './literals/Button';
import Heading from '../dashboard/Heading';
import { Layout, Container } from './Layout';
import { ScaleUpTheme } from './Theme';

function CodeBlock({ children }) {
  return (
    <View
      style={{
        backgroundColor: '#fefefe',
        borderRadius: 4,
        borderColor: '#dadada',
        borderWidth: 1,
      }}
    >
      {children}
    </View>
  );
}

function CodeBlockTitle({ title = 'default title' }) {
  return (
    <View
      style={{
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderBottomColor: '#dadada',
        borderBottomWidth: 1,
      }}
    >
      <Text style={{ fontSize: 14, color: '#666666' }}>{title}</Text>
    </View>
  );
}

function CodeBlockExample({ children }) {
  return (
    <View
      style={{
        padding: 16,
        borderBottomColor: '#dadada',
        borderBottomWidth: 1,
      }}
    >
      {children}
    </View>
  );
}

function CodeBlockBody({ children }) {
  return (
    <View
      style={{
        padding: 16,
        borderBottomColor: '#dadada',
        borderBottomWidth: 1,
      }}
    >
      <Text>{children}</Text>
    </View>
  );
}

function CodeBlockProps({ component }) {
  return (
    <View style={{ padding: 16 }}>
      <Text>Props here...</Text>
    </View>
  );
}

function Buttons() {
  return (
    <Layout>
      <Heading>Buttons</Heading>
      <Container>
        <CodeBlock>
          <CodeBlockTitle title="Default Button" />
          <CodeBlockExample>
            <Button
              title="default Button"
              onPress={() => console.log('button pressed')}
            />
          </CodeBlockExample>
          <CodeBlockBody>
            {`- props that handle visual aspects (buttonStyle..)
- props that handle layout or position (style (bad API))
- limit the amount of props available
`}
          </CodeBlockBody>
          <CodeBlockProps component={Button} />
        </CodeBlock>
        <CodeBlock>
          <CodeBlockTitle title="Big Button (scale 1)" />
          <CodeBlockExample>
            <ScaleUpTheme>
              <Button
                title="Big Button"
                onPress={() => console.log('button pressed')}
              />
            </ScaleUpTheme>
          </CodeBlockExample>
          <CodeBlockBody>
            {`- props that handle visual aspects (buttonStyle..)
- props that handle layout or position (style (bad API))
- limit the amount of props available
`}
          </CodeBlockBody>
          <CodeBlockProps component={Button} />
        </CodeBlock>
      </Container>
    </Layout>
  );
}

Buttons.navigationOptions = {
  title: 'Buttons',
};

export default Buttons;

/*

# Buttons

- Button
- ButtonLink
- BackButton
- ButtonStack (grupo of buttons)

## Button

### Props

* onPress
* onLongPress
* title
// * variant = 'primary'
* type = 'solid'
* buttonStyle
* titleStyle
* disabled
* style
* onLongPress
* secondary?

### Notes

- props that handle visual aspects (buttonStyle..)
- props that handle layout or position (style (bad API))
- limit the amount of props available


## ButtonLink

### Props

* title = 'link'
* type = 'solid', // solid | outline | link
* buttonStyle
* titleStyle
* routeName
* url
* target

### Notes

- link between pages component that looks like a button? (link variant??)

*/
