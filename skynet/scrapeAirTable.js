import { getSecretConfig } from '../aven-web/config';
const Airtable = require('airtable');
const fs = require('fs-extra');
const pathJoin = require('path').join;
const path = require('path');
const crypto = require('crypto');

const wget = require('wget-improved');

const download = async (url, fileDest) => {
  await new Promise((resolve, reject) => {
    const dl = wget.download(url, fileDest, {});
    dl.on('error', err => {
      reject(err);
    });
    dl.on('start', fileSize => {
      // fileSize
    });
    dl.on('end', () => {
      resolve();
    });
  });
};

const destPath = pathJoin(process.cwd(), 'scrape-data');

const hash = input =>
  crypto
    .createHash('md5')
    .update(input)
    .digest('hex');

export default async function scrapeAirTable(fsClient) {
  console.log('scraping airtable...');
  const apiKey = getSecretConfig('AIRTABLE_API_KEY');
  const baseId = getSecretConfig('AIRTABLE_BASE_ID');

  const airtableBase = new Airtable({ apiKey }).base(baseId);

  const scrapeTable = tableName =>
    new Promise((resolve, reject) => {
      const recordResults = [];
      airtableBase(tableName)
        .select({
          view: 'Grid view',
        })
        .eachPage(
          (records, fetchNextPage) => {
            recordResults.push(records);
            fetchNextPage();
          },
          err => {
            if (err) {
              reject(err);
            } else {
              const records = recordResults.flat(1);
              const allRecords = {};
              records.forEach((record, recordIndex) => {
                allRecords[record.id] = {
                  ...record.fields,
                  id: record.id,
                  _index: recordIndex,
                };
              });
              resolve(allRecords);
            }
          },
        );
    });

  const extractFileURLs = tableData => {
    const fileURLs = new Set();
    Object.keys(tableData).forEach(tableName => {
      const table = tableData[tableName];
      Object.keys(table).forEach(id => {
        const row = table[id];
        Object.keys(row).forEach(fieldName => {
          const cellValue = row[fieldName];
          if (Array.isArray(cellValue)) {
            cellValue.forEach(cellValueItem => {
              if (
                cellValueItem &&
                typeof cellValueItem === 'object' &&
                cellValueItem.url
              ) {
                fileURLs.add(cellValueItem.url);
              }
            });
          }
        });
      });
    });
    return fileURLs;
  };

  const tableNames = [
    'KioskBlendMenu',
    'KioskFoodMenu',
    'Recipes',
    'BlendProfiles',
    'RecipeIngredients',
    'Ingredients',
    'Benefits',
    'Dietary',
    'PromoCodes',
    'KitchenSlots',
    'KitchenSystems',
    'KitchenSystemTags',
    'KitchenSystemFaults',
    'KitchenSystemAlarms',
    'IngredientCustomization',
    'Routing Schedule',
  ];
  const baseTables = {};
  await Promise.all(
    tableNames.map(async tableName => {
      baseTables[tableName] = await scrapeTable(tableName);
    }),
  );
  const baseFilesURLs = Array.from(extractFileURLs(baseTables));
  const baseFiles = {};
  baseFilesURLs.forEach(fileUrl => {
    const fileId = hash(fileUrl);
    const ext = path.extname(fileUrl);
    baseFiles[fileUrl] = `${fileId}${ext}`;
  });
  const base = { baseTables, baseFiles };
  const filesPath = pathJoin(destPath, 'files');
  const tablesPath = pathJoin(destPath, 'tables');
  await fs.remove(destPath);
  await fs.mkdirp(destPath);
  await fs.mkdirp(tablesPath);
  await fs.mkdirp(filesPath);
  await fs.writeFile(
    pathJoin(destPath, 'db.json'),
    JSON.stringify(base, null, 2),
  );

  await Promise.all(
    Object.keys(baseTables).map(async baseTable => {
      const tableData = baseTables[baseTable];
      const safeTableName = baseTable.replace(' ', '_');
      await fs.writeFile(
        pathJoin(tablesPath, safeTableName + '.json'),
        JSON.stringify(tableData, null, 2),
      );
    }),
  );
  await Promise.all(
    baseFilesURLs.map(async url => {
      const fileId = baseFiles[url];
      const fileDlPath = pathJoin(filesPath, fileId);
      if (!(await fs.exists(fileDlPath))) {
        await download(url, fileDlPath);
      }
    }),
  );
  console.log('scraped. uploading to cloud..', destPath);
  const folder = await fsClient.putFolder({
    folderPath: destPath,
    name: 'Airtable',
    domain: 'onofood.co',
  });
  // await fs.remove(destPath);
  console.log('scrape done.');
  return folder;
}
