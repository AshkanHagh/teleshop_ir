import Zarinpal from "zarinpal-checkout-v4";
import { env } from "@env";
import type { InitParams } from "zarinpal-checkout-v4/lib/types";

const initParams: InitParams = {
  merchantId: env.ZARINPAL_MERCHANT_ID,
  callbackURL: env.PAYMENT_REDIRECT_BASE_URL,
  sandbox: env.NODE_ENV === "development",
};
export const zarinpal = Zarinpal.CreateInstance(initParams);
