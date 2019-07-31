import { View, TouchableOpacity } from 'react-native';
import React from 'react';
import { useTheme } from '../dashboard/Theme';
import BaseText from '../dashboard/BaseText';

import BodyText from '../dashboard/BodyText';
import FormInput from '../components/BlockFormInput';
import { Responsive } from '../dashboard/Responsive';

//
export function LocationInputWithRef(
  {
    onSelectedResult,
    selectedResult,
    inputValue = '',
    style,
    responsiveStyle,
    breakpoints,
  },
  forwardedRef,
  ...rest
) {
  const theme = useTheme();
  const [inputText, setInputText] = React.useState(inputValue);
  const [results, setResults] = React.useState([]);
  console.log("TCL: results", results)
  // const type = 'city'; // or, address
  const ref = React.useRef({});
  const refs = React.useRef(results.map(i => React.createRef()));
  console.log("TCL: refs", refs)


  React.useEffect(() => {
    refs.current = results.map(i => React.createRef())
  }, [results])


  function queryResults() {
    clearTimeout(ref.current.fast);
    clearTimeout(ref.current.slow);
    const queryString = ref.current.lastQuery;
    const queryURL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${queryString}.json?access_token=pk.eyJ1IjoibWF0dGZpY2tlIiwiYSI6ImNqNnM2YmFoNzAwcTMzM214NTB1NHdwbnoifQ.Or19S7KmYPHW8YjRz82v6g&cachebuster=1561478159473&autocomplete=true&types=place&proximity=-118.0605468750104%2C33.95587146610272`; // has proximity bias to SoCal
    // const queryURL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${queryString}.json?access_token=pk.eyJ1IjoibWF0dGZpY2tlIiwiYSI6ImNqNnM2YmFoNzAwcTMzM214NTB1NHdwbnoifQ.Or19S7KmYPHW8YjRz82v6g&cachebuster=1561477994620&autocomplete=true&types=place`; // no proximity bias
    fetch(queryURL)
      .then(res => res.json())
      .then(resp => {
        if (!resp || !resp.features) {
          throw new Error('Bad resp');
        }
        setResults(resp.features);
      })
      .catch(console.error);
  }

  function handleTextInput(q) {
    ref.current.lastQuery = q;
    setInputText(q);
    clearTimeout(ref.current.fast);
    ref.current.fast = setTimeout(queryResults, 100);
    ref.current.slow = setTimeout(queryResults, 300);
  }

  return (
    <Responsive
      breakpoints={breakpoints}
      style={{
        marginBottom: [16, 0],
        ...responsiveStyle,
      }}
    >
      <View style={style} accessibilityRole="combobox">
        <FormInput
          onValue={handleTextInput}
          value={inputText}
          label="enter your city"
          ref={forwardedRef}
          aria-haspopup={true}
          accesible="true"
          accessibilityLabel="Location Input"
          aria-control="location-input-list"
        />
        {results && inputText !== '' ? (
          <React.Fragment>
            <BaseText
              accesible="true"
              accessibilityLiveRegion="polite"
              style={{
                width: 0,
                height: 0,
                opacity: 0, // vissually hidden
              }}
            >
              {results.length <= 0
                ? `Not showing results`
                : `showing ${results.length} results`}
            </BaseText>

            <View
              style={{
                margin: 8,
                marginTop: 0,
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
                borderWidth: 1,
                borderColor: theme.colors.border,
                overflow: 'hidden',
                ...theme.shadows.medium,
              }}
              id="location-input-list"
              accesible={true}
              accessibilityLabel="Results list"
              aria-expanded={!!results}
              tabIndex={0}
            >
              {results.map((result, index) => {
                const ref = refs.current[index];
                console.log("TCL: ref", ref)
                return (
                  <TouchableOpacity
                    key={result.id}
                    onPress={() => {
                      onSelectedResult(result);
                      setResults(null);
                      setInputText(result.place_name);
                    }}
                    accesible="true"
                    accessibilityLabel={result.place_name}
                    accessibilityRole="button"
                    ref={ref}
                  >
                    <View
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                      }}
                    >
                      <BodyText
                        bold
                        style={{
                          fontFamily: theme.fonts.bold,
                          color: theme.colors.primary,
                          marginBottom: 0,
                          lineHeight: 28,
                        }}
                      >
                        {result.text}
                      </BodyText>
                      <BaseText>
                        {result.context.map(c => c.text).join(', ')}
                      </BaseText>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </React.Fragment>
        ) : null}
      </View>
    </Responsive>
  );
}

export const LocationInput = React.forwardRef(LocationInputWithRef);
