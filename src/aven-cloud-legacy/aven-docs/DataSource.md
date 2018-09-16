### Prerequisite DataSource

A data source is a simple class which you can use to store data and notify subscribers of changes.

```
import { DataSource, subscribe, Listen } from '@aven-cloud/data-source`

const myData = new DataSource({...initialData});

// presentation component:
const PersonView = ({personData}) => (
  <Text>{personData.name}</Text>
);

// subscribe to data source with HOC:
const Person = subscribe(PersonView, {
  personData: myData
});

// subscribe to data source with render prop:
const Person = () => (
  <Listen to={myData}>
    {myData => (
      <Text>{myData.name}</Text>
    )}
  </Listen>
);

// now render <Person /> and it will display the current myData
```

myData.setState({...mergeNewData});
myData.setState(lastData => ({...mergeNewData}));
