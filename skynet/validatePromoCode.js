export default async function validatePromoCode(cloud, { promoCode }) {
  const companyConfigState = await cloud.get('CompanyConfig').idAndValue.load();
  const { baseTables } = companyConfigState.value;
  const { PromoCodes } = baseTables;

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

  const promoValue = await promoDoc.value.load();

  if (promoValue) {
    const promoUsedTimes = promoValue.uses || [];
    if (promoUsedTimes.length) {
      return null;
    }
    return promoValue;
  }

  return null;
}
