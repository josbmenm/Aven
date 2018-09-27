import SaveClient from '../save-client/SaveClient';
import { getWatchable } from '../save-client/Watchable';
import { Buffer } from 'buffer';

const HOST = 'https://api.onofood.co';
// const HOST = 'http://localhost:3000';

export const Client = SaveClient.createDataClient({
  host: HOST,
  domain: 'onofood.co',
});

const watchAirtableData = getWatchable(null);

const getAirtableData = async () => {
  const atRef = Client.getRef('airtable');
  await atRef.fetchObject();
  const folderObj = atRef.getObjectValue();
  const dbId = folderObj.value.files['db.json'].id;
  const dbObj = Client.getRefObject('airtable', dbId);
  await dbObj.fetch();
  const atData = JSON.parse(Buffer.from(dbObj.getValue().value.data, 'hex'));
  return atData;
};
getAirtableData()
  .then(data => {
    watchAirtableData.update(data);
  })
  .catch(console.error);

export const AirtableData = watchAirtableData.watchable;
