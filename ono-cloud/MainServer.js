import App from './App';
import WebServer from '../infra/WebServer';
import { getSecretConfig } from './config';
import { scrapeAirTable } from './scrapeAirTable';
import { startService as startDBService } from '../db/dbService';
const pathJoin = require('path').join;

const AirtableAPIKey = getSecretConfig('AIRTABLE_API_KEY');
const AirtableBaseID = getSecretConfig('AIRTABLE_BASE_ID');

const scrapeLocation = pathJoin(process.cwd(), 'scrape-data');

const uploadFolderData = async (folderPath, refName, dbService) => {
  await dbService.actions.putRefObject({ domain, ref, object, owner, d });
};

const scrapeUpstream = async action => {
  await scrapeAirTable(
    AirtableAPIKey,
    AirtableBaseID,
    ['Kiosk Menu', 'Recipes', 'Recipe Ingredients', 'Ingredients'],
    scrapeLocation,
  );
  console.log('scraped to', scrapeLocation);
  return { great: 'news' };
};

const runServer = async () => {
  const dbService = await startDBService({
    // user: getSecretConfig('PG_USER'),
    // host: getSecretConfig('PG_HOST'),
    // password: getSecretConfig('PG_PASS'),
    // database: getSecretConfig('PG_DB'),
    // // port,
    // ssl: true,
  });

  const dispatch = async action => {
    if (dbService.actions[action.type]) {
      return await dbService.actions[action.type](action);
    }

    switch (action.type) {
      case 'scrapeUpstream':
        return scrapeUpstream(action);
      default:
        throw `Unknown action type "${action.type}"`;
    }
  };

  const webService = await WebServer(App, dispatch);

  return {
    close: async () => {
      await webService.close();
      await dbService.close();
    },
  };
};

export default runServer;
