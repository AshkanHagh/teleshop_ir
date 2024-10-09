import Zarinpal from 'zarinpal-checkout-v4';
import { env } from '../../env';
import type { InitParams } from 'zarinpal-checkout-v4/lib/types';

const { NODE_ENV, PROD_ZARINPAL_MERCHANT_ID, LOCAL_ZARINPAL_MERCHANT_ID } = env;
const initParams : InitParams = {
    merchantId : NODE_ENV === 'production' ? PROD_ZARINPAL_MERCHANT_ID : LOCAL_ZARINPAL_MERCHANT_ID,
    callbackURL : env.PAYMENT_REDIRECT_BASE_URL,
    sandbox : NODE_ENV === 'development',
}
export const zarinpal = Zarinpal.CreateInstance(initParams);