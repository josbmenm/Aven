export default async function validatePromoCode(cloud, { promoCode }) {
  const atDoc = cloud.get('Airtable').expand((folder, doc) => {
    if (!folder) {
      return null;
    }
    return doc.getBlock(folder.files['db.json']);
  });

  await atDoc.fetchValue();

  const atData = atDoc.getValue();
  const { PromoCodes } = atData.baseTables;
  console.log('why not', PromoCodes, promoCode);

  return null;
}
