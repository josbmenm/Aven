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

export const scrapeAirTable = async dataService => {
  const apiKey = getSecretConfig('AIRTABLE_API_KEY');
  const baseId = getSecretConfig('AIRTABLE_BASE_ID');

  const airtableBase = new Airtable({ apiKey }).base(baseId);

  const scrapeTable = tableName =>
    new Promise((resolve, reject) => {
      const allRecords = {};
      let index = 0;
      airtableBase(tableName)
        .select({
          // view: 'Grid view',
        })
        .eachPage(
          (records, fetchNextPage) => {
            records.forEach(record => {
              allRecords[record.id] = {
                id: record.id,
                ...record.fields,
                _index: index++,
              };
            });
            fetchNextPage();
          },
          err => {
            if (err) {
              reject(err);
            } else {
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
              if (typeof cellValueItem === 'object' && cellValueItem.url) {
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
    'Kiosk Menu',
    'Recipes',
    'Recipe Ingredients',
    'Ingredients',
    'Functions',
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
  console.log(destPath);
  await fs.mkdirp(destPath);
  await fs.mkdirp(filesPath);
  await fs.writeFile(
    pathJoin(destPath, 'db.json'),
    JSON.stringify(base, null, 2),
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

  const folder = await dataService.putFolder({
    folderPath: destPath,
    refName: 'airtable',
    domain: 'onofood.co',
  });
  await fs.remove(destPath);
  return folder;
};
