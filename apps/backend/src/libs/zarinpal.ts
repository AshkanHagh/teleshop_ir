import ZarinPal from 'zarinpal-checkout';

export const zarinpal : ZarinPal.ZarinPalInstance = ZarinPal.create(process.env.ZARINPAL_MERCHANT_ID, true);