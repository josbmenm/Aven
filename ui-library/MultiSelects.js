import React from 'react';
import { CodeBlock, CodeBlockExample, CodeBlockTitle } from './CodeBlock';
import { ComponentBlock } from './Layout';
import MultiSelect from '../dash-ui/MultiSelect';
import Stack from '../dash-ui/Stack';

export default function MultiSelects() {
  return (
    <ComponentBlock title="MultiSelect">
      <CodeBlock>
        <CodeBlockTitle title="Stack" />
        <CodeBlockExample>
          <Stack inline>
            <MultiSelect
              value={'deliver'}
              onValue={v => console.log('onValue => ', v)}
              options={[
                { name: 'deliver', value: 'deliver' },
                { name: 'drop in trash', value: 'ditch' },
                { name: 'drop after filling', value: 'drop' },
              ]}
            />
            <MultiSelect
              value={false}
              onValue={v => console.log('onValue => ', v)}
              options={[
                { name: 'blend', value: false },
                { name: 'skip blend', value: true },
              ]}
            />
          </Stack>
        </CodeBlockExample>
      </CodeBlock>
    </ComponentBlock>
  );
}
