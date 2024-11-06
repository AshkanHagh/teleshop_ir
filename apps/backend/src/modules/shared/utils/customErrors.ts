import ErrorHandler from './errorHandler';

class ErrorFactory extends ErrorHandler {
    static ValidationError(message : string) {
        return new ErrorHandler(message, 400);
    }

    static RouteNowFoundError(message : string) {
        return new ErrorHandler(message, 404);
    }

    static BadRequestError(message : string = 'Bad request') {
        return new ErrorHandler(message, 400);
    }

    static ResourceNotFoundError(message : string = 'Resource not found') {
        return new ErrorHandler(message, 404);
    }

    static ClientSocketIdNotFoundError(message : string = 'No client with this socket found') {
        return new ErrorHandler(message, 404);
    }

    static SocketGroupNotFoundError(message : string = 'No group with user role found') {
        return new ErrorHandler(message, 404);
    }

    static TokenRefreshError(message : string = 'Could not refresh token') {
        return new ErrorHandler(message, 400);
    }

    static InitRequiredError(message : string = 'Please initialize your account to access this resource') {
        return new ErrorHandler(message, 401);
    }

    static AccessTokenInvalidError(message : string = 'Access token is not valid') {
        return new ErrorHandler(message, 401);
    }

    static InternalServerError(message : string = 'Internal server error') {
        return new ErrorHandler(message, 500);
    }
    
    static UnAuthorizedRoleError(role : string) {
        return new ErrorHandler(`Role  : ${role} is not allowed to access this resource`, 403);
    }

    static PaymentFailedError(invoiceId : string, failure_message : string | null) {
        return new ErrorHandler(`Payment failed for invoice ${invoiceId} : ${failure_message || 'Unknown reason'}. Please check the payment method and try again.`, 400);
    }

    static RequestTimedOutError() {
        return new ErrorHandler('Request timed out', 400);
    }
}

export default ErrorFactory;