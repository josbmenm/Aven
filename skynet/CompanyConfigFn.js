import defineCloudFunction from '../cloud-core/defineCloudFunction';

const CompanyConfig = defineCloudFunction(
  'CompanyConfig',
  (docState, doc, cloud, getValue) => {
    const atDataDoc = cloud.get('Airtable').expand((folder, doc) => {
      if (!folder) {
        return null;
      }
      return doc.getBlock(folder.files['db.json']);
    });
    const atData = getValue(atDataDoc);

    if (!atData) {
      return null;
    }

    return { atData };
  },
  'a',
);

export default CompanyConfig;
