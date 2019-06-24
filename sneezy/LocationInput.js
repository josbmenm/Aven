import { View, TouchableOpacity, Text } from 'react-native';
import React from 'react';
import { useTheme } from '../dashboard/Theme';
import BodyText from './BodyText';
import FootNote from './FootNote';
import FormInput from '../components/BlockFormInput';

//
export function LocationInput({
  onSelectedResult,
  selectedResult,
  inputValue = '',
  style,
}) {
  console.log('TCL: LocationInput -> selectedResult', selectedResult);
  const theme = useTheme();
  const [inputText, setInputText] = React.useState(inputValue);
  const [results, setResults] = React.useState(null);
  const ref = React.useRef({});
  function queryResults() {
    clearTimeout(ref.current.fast);
    clearTimeout(ref.current.slow);
    const queryString = ref.current.lastQuery;
    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${queryString}.json?access_token=pk.eyJ1IjoibWF0dGZpY2tlIiwiYSI6ImNqNnM2YmFoNzAwcTMzM214NTB1NHdwbnoifQ.Or19S7KmYPHW8YjRz82v6g&cachebuster=1558464828315&autocomplete=true&country=us&types=postcode%2Cneighborhood%2Cregion%2Cdistrict%2Clocality%2Cplace&proximity=-118.24641974855012%2C34.052861456951575&language=en`,
    )
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
    <View style={style}>
      <FormInput
        onValue={handleTextInput}
        value={inputText}
        label="Culver City, California"
      />
      {results ? (
        <View style={{
          margin: theme.space[2],
          marginTop: 0,
          borderBottomLeftRadius: theme.space[2],
          borderBottomRightRadius: theme.space[2],
          borderWidth: 1,
          borderColor: theme.colors.border,
          overflow: 'hidden',
          ...theme.shadows.medium
        }}>
          {results.map(result => {
            const isSelected =
              !!selectedResult && selectedResult.id === result.id;
            return (
              <TouchableOpacity
                key={result.id}
                onPress={() => {
                  onSelectedResult(result);
                  setResults(null);
                  setInputText(result.place_name);
                }}
              >
                <View
                  style={{
                    paddingVertical: theme.space[2],
                    paddingHorizontal: theme.space[4],
                  }}
                >
                  <BodyText
                    bold
                    style={{
                      fontFamily: theme.fontFamily.heading,
                      color: theme.colors.primary,
                      marginBottom: 0,
                      lineHeight: 28
                    }}
                  >
                    {result.text}
                  </BodyText>
                  <FootNote style={{ marginBottom: 0, lineHeight: 20 }}>
                    {result.context.map(c => c.text).join(', ')}
                  </FootNote>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
