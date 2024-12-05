import ErrorHandler from "./errorHandler";

class ErrorFactory extends ErrorHandler {
    static ValidationError(developMessage: string) {
        return new ErrorHandler(400, "Parsing", developMessage, "Input validation failed");
    }

    static RouteNotFoundError(developMessage: string) {
        return new ErrorHandler(404, "Client", developMessage, "The requested route was not found");
    }

    static BadRequestError(developMessage: string) {
        return new ErrorHandler(400, "Client", developMessage, "The request could not be processed");
    }

    static ResourceNotFoundError(developMessage: string) {
        return new ErrorHandler(404, "Client", developMessage, "Requested resource not found");
    }

    static ClientSocketIdNotFoundError(developMessage: string) {
        return new ErrorHandler(404, "Client", developMessage, "No client socket ID found");
    }

    static SocketGroupNotFoundError(developMessage: string) {
        return new ErrorHandler(404, "Client", developMessage, "No matching socket group found");
    }

    static TokenRefreshError(developMessage: string) {
        return new ErrorHandler(400, "Client", developMessage, "Token refresh failed");
    }

    static AuthRequiredError(developMessage: string) {
        return new ErrorHandler(401, "Authentication", developMessage, "Authentication required");
    }

    static AccessTokenInvalidError(developMessage: string) {
        return new ErrorHandler(401, "Authentication", developMessage, "Invalid access token");
    }

    static InternalServerError(developMessage: string) {
        return new ErrorHandler(500, "Server", developMessage, "An internal server error occurred");
    }

    static UnAuthorizedRoleError(role: string) {
        const developMessage = `Role : ${role} is not allowed to access this resource`;
        return new ErrorHandler(403, "Authorization", developMessage, "Unauthorized role");
    }

    static PaymentFailedError(invoiceId: string, failureMessage: string | null) {
        const developMessage = `Payment failed for invoice ${invoiceId}: ${failureMessage || "Unknown reason"}`;
        return new ErrorHandler(400, "Payment", developMessage, "Payment failed. Please try again.");
    }

    static RequestTimedOutError(developMessage: string) {
        return new ErrorHandler(408, "Client", developMessage, "The request timed out");
    }
}

export default ErrorFactory;