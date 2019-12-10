import React from 'react';
import View from '../views/View';
import Button from '../dashboard/Button';
import Heading from '../dashboard/Heading';
import Layout from './Layout';

function Buttons() {
  return (
    <Layout>
      <Heading>Buttons</Heading>
      <View style={{ paddingVertical: 40 }}>
        {/* <CodeBlock>
          <CodeBlock.Title>Default Button</CodeBlock.Title>
          <CodeBlock.Component>
            <Button
              title="default Button"
              onPress={() => console.log('button pressed')}
            />
          </CodeBlock.Component>
          <CodeBlock.Notes>
            {`# Buttons

              - Button
              - ButtonLink

              ## Button

              ### Props

              * onPress
              * onLongPress
              * title
              * variant = 'primary'
              * type = 'solid'
              * buttonStyle
              * titleStyle
              * disabled
              * style

              ### Notes

              - props that handle visual aspects (buttonStyle..)
              - props that handle layout or position (style (bad API))
              - limit the amount of props available`}
          </CodeBlock.Notes>
        </CodeBlock> */}
      </View>
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

## Button

### Props

* onPress
* onLongPress
* title
* variant = 'primary'
* type = 'solid'
* buttonStyle
* titleStyle
* disabled
* style

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
