import defineCloudFunction from '../cloud-core/defineCloudFunction';

function atDataExpander(folder, doc) {
  if (!folder) {
    return null;
  }
  return doc.getBlock(folder.files['db.json']);
}
const CompanyConfig = defineCloudFunction(
  'CompanyConfig',
  (docState, doc, cloud, getValue) => {
    const atDataDoc = cloud.get('Airtable').expand(atDataExpander);
    const atData = getValue(atDataDoc);

    if (!atData) {
      return null;
    }

    return atData;
  },
  'a',
);

export default CompanyConfig;
