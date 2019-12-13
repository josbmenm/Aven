import React from 'react';
import Heading from './composite/Heading';
import { CodeBlock, CodeBlockExample, CodeBlockTitle } from './CodeBlock';
import { Layout, Container } from './Layout';
import { ScaleUpTheme, Spacing } from './Theme';
import Horizontal from './layout/Horizontal';

import Button from './literals/Button';

function Buttons() {
  return (
    <Layout>
      <Heading title="Buttons" />
      <Container>
        <CodeBlock>
          <CodeBlockTitle title="Default Button" />
          <CodeBlockExample>
            <Button
              title="default Button"
              onPress={() => console.log('button pressed')}
            />
            <ScaleUpTheme>
              <Spacing top={16}>
                <Button
                  title="Big Button"
                  onPress={() => console.log('big button pressed')}
                />
              </Spacing>
            </ScaleUpTheme>
          </CodeBlockExample>
        </CodeBlock>

        <CodeBlock>
          <CodeBlockTitle title="Outline Button" />
          <CodeBlockExample>
            <Spacing top={16}>
              <Button
                outline
                title="outline button"
                onPress={() => console.log('outline button pressed')}
              />
            </Spacing>

            <ScaleUpTheme>
              <Spacing top={16}>
                <Button
                  title="Big outline Button"
                  outline
                  onPress={() => console.log('big button pressed')}
                />
              </Spacing>
            </ScaleUpTheme>
          </CodeBlockExample>
        </CodeBlock>

        <CodeBlock>
          <CodeBlockTitle title="Horizontal buttons" />
          <CodeBlockExample>
            <Horizontal>
              <Spacing horizontal={8}>
                <Button
                  title="left Button"
                  onPress={() => console.log('left button pressed')}
                />
              </Spacing>
              <Spacing horizontal={8}>
                <Button
                  title="right Button"
                  onPress={() => console.log('right button pressed')}
                />
              </Spacing>
            </Horizontal>
          </CodeBlockExample>
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
