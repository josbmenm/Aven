import React from 'react';
import { View } from 'react-native';
import Heading from '../dash-ui/Heading';
import { CodeBlock, CodeBlockExample, CodeBlockTitle } from './CodeBlock';
import { ComponentBlock } from './Layout';
import { Large, Spacing } from '../dash-ui/Theme';
import Spinner from '../dashboard/Spinner';
import Stack from '../dash-ui/Stack';
import Button from '../dash-ui/Button';
import ButtonLink from '../dash-ui/ButtonLink';

function Buttons() {
  return (
    <ComponentBlock title="Button">
      <CodeBlock>
        <CodeBlockTitle title="Default Button" />
        <CodeBlockExample>
          <Stack horizontal>
            <Button
              title="primary Button"
              onPress={() => console.log('button pressed')}
            />
            <Button
              status="positive"
              title="positive Button"
              onPress={() => console.log('big button pressed')}
            />
            <Button
              status="negative"
              title="negative Button"
              onPress={() => console.log('big button pressed')}
            />
            <Button
              status="warning"
              title="warning Button"
              onPress={() => console.log('big button pressed')}
            />
          </Stack>
        </CodeBlockExample>
      </CodeBlock>

      <CodeBlock>
        <CodeBlockTitle title="Large Button" />
        <CodeBlockExample>
          <Large>
            <Stack horizontal>
              <Button
                title="primary Button"
                onPress={() => console.log('button pressed')}
              />
              <Button
                status="positive"
                title="positive Button"
                onPress={() => console.log('big button pressed')}
              />
              <Button
                status="negative"
                title="negative Button"
                onPress={() => console.log('big button pressed')}
              />
              <Button
                status="warning"
                title="warning Button"
                onPress={() => console.log('big button pressed')}
              />
            </Stack>
          </Large>
        </CodeBlockExample>
      </CodeBlock>

      <CodeBlock>
        <CodeBlockTitle title="Outline Button" />
        <CodeBlockExample>
          <Stack horizontal>
            <Button
              title="primary Button"
              outline
              onPress={() => console.log('button pressed')}
            />
            <Button
              status="positive"
              outline
              title="positive Button"
              onPress={() => console.log('big button pressed')}
            />
            <Button
              status="negative"
              outline
              title="negative Button"
              onPress={() => console.log('big button pressed')}
            />
            <Button
              status="warning"
              outline
              title="warning Button"
              onPress={() => console.log('big button pressed')}
            />
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
        <CodeBlockTitle title="Async button (loading spinner)" />
        <CodeBlockExample>
          <Stack horizontal>
            <Button
              title="submit"
              onPress={() => console.log('left button pressed')}
            >
              <Spinner style={{ position: 'absolute', alignSelf: 'center' }} />
            </Button>

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
          <Stack horizontal>
            <ButtonLink title="Button Link" to="/home" />
            <ButtonLink status="positive" title="Positive" to="/home" />
            <ButtonLink status="negative" title="Negative" to="/home" />
            <ButtonLink status="warning" title="Warning" to="/home" />
          </Stack>
          <Stack horizontal inline>
            <ButtonLink title="Button Link" to="/home" />
            <ButtonLink title="Button Link Active" to="/about" active />
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
