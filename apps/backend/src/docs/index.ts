import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import { landingPageResponseSchema, polBarzakhResponseSchema, refreshTokenResponseSchema, servicesResponseSchema } from '../schemas/response.schema';
import { authorizationSchema, initializingUserSchema, serviceFilterSchema } from '../schemas/zod.schema';

const app = new OpenAPIHono();

const polBarzakhDoc = createRoute({
    method : 'post',
    path : '/api/auth/pol-barzakh',
    summary : 'Validate Telegram User Data',
    description : 'This endpoint validates the initialization data received from Telegram for user authentication.',
    tags : ['auth'],
    request : {
        body : {
            content : {
                'application/json' : {
                    schema : initializingUserSchema
                }
            }
        }
    },
    responses : {
        200 : {
            description : 'User Telegram data validated successfully',
            content : {
                'application/json' : {
                    schema : polBarzakhResponseSchema
                }
            }
        }
    }
});

const refreshTokenDoc = createRoute({
    method : 'get',
    path : '/api/auth/refresh',
    summary : 'Refresh Access Token',
    description : 'Provides a new access token using the refresh token. This is typically called when the access token has expired.',
    tags : ['auth'],
    responses : {
        200 : {
            description : 'New access token generated',
            content : {
                'application/json' : {
                    schema : refreshTokenResponseSchema
                }
            }
        }
    }
});

const landingPageDoc = createRoute({
    method : 'get',
    path : '/api/services/landing',
    summary : 'Retrieve Landing Page Services',
    description : 'Fetches information about the available services displayed on the landing page. Requires authorization.',
    tags : ['services'],
    request : {
        headers : authorizationSchema
    },
    responses : {
        200 : {
            description : 'Landing page services retrieved successfully',
            content : {
                'application/json' : {
                    schema : landingPageResponseSchema
                }
            }
        }
    }
});

const servicesDoc = createRoute({
    method : 'get',
    path : '/api/services/',
    summary : 'Retrieve Filtered Services',
    description : 'Fetches services based on provided query parameters like category or type. Requires authorization.',
    tags : ['services'],
    request : {
        headers : authorizationSchema,
        query : serviceFilterSchema
    },
    responses : {
        200 : {
            description : 'Filtered services retrieved successfully',
            content : {
                'application/json' : {
                    schema : servicesResponseSchema
                }
            }
        }
    }
});

// @ts-expect-error
app.openapi(polBarzakhDoc, polBarzakhResponseSchema);
// @ts-expect-error
app.openapi(refreshTokenDoc, refreshTokenResponseSchema);
// @ts-expect-error
app.openapi(landingPageDoc, landingPageResponseSchema);
// @ts-expect-error
app.openapi(servicesDoc, servicesResponseSchema);

app.get('/ui', swaggerUI({url : '/doc'}));

app.doc31('/doc', {
    info : { title : 'Teleshop API', version : 'v1' }, openapi : '3.1.0'
});

export default app;