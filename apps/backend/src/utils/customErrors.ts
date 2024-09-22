import ErrorHandler from '../middlewares/errorHandler';

export const createValidationError = (message : string) => {
    return new ErrorHandler(message, 400, 'An error occurred');
};

export const createRouteNotFoundError = (message : string) => {
    return new ErrorHandler(message, 404, 'An error occurred');
};

export const createBadRequestError = (message : string = 'Bad request') => {
    return new ErrorHandler(message, 400, 'An error occurred');
};

export const createForbiddenError = (message : string = 'Forbidden') => {
    return new ErrorHandler(message, 403, 'An error occurred');
};

export const createTokenRefreshError = (message : string = 'Could not refresh token') => {
    return new ErrorHandler(message, 400, 'An error occurred');
};

export const createInitializingRequiredError = (message : string = 'Initializing required') => {
    return new ErrorHandler(message, 401, 'An error occurred');
};

export const createAccessTokenInvalidError = (message : string = 'Access token is not valid') => {
    return new ErrorHandler(message, 401, 'An error occurred');
};

export const createInternalServerError = (message : string = 'Internal server error') => {
    return new ErrorHandler(message, 500, 'An error occurred');
};

export class ResourceNotFoundError extends ErrorHandler {
    constructor(message : string = 'Resource not found') {
        super(message, 404);
    }
}