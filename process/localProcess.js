const fs = require('fs-extra');
const readline = require('readline');

const filterStartDate = '2019-09-22T07:00:00.000Z';
const filterEndDate = '2019-09-23T06:59:59.999Z';

const filterStart = Date.parse(filterStartDate);
const filterEnd = Date.parse(filterEndDate);

async function localProcess() {
  const logFiles = await fs.readdir('/home/ono/.pm2/logs');
  const logFileSummary = await Promise.all(
    logFiles.map(async logFileName => {
      const logFilePath = `/home/ono/.pm2/logs/${logFileName}`;
      let lineCount = 0;
      let jsonLineCount = 0;
      let eventCount = 0;
      let seenEvents = new Set();
      let seenActions = new Set();
      let seenFields = new Set();
      let lastDate = null;
      let firstDate = null;
      await new Promise(resolve => {
        const readInterface = readline.createInterface({
          input: fs.createReadStream(logFilePath),
          // output: process.stdout,
          console: false,
        });
        readInterface.on('line', line => {
          lineCount += 1;

          try {
            const json = JSON.parse(line);
            jsonLineCount += 1;

            const date = Date.parse(json['@timestamp']);
            if (!date) return;
            if (date > filterEnd) return;
            if (date < filterStart) return;

            eventCount += 1;

            if (!lastDate || date > lastDate) {
              lastDate = date;
            }
            if (!firstDate || date < firstDate) {
              firstDate = date;
            }

            seenEvents.add(json['@message']);

            const { action } = json;
            if (action && action.type && action.type === 'PutDocValue') {
              console.log(json);
            }
            action && action.type && seenActions.add(action.type);

            if (json['@message'] === 'DispatchedAction') {
              Object.keys(json).forEach(k => seenFields.add(k));
              Object.keys(json['@fields']).forEach(k =>
                seenFields.add('@fields/' + k),
              );
            }
          } catch (e) {}
          // if (/* done */) {
          //   return false; // stop reading
          // }
        });
        readInterface.on('close', () => {
          resolve();
        });
      });

      const stat = await fs.stat(logFilePath);
      return {
        name: logFileName,
        size: stat.size,
        eventCount,
        lineCount,
        jsonLineCount,
        seenEvents: [...seenEvents],
        seenFields: [...seenFields],
        seenActions: [...seenActions],
        lastDate: lastDate && new Date(lastDate).toISOString(),
        firstDate: firstDate && new Date(firstDate).toISOString(),
      };
    }),
  );
  console.log(logFileSummary);
}

localProcess()
  .then(() => {
    console.log('Done local.');
  })
  .catch(e => {
    console.error(e);
  });
