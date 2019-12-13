import React from 'react';
import { View } from 'react-native';
import Heading from './composite/Heading';
import { CodeBlock, CodeBlockExample, CodeBlockTitle } from './CodeBlock';
import Text from './literals/Text';
import { Large, Spacing } from './Theme';
import Stack from './layout/Stack';

import Link from './literals/Link';
import { ComponentBlock } from './Layout';

function Links() {
  return (
    <ComponentBlock title="Link">
      <CodeBlock>
        <CodeBlockTitle title="Links" />
        <CodeBlockExample>
          <Stack>
            <Link to="/home">a link</Link>
            <Large>
              <Link to="/home">a bigger link</Link>
            </Large>

            <Text>
              another example of a <Link to="/about/">another link</Link> inside
              a text block
            </Text>
          </Stack>
        </CodeBlockExample>
      </CodeBlock>
    </ComponentBlock>
  );
}

Links.navigationOptions = {
  title: 'Links',
};

export default Links;
