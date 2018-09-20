import App from './App';
import WebServer from '../infra/WebServer';
import { getSecretConfig } from './config';
import { scrapeAirTable } from './scrapeAirTable';
import { startService as startDBService } from '../db/dbService';
const fs = require('fs-extra');
const pathJoin = require('path').join;

const AirtableAPIKey = getSecretConfig('AIRTABLE_API_KEY');
const AirtableBaseID = getSecretConfig('AIRTABLE_BASE_ID');

const scrapeLocation = pathJoin(process.cwd(), 'scrape-data');

const uploadFile = async (filePath, refName, dbService) => {
  const fileData = await fs.readFile(filePath);
  const objectId = await dbService.actions.putObject({
    object: {
      data: fileData.toString('hex'),
    },
  });
  return objectId;
};

const uploadFolder = async (folderPath, refName, dbService) => {
  const filesInDir = await fs.readdir(folderPath);
  const fileList = await Promise.all(
    filesInDir.map(async fileName => {
      const filePath = pathJoin(folderPath, fileName);
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        return await uploadFolder(filePath, refName, dbService);
      } else {
        return await uploadFile(filePath, refName, dbService);
      }
    }),
  );
  const files = {};
  filesInDir.forEach((fileName, index) => {
    files[fileName] = fileList[index];
  });
  const objectId = await dbService.actions.putObject({ object: { files } });
  return objectId;
};

const putFolder = async ({ domain, folderPath, refName, dbService }) => {
  const folder = await uploadFolder(folderPath, refName, dbService);
  await dbService.actions.putRef({
    owner: null,
    domain,
    objectId: folder.id,
    ref: refName,
  });
  return folder;
};

const runServer = async () => {
  const domain = 'onofood.co';
  const dbService = await startDBService({});

  const scrapeUpstream = async action => {
    await fs.remove(scrapeLocation);
    await scrapeAirTable(
      AirtableAPIKey,
      AirtableBaseID,
      ['Kiosk Menu', 'Recipes', 'Recipe Ingredients', 'Ingredients'],
      scrapeLocation,
    );
    const folder = await putFolder({
      folderPath: scrapeLocation,
      refName: 'airtable',
      dbService,
      domain: 'onofood.co',
    });
    return folder;
  };

  const getObject = async action => {
    return await dbService.actions.getObject({ id: action.id });
  };

  const getRef = async action => {
    return await dbService.actions.getRef({ ref: action.ref, domain });
  };

  const dispatch = async action => {
    switch (action.type) {
      case 'scrapeUpstream':
        return scrapeUpstream(action);
      case 'getObject':
        return getObject(action);
      case 'getRef':
        return getRef(action);
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
