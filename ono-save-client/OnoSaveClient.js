import SaveClient from '../save-client/SaveClient';
// import { getWatchable } from '../save-client/Watchable';
import { Buffer } from 'buffer';

const IS_DEV = process.env.NODE_ENV !== 'production';

const DEV_HOST = {
  useSSL: false,
  authority: 'localhost:3000',
};
const PROD_HOST = {
  authority: 'api.onofood.co',
};

const HOST = IS_DEV ? DEV_HOST : PROD_HOST;

export const Client = new SaveClient({
  host: HOST,
  domain: 'onofood.co',
});

// const watchAirtableData = getWatchable(null);

// const getAirtableData = async () => {
//   const atRef = Client.getRef('airtable');
//   await atRef.fetchObject();
//   const folderObj = atRef.getObjectValue();
//   const dbId = folderObj.value.files['db.json'].id;
//   const dbObj = Client.getRefObject('airtable', dbId);
//   await dbObj.fetch();
//   const atData = JSON.parse(Buffer.from(dbObj.getValue().value.data, 'hex'));
//   return atData;
// };
// getAirtableData()
//   .then(data => {
//     watchAirtableData.update(data);
//   })
//   .catch(console.error);

// export const AirtableData = watchAirtableData.watchable;
