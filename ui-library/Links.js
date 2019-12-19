import React from 'react';
import { CodeBlock, CodeBlockExample, CodeBlockTitle } from './CodeBlock';
import Text from '../dash-ui/Text';
import { Large } from '../dash-ui/Theme';
import Stack from '../dash-ui/Stack';

import Link from '../dash-ui/Link';
import { ComponentBlock } from './Layout';

export default function Links() {
  return (
    <ComponentBlock title="Link">
      <CodeBlock>
        <CodeBlockTitle title="Links" />
        <CodeBlockExample>
          <Stack inline>
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
