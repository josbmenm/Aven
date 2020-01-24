import React from 'react';
import { ScrollView, View } from 'react-native';
import Heading from '../dashboard/Heading';
import { Button, TextInput } from '../dash-ui';
import BodyText from '../dashboard/BodyText';
import { useCloud } from '../cloud-core/KiteReact';
import EmailExamples from '../emails/EmailExamples';

import { ColumnToRow, ColumnToRowChild } from '../dashboard/Responsive';

const EmailExampleList = Object.entries(EmailExamples);

export default function EmailsPlayground() {
  const cloud = useCloud();
  const [exampleName, setExampleName] = React.useState(null);
  const [params, setParams] = React.useState(null);
  const [results, setResults] = React.useState(null);
  const [recipientEmail, setRecipientEmail] = React.useState('');
  React.useEffect(() => {
    if (!exampleName || !params) return;
    cloud
      .dispatch({ type: 'TestEmail', templateName: exampleName, params })
      .then(setResults)
      .catch(err => {
        console.error('Email Generation Error', err);
      });
  }, [exampleName, params]);
  return (
    <ColumnToRow>
      <ColumnToRowChild style={{ padding: 30 }}>
        <Heading>Email Playground</Heading>
        <BodyText>First, select an email template to send:</BodyText>
        {EmailExampleList.map(([exName, exampleSpec]) => (
          <Button
            onPress={() => {
              setExampleName(exName);
            }}
            title={exName}
            type={exampleName === exName ? 'solid' : 'outline'}
            style={{ marginBottom: 24 }}
          />
        ))}
        {!!exampleName && (
          <React.Fragment>
            <BodyText style={{ marginTop: 50 }}>
              Next, choose a set of example params to use:
            </BodyText>
            {Object.keys(EmailExamples[exampleName].paramOptions).map(
              paramOptionName => {
                const exParams =
                  EmailExamples[exampleName].paramOptions[paramOptionName];
                return (
                  <Button
                    onPress={() => {
                      setParams(exParams);
                    }}
                    title={paramOptionName}
                    type={exParams === params ? 'solid' : 'outline'}
                    style={{ marginBottom: 24 }}
                  />
                );
              },
            )}
            {!!params && (
              <React.Fragment>
                <BodyText style={{ marginTop: 50 }}>
                  Review the results on the right, or send the example email to
                  Body yourself:
                </BodyText>
                <View style={{ flexDirection: 'row', marginBottom: 24 }}>
                  <TextInput
                    mode="email"
                    value={recipientEmail}
                    onValue={setRecipientEmail}
                  />
                </View>
                <Button
                  onPress={() => {
                    cloud
                      .dispatch({
                        type: 'TestEmail',
                        templateName: exampleName,
                        params,
                        recipient: recipientEmail,
                      })
                      .then(setResults)
                      .catch(err => {
                        console.error('Email Generation Error', err);
                      });
                  }}
                  title={'Send Example Email'}
                />
                {results && results.recipient && (
                  <BodyText style={{ marginTop: 50 }}>
                    Email sent to {results.recipient}
                  </BodyText>
                )}
              </React.Fragment>
            )}
          </React.Fragment>
        )}
      </ColumnToRowChild>
      <ColumnToRowChild style={{ padding: 30 }}>
        {results && (
          <React.Fragment>
            <Heading>{results.subject}</Heading>
            <BodyText>{results.bodyText}</BodyText>
            <hr />
            Body
            <ScrollView>
              <div dangerouslySetInnerHTML={{ __html: results.bodyHTML }} />
            </ScrollView>
          </React.Fragment>
        )}
      </ColumnToRowChild>
    </ColumnToRow>
  );
}
