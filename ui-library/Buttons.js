import React from 'react';
import { View } from 'react-native';
import Heading from '../dash-ui/Heading';
import { CodeBlock, CodeBlockExample, CodeBlockTitle } from './CodeBlock';
import { ComponentBlock } from './Layout';
import { Large, Spacing } from '../dash-ui/Theme';
import Stack from '../dash-ui/Stack';
import Button from '../dash-ui/Button';
import ButtonLink from '../dash-ui/ButtonLink';

function Buttons() {
  return (
    <ComponentBlock title="Button">
      <CodeBlock>
        <CodeBlockTitle title="Default Button" />
        <CodeBlockExample>
          <Stack>
            <Button
              title="default Button"
              onPress={() => console.log('button pressed')}
            />
            <Large>
              <Button
                title="Big Button"
                onPress={() => console.log('big button pressed')}
              />
            </Large>
          </Stack>
        </CodeBlockExample>
      </CodeBlock>

      <CodeBlock>
        <CodeBlockTitle title="Outline Button" />
        <CodeBlockExample>
          <Stack>
            <Button
              outline
              title="outline button"
              onPress={() => console.log('outline button pressed')}
            />

            <Large>
              <Button
                title="Big outline Button"
                outline
                onPress={() => console.log('big button pressed')}
              />
            </Large>
          </Stack>
        </CodeBlockExample>
      </CodeBlock>

      <CodeBlock>
        <CodeBlockTitle title="Horizontal buttons" />
        <CodeBlockExample>
          <Stack horizontal>
            <Button
              title="left Button"
              onPress={() => console.log('left button pressed')}
            />

            <Button
              title="right Button"
              onPress={() => console.log('right button pressed')}
            />
          </Stack>
        </CodeBlockExample>
      </CodeBlock>

      <CodeBlock>
        <CodeBlockTitle title="ButtonLink" />
        <CodeBlockExample>
          <Stack>
            <ButtonLink title="Button Link" to="/home" />
            <Large>
              <ButtonLink title="Big Button Link" to="/about" />
            </Large>
          </Stack>
          <Stack horizontal inline>
            <ButtonLink title="Button Link" to="/home" />
            <ButtonLink title="Button Link Active" to="/about" active />
          </Stack>
        </CodeBlockExample>
      </CodeBlock>

      <CodeBlock>
        <CodeBlockTitle title="ButtonLink Active" />
        <CodeBlockExample>
          <Large>
            <Stack horizontal inline>
              <ButtonLink title="Button Link" to="/home" active />
              <ButtonLink title="Button Link Active" to="/about" active />
            </Stack>
          </Large>
        </CodeBlockExample>
      </CodeBlock>
    </ComponentBlock>
  );
}

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
