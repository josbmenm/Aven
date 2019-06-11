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

  let atPromoCode = null;
  Object.keys(PromoCodes).find(promoId => {
    const promo = PromoCodes[promoId];
    if (promo['Promo Code'] !== promoCode) {
      // wrong code
      return false;
    }
    if (new Date(promo['Start Date']) > Date.now()) {
      // promo not started yet
      return false;
    }
    if (new Date(promo['End Date']) < Date.now()) {
      // promo ended already
      return false;
    }
    atPromoCode = {
      promoCode,
      type: 'FreeBlends',
      count: promo['Free Blends'],
      context: {
        type: 'Seasonal',
        id: promoId,
      },
    };
    return true;
  });
  if (atPromoCode) {
    return atPromoCode;
  }

  const promoDoc = cloud.get(`PromoCodes/${promoCode}`);

  await promoDoc.fetchValue();

  const promoValue = promoDoc.getValue();

  if (promoValue && promoValue.usedForOrder == null) {
    return promoValue;
  }

  return null;
}
