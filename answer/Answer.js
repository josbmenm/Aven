import fs from 'fs-extra';
import cuid from 'cuid';

const BACKUP_DIR = process.env.ONO_BACKUP_DIR;

if (!BACKUP_DIR) {
  throw new Error('Set env ONO_BACKUP_DIR');
}

const question = process.env.Q;

async function queryOrders() {
  const listing = await fs.readdir(`${BACKUP_DIR}/docs`);
  const latestDocFile = listing[listing.length - 1];
  const docFileData = await fs.readFile(`${BACKUP_DIR}/docs/${latestDocFile}`);
  const docFile = JSON.parse(docFileData);
  const lastCompanyActivityBlockId = docFile.children.CompanyActivity.id;

  const evtSamples = {};
  const daily = {};

  let activityBlockId = lastCompanyActivityBlockId;

  while (activityBlockId) {
    console.log('processing ' + activityBlockId);
    const activityBlockData = await fs.readFile(
      `${BACKUP_DIR}/blocks/${activityBlockId}.json`,
    );
    const activityBlock = JSON.parse(activityBlockData);
    const activityEvent = activityBlock.value;
    const eventTimeData =
      activityEvent.time ||
      (activityEvent.confirmedOrder &&
        activityEvent.confirmedOrder.confirmedTime) ||
      null;
    const eventTime = eventTimeData && new Date(eventTimeData);
    const eventDayName =
      eventTime === null
        ? 'unknown'
        : `${eventTime.getFullYear()}-${eventTime.getMonth() +
            1}-${eventTime.getDate()}`;
    const evtType = activityEvent.type;

    const day = daily[eventDayName] || (daily[eventDayName] = {});

    day.orders = day.orders || [];
    day.evtTypeCounts = day.evtTypeCounts || {};
    day.orderCount = day.orderCount || 0;
    day.paidOrderCount = day.paidOrderCount || 0;
    day.totalSum = day.totalSum || 0;
    day.subTotalSum = day.subTotalSum || 0;
    day.discountTotalSum = day.discountTotalSum || 0;

    if (
      evtType === 'KioskOrder' &&
      activityEvent.confirmedOrder.confirmedTime
    ) {
      const { orderName, stripeIntent } = activityEvent.confirmedOrder;
      const charge = stripeIntent && stripeIntent.charges.data[0];
      const cardFingerprint =
        charge && charge.payment_method_details.card_present.fingerprint;
      day.orderCount += 1;
      if (cardFingerprint) {
        day.paidOrderCount += 1;
      }
      day.orders.push({
        time: new Date(
          activityEvent.confirmedOrder.confirmedTime,
        ).toISOString(),
        total: activityEvent.confirmedOrder.total / 100,
        subTotal: activityEvent.confirmedOrder.subTotal / 100,
        cardFingerprint,
        name: `${orderName.firstName} ${orderName.lastName}`,
      });
      day.totalSum += activityEvent.confirmedOrder.total / 100;
      day.subTotalSum += activityEvent.confirmedOrder.subTotal / 100;
      day.discountTotalSum += activityEvent.confirmedOrder.discountTotal / 100;
    }

    day.evtTypeCounts[evtType] = day.evtTypeCounts[evtType]
      ? day.evtTypeCounts[evtType] + 1
      : 1;

    evtSamples[evtType] = activityEvent;

    activityBlockId = (activityBlock.on && activityBlock.on.id) || null;
  }

  console.log(
    JSON.stringify(
      daily['2019-9-22'],
      // evtSamples,
      null,
      2,
    ),
  );
}
async function dbFileExport() {
  const listing = await fs.readdir(`${BACKUP_DIR}/blocks`);
  let examineBlockFile = false;
  while ((examineBlockFile = listing.shift())) {
    const blockData = await fs.readFile(
      `${BACKUP_DIR}/blocks/${examineBlockFile}`,
      { encoding: 'utf8' },
    );
    const block = JSON.parse(blockData);
    if (block.type === 'BinaryFileHex') {
      const binaryData = Buffer.from(block.data, 'hex');
      const destFile = `${BACKUP_DIR}/files/${
        examineBlockFile.split('.')[0]
      }.png`;
      fs.writeFile(destFile, binaryData);
      console.log('Writing ' + destFile);
    }
  }
}

if (question === 'Orders') {
  queryOrders()
    .then(() => {
      console.log('Done.');
    })
    .catch(e => {
      console.error(e);
    });
}

if (question === 'DbFileExport') {
  dbFileExport()
    .then(() => {
      console.log('Done.');
    })
    .catch(e => {
      console.error(e);
    });
}
