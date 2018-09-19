const Airtable = require('airtable');
const fs = require('fs-extra');
const pathJoin = require('path').join;
const crypto = require('crypto');

const wget = require('wget-improved');

const download = async (url, fileDest) => {
  await new Promise((resolve, reject) => {
    const dl = wget.download(url, fileDest, {});
    dl.on('error', err => {
      reject(err);
    });
    dl.on('start', fileSize => {
      console.log('dl started', fileSize);
    });
    dl.on('end', () => {
      resolve();
    });
  });
};
const hash = input =>
  crypto
    .createHash('md5')
    .update(input)
    .digest('hex');

export const scrapeAirTable = async (apiKey, baseId, tableNames, destPath) => {
  console.log('erm', apiKey, baseId, destPath);
  const airtableBase = new Airtable({ apiKey }).base(baseId);

  const scrapeTable = tableName =>
    new Promise((resolve, reject) => {
      const allRecords = {};
      airtableBase(tableName)
        .select({
          // view: 'Grid view',
        })
        .eachPage(
          (records, fetchNextPage) => {
            records.forEach(record => {
              allRecords[record.id] = { id: record.id, ...record.fields };
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
    baseFiles[fileUrl] = fileId;
  });
  const base = { baseTables, baseFiles };
  const filesPath = pathJoin(destPath, 'files');
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
  return { success: 42 };
};
