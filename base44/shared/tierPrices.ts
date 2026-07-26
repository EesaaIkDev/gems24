export const TIER_PRICE_IDS = {
  bronze: "price_1TxTG3E19rru8eURQEyAwT06",
  silver: "price_1TxTG3E19rru8eURawP9gqEu",
  gold: "price_1TxTG3E19rru8eURLRQ24Cwq",
  platinum: "price_1TxTG3E19rru8eURZJVdTZq5",
};

export const tierForPriceId = (priceId) =>
  Object.keys(TIER_PRICE_IDS).find((k) => TIER_PRICE_IDS[k] === priceId) || null;