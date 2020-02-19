import React from 'react';
import { Text, View } from '@rn';

let JSONView;
JSONView = ({ data }) => {
  let type = typeof data;
  if (Array.isArray(data)) {
    type = 'array';
  } else if (data === null || data === undefined) {
    type = 'null';
  }
  switch (type) {
    case 'null':
      return <Text>Empty</Text>;
    case 'number':
    case 'string':
    case 'boolean':
      return <Text>{JSON.stringify(data)}</Text>;
    case 'array':
      return (
        <View style={{ borderWidth: 1, borderRadius: 5, borderColor: '#ccf' }}>
          {data.map((item, index) => (
            <JSONView data={item} key={index} />
          ))}
        </View>
      );
    case 'function':
      return <Text>Function.. warning: this isn't JSON!</Text>;
    case 'object':
      return (
        <View style={{ borderWidth: 1, borderRadius: 5, borderColor: '#ccc' }}>
          {Object.keys(data)
            .sort()
            .map(itemName => (
              <View
                style={{ flexDirection: 'row', marginVertical: 5 }}
                key={itemName}
              >
                <View style={{ width: 200, padding: 10 }}>
                  <Text style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    {itemName}
                  </Text>
                </View>
                <View
                  style={{ padding: 10, backgroundColor: '#fff9', flex: 1 }}
                >
                  <JSONView data={data[itemName]} />
                </View>
              </View>
            ))}
        </View>
      );
    default: {
      debugger; // uhh..
      return null;
    }
  }
};

export default JSONView;
