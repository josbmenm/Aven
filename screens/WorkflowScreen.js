import React from 'react';
import { View, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { Button } from '../dash-ui';
import GenericPage from '../components/GenericPage';
import {
  Spinner,
  Heading,
  Stack,
  Text,
  useTheme,
  useKeyboardPopover,
  TextInput,
} from '../dash-ui';
import { useCloud, useCloudValue } from '../cloud-core/KiteReact';
import { useNavigation } from '../navigation-hooks/Hooks';
import useFocus from '../navigation-hooks/useFocus';
import AirtableImage from '../components/AirtableImage';
import cuid from 'cuid';
import HomeOrServiceModeButton from '../components/HomeOrServiceModeButton';
import KitchenCommandButton from '../components/KitchenCommandButton';
import ShortBlockFormPage from '../components/ShortBlockFormPage';
import { RefrigerationControl } from './KioskSettingsScreen';
import { VanPowerToggle } from './RestaurantStatusScreen';

function StepControl({ control }) {
  const theme = useTheme();
  let controlView = null;
  if (control === 'PutInServiceMode') {
    controlView = <HomeOrServiceModeButton />;
  } else if (control === 'HomeSystem') {
    controlView = (
      <KitchenCommandButton commandType="Home" title="home system" />
    );
  } else if (
    control === 'EnableRefrigeration' ||
    control === 'DisableRefrigeration'
  ) {
    controlView = <RefrigerationControl />;
  } else if (control === 'EnableVanPower' || control === 'DisableVanPower') {
    controlView = <VanPowerToggle />;
  }
  return (
    <View
      style={{
        borderWidth: 1,
        padding: 30,
        marginVertical: 10,
        borderWidth: 2,
        borderRadius: 12,
        borderColor: theme.colorPrimary,
      }}
    >
      <Text theme={{}}>{control}</Text>
      {controlView}
    </View>
  );
}

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
      {step.Controls && <StepControl control={step.Controls} />}
      <Text theme={{ fontSize: 36 }}>{step.Description}</Text>
    </View>
  );
}

function CollectFlagPopover({ onFlag, submissionLabel, onClose }) {
  const [flag, setFlag] = React.useState('');
  function handleSubmit() {
    onFlag(flag);
    onClose();
  }
  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers: [
      inputProps => (
        <View>
          <TextInput
            {...inputProps}
            label="What is going wrong?"
            onValue={setFlag}
            value={flag}
          />
        </View>
      ),
    ],
  });
  return (
    <View style={{ flex: 1, just: 'center', alignItems: 'center' }}>
      <View style={{ maxWidth: 500 }}>
        {inputs}
        <Button title={submissionLabel} onPress={handleSubmit} />
      </View>
    </View>
  );
}

function OperatorNameForm({ onName, procedureKey, ...props }) {
  const [name, setName] = React.useState('');
  function handleSubmit() {
    onName(name);
  }
  const { inputs } = useFocus({
    onSubmit: handleSubmit,
    inputRenderers: [
      inputProps => (
        <View>
          <TextInput
            {...inputProps}
            label="Your Name"
            onValue={setName}
            value={name}
          />
        </View>
      ),
    ],
  });

  return (
    <ShortBlockFormPage {...props} background={false}>
      <View
        style={{
          maxWidth: 500,
          flex: 1,
          alignSelf: 'center',
          justifyContent: 'center',
        }}
      >
        <Heading
          center
          title={`🚥 ${procedureKey} Operator name 👤`}
          theme={{ headingFontSize: 32 }}
        />
        {inputs}
        <Button title="submit" onPress={handleSubmit} />
      </View>
    </ShortBlockFormPage>
  );
}
export default function Workflow({ ...props }) {
  const theme = useTheme();
  const cloud = useCloud();
  const [workflowInstance] = React.useState(cuid());
  const [workflowStartTime] = React.useState(new Date().getTime());
  const [lastActivityTime, setLastActivityTime] = React.useState(
    new Date().getTime(),
  );
  const [stepId, setStepId] = React.useState(null);
  const [operatorName, setOperatorName] = React.useState(null);
  const companyConfig = useCloudValue('CompanyConfig');
  const { getParam, goBack } = useNavigation();
  const procedureKey = getParam('key');
  const flagsRef = React.useRef([]);
  const [isComplete, setIsComplete] = React.useState(false);
  const [isAborted, setIsAborted] = React.useState(false);

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

  const activeStep = allSteps && (stepId ? allSteps[stepId] : theseSteps[0]);

  function sendReport(report) {
    cloud.dispatch({ type: 'WorkflowReport', report });
  }

  React.useEffect(() => {
    operatorName &&
      sendReport({
        type: 'WorkflowStart',
        workflowStartTime,
        workflowInstance,
        procedureType: procedureKey,
        operatorName,
      });
  }, [operatorName]);

  function stepForward(flagNote) {
    if (activeStep) {
      const { Description, Name, id } = activeStep;
      const indexOfLastStep = theseSteps.indexOf(activeStep);
      const nextStep = theseSteps[indexOfLastStep + 1];
      const completionTime = new Date().getTime();
      if (flagNote) {
        flagsRef.current.push({
          flagNote,
          time: completionTime,
          workflowInstance,
          procedureType: procedureKey,
          stepName: Name,
          stepDescription: Description,
          stepId: id,
        });
      }
      sendReport({
        type: 'StepComplete',
        completionTime,
        workflowStartTime,
        duration: completionTime - lastActivityTime,
        workflowInstance,
        procedureType: procedureKey,
        stepName: Name,
        stepDescription: Description,
        stepId: id,
        isFlagged: !!flagNote,
        flagNote,
        operatorName,
      });
      if (!nextStep) {
        sendReport({
          type: 'WorkflowComplete',
          completionTime,
          workflowStartTime,
          workflowInstance,
          duration: completionTime - workflowStartTime,
          procedureType: procedureKey,
          isFlagged: !!flagsRef.current.length,
          flags: flagsRef.current,
          operatorName,
        });
        // todo: clean everything up. for now the user is stuck and has to go back to re-mount this component
        setIsComplete(true);
        return;
      } else {
        // to the next step!
        setStepId(nextStep.id);
        setLastActivityTime(completionTime);
      }
    }
  }

  function stepAbort(abortNote) {
    const abortTime = new Date().getTime();
    // todo: clean everything up. for now the user is stuck and has to go back to re-mount this component
    sendReport({
      type: 'WorkflowAbort',
      workflowStartTime,
      workflowInstance,
      abortTime,
      duration: abortTime - workflowStartTime,
      procedureType: procedureKey,
      abortNote,
      isFlagged: !!flagsRef.current.length,
      flags: flagsRef.current,
      operatorName,
    });
    setIsAborted(true);
  }

  if (!operatorName) {
    return (
      <OperatorNameForm
        procedureKey={procedureKey}
        onName={setOperatorName}
        {...props}
      />
    );
  }

  if (!theseSteps) {
    return (
      <GenericPage
        title={procedureKey}
        icon="🚥"
        {...props}
        hideBackButton
        disableScrollView
        contentContainerStyle={{ flex: 1, alignItems: 'center' }}
      >
        <Spinner />
      </GenericPage>
    );
  }

  if (isAborted) {
    return (
      <GenericPage
        title={procedureKey}
        icon="🚥"
        {...props}
        hideBackButton
        disableScrollView
        contentContainerStyle={{ flex: 1, alignItems: 'center' }}
      >
        <Heading
          center
          title={`🚥 ${procedureKey} aborted! 🚨`}
          theme={{ headingFontSize: 32 }}
        />
        <Button title="close" outline onPress={() => goBack()} />
      </GenericPage>
    );
  }

  if (isComplete) {
    return (
      <GenericPage
        title={procedureKey}
        icon="🚥"
        hideBackButton
        disableScrollView
        {...props}
        contentContainerStyle={{ flex: 1, alignItems: 'center' }}
      >
        <Heading
          center
          title={`🚥 ${procedureKey} complete! 🎉`}
          theme={{ headingFontSize: 32 }}
        />
        <Button title="close" outline onPress={() => goBack()} />
      </GenericPage>
    );
  }

  const { onPopover: onFlagForward } = useKeyboardPopover(({ onClose }) => (
    <CollectFlagPopover
      onClose={onClose}
      onFlag={stepForward}
      submissionLabel="flag and go forward"
    />
  ));
  const { onPopover: onAbort } = useKeyboardPopover(({ onClose }) => (
    <CollectFlagPopover
      onClose={onClose}
      onFlag={stepAbort}
      submissionLabel="abort workflow"
    />
  ));
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
            onPress={onAbort}
          />
          <Button
            title="continue with flag."
            theme={{ colorPrimary: theme.colorWarning }}
            onPress={onFlagForward}
          />
          <Button
            title="step complete."
            theme={{ colorPrimary: theme.colorPositive }}
            onPress={() => stepForward()}
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
