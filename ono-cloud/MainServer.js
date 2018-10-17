import App from './App';
import WebServer from '../aven-web/WebServer';
import { getSecretConfig, IS_DEV } from '../aven-web/config';
import { scrapeAirTable } from './scrapeAirTable';
import PostgresDataSource from '../aven-data-source-postgres/PostgresDataSource';
import startDataService from '../aven-data-server/startDataService';
import { getMobileAuthToken } from './Square';
const fs = require('fs-extra');
const pathJoin = require('path').join;

const AirtableAPIKey = getSecretConfig('AIRTABLE_API_KEY');
const AirtableBaseID = getSecretConfig('AIRTABLE_BASE_ID');

const scrapeLocation = pathJoin(process.cwd(), 'scrape-data');

const runServer = async () => {
  const domain = 'onofood.co';
  console.log('☁️ Starting Cloud 💨');
  const pgConfig = {
    user: getSecretConfig('SQL_USER'),
    password: getSecretConfig('SQL_PASSWORD'),
    database: getSecretConfig('SQL_DATABASE'),
  };

  if (getSecretConfig('SQL_INSTANCE_CONNECTION_NAME') && !IS_DEV) {
    pgConfig.host = `/cloudsql/${getSecretConfig(
      'SQL_INSTANCE_CONNECTION_NAME',
    )}`;
  } else if (getSecretConfig('SQL_HOST')) {
    pgConfig.host = getSecretConfig('SQL_HOST');
  }
  const dataSource = new PostgresDataSource(pgConfig);
  const saveService = await startDataService({ pgConfig, rootDomain: domain });

  console.log('☁️ Data Server Ready 💼');

  const scrapeUpstream = async action => {
    await fs.remove(scrapeLocation);
    await scrapeAirTable(
      AirtableAPIKey,
      AirtableBaseID,
      [
        'Kiosk Menu',
        'Recipes',
        'Recipe Ingredients',
        'Ingredients',
        'Functions',
      ],
      scrapeLocation,
    );
    const folder = await saveService.putFolder({
      folderPath: scrapeLocation,
      refName: 'airtable',
      domain: 'onofood.co',
    });
    return folder;
  };

  const dispatch = async action => {
    switch (action.type) {
      case 'getSquareMobileAuthToken':
        return getMobileAuthToken(action);
      case 'scrapeUpstream':
        return scrapeUpstream(action);
      default:
        return await saveService.dispatch(action);
    }
  };
  const webService = await WebServer(
    App,
    dispatch,
    saveService.startSocketServer,
  );
  console.log('☁️️ Web Ready 🕸');

  return {
    close: async () => {
      await webService.close();
      await saveService.close();
    },
  };
};

export default runServer;
