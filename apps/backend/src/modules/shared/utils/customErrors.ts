import { logger } from "@shared/libs/winston";
import ErrorHandler from "./errorHandler";

class ErrorFactory extends ErrorHandler {
  static ValidationError(developMessage: string) {
    logger.warn(developMessage);
    return new ErrorHandler("اعتبارسنجی ورودی انجام نشد", 400);
  }

  static RouteNotFoundError(developMessage: string) {
    logger.warn(developMessage);
    return new ErrorHandler("مسیر درخواست‌شده پیدا نشد", 404);
  }

  static BadRequestError(developMessage: string) {
    logger.warn(developMessage);
    return new ErrorHandler("درخواست قابل پردازش نیست", 400);
  }

  static ResourceNotFoundError(developMessage: string) {
    logger.warn(developMessage);
    return new ErrorHandler("منبع درخواست‌شده پیدا نشد", 404);
  }

  static ClientSocketIdNotFoundError(developMessage: string) {
    logger.warn(developMessage);
    return new ErrorHandler("آیدی سوکت کلاینت پیدا نشد", 404);
  }

  static SocketGroupNotFoundError(developMessage: string) {
    logger.warn(developMessage);
    return new ErrorHandler("گروه سوکت مشابه پیدا نشد", 404);
  }

  static TokenRefreshError(developMessage: string) {
    logger.warn(developMessage);
    return new ErrorHandler("بازنشانی توکن با شکست مواجه شد", 400);
  }

  static AuthRequiredError(developMessage: string) {
    logger.warn(developMessage);
    return new ErrorHandler("احراز هویت مورد نیاز است", 401);
  }

  static AccessTokenInvalidError(developMessage: string) {
    logger.warn(developMessage);
    return new ErrorHandler("توکن دسترسی نامعتبر است", 401);
  }

  static InternalServerError(developMessage: string) {
    logger.warn(developMessage);
    return new ErrorHandler("خطای داخلی سرور رخ داد", 500);
  }

  static UnAuthorizedRoleError(role: string) {
    const developMessage = `Role : ${role} is not allowed to access this resource`;
    logger.warn(developMessage);

    return new ErrorHandler("نقش غیرمجاز", 403);
  }

  static PaymentFailedError(invoiceId: string, failureMessage: string | null) {
    const developMessage = `Payment failed for invoice ${invoiceId}: ${failureMessage || "Unknown reason"}`;
    logger.warn(developMessage);

    return new ErrorHandler("پرداخت ناموفق بود. لطفاً دوباره تلاش کنید.", 400);
  }

  static RequestTimedOutError(developMessage: string) {
    logger.warn(developMessage);
    return new ErrorHandler("درخواست زمان‌تمام شد", 408);
  }
}

export default ErrorFactory;
