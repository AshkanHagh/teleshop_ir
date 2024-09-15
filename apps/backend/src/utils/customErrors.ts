import ErrorHandler from './errorHandler';

export const createValidationError = (message : string) => {
    return new ErrorHandler(message, 400);
};

export const createRouteNotFoundError = (message : string) => {
    return new ErrorHandler(message, 404);
};

export const createBadRequestError = (message : string = 'Bad request') => {
    return new ErrorHandler(message, 400);
};

export const createForbiddenError = (message : string = 'Forbidden') => {
    return new ErrorHandler(message, 403);
};

export const createTokenRefreshError = (message : string = 'Could not refresh token') => {
    return new ErrorHandler(message, 400);
};

export const createInitializingRequiredError = (message : string = 'Initializing required') => {
    return new ErrorHandler(message, 401);
};

export const createAccessTokenInvalidError = (message : string = 'Access token is not valid') => {
    return new ErrorHandler(message, 401);
};

export const createInternalServerError = (message : string = 'Internal server error') => {
    return new ErrorHandler(message, 500);
};