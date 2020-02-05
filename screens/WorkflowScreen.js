import React, { useEffect } from 'react';
import { View, AlertIOS } from 'react-native';
import { Easing } from 'react-native-reanimated';
import { Button } from '../dash-ui';
import RootAuthenticationSection from './RootAuthenticationSection';
import RowSection from '../components/RowSection';
import TextRow from '../components/TextRow';
import GenericPage from '../components/GenericPage';
import Row from '../components/Row';
import { Spinner, Spacing, Heading, Stack, Text, useTheme } from '../dash-ui';
import { useCloud, useCloudValue } from '../cloud-core/KiteReact';
import useKeyboardPopover from '../components/useKeyboardPopover';
import useAsyncError from '../react-utils/useAsyncError';
import useFocus from '../navigation-hooks/useFocus';
import { useNavigation } from '../navigation-hooks/Hooks';
import AirtableImage from '../components/AirtableImage';

function ActiveStepDisplay({ step }) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, marginBottom: 20 }}>
      <Heading
        center
        title={step.Name}
        theme={{ colorPrimary: theme.colorForeground }}
      />
      {step.Photo && (
        <AirtableImage
          image={step.Photo}
          style={{ resizeMode: 'contain', flex: 1, alignSelf: 'stretch' }}
        />
      )}
      <Text theme={{ fontSize: 36 }}>{step.Description}</Text>
    </View>
  );
}

export default function Workflow({ ...props }) {
  const theme = useTheme();
  const [stepId, setStepId] = React.useState(null);
  const companyConfig = useCloudValue('CompanyConfig');
  const { getParam, goBack } = useNavigation();
  const procedureKey = getParam('key');

  const allSteps = companyConfig && companyConfig.baseTables.ProcedureSteps;
  const theseSteps =
    allSteps &&
    Object.values(allSteps).filter(step => {
      return step.Procedure === procedureKey;
    });
  theseSteps &&
    theseSteps.sort((a, b) => {
      return a._index - b._index;
    });

  console.log('CompanyConfig', theseSteps);
  // if (!companyConfig || !companyConfig.baseTables.ProcedureSteps) {
  if (!theseSteps) {
    // return (
    //   <View style={{ alignItems: 'center', marginTop: 100 }}>
    //
    //   </View>
    // );
    // const { getParam } = useNavigation();
    // const procedureKey = getParam('key');
    return (
      <GenericPage
        title={procedureKey}
        icon="🚥"
        {...props}
        contentContainerStyle={{ flex: 1, alignItems: 'center' }}
      >
        <Spinner />
      </GenericPage>
    );
  }
  const activeStep = stepId ? allSteps[stepId] : theseSteps[0];
  console.log({ activeStep, allSteps, theseSteps, stepId });

  return (
    <GenericPage
      title={procedureKey}
      icon="🚥"
      {...props}
      hideBackButton
      contentContainerStyle={{ flex: 1 }}
      afterScrollView={
        <Stack horizontal>
          <Button
            title="abort."
            theme={{ colorPrimary: theme.colorNegative }}
            onPress={() => {
              goBack();
            }}
          />
          <Button
            title="continue with flag."
            theme={{ colorPrimary: theme.colorWarning }}
            onPress={() => {}}
          />
          <Button
            title="step complete."
            theme={{ colorPrimary: theme.colorPositive }}
            onPress={() => {
              if (activeStep) {
                const indexOfLastStep = theseSteps.indexOf(activeStep);
                const nextStep = theseSteps[indexOfLastStep + 1];
                setStepId(nextStep.id);
              }
            }}
          />
        </Stack>
      }
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 30,
          alignSelf: 'stretch',
        }}
      >
        <Heading
          title={`🚥 ${procedureKey} workflow`}
          theme={{ headingFontSize: 32 }}
        />
        {activeStep && <ActiveStepDisplay step={activeStep} />}
      </View>
    </GenericPage>
  );
}

Workflow.navigationOptions = GenericPage.navigationOptions;
