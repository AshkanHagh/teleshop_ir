import { Hono } from 'hono';
import { every, some } from 'hono/combine';
import { authorizedRoles, isAuthenticated } from '../middlewares/authorization';
import { completeOrder, order, orderHistory, orders, ordersHistory } from '../controllers/dashbaord.controller';
import { validationMiddleware } from '../middlewares/validation';
import { ordersFilterByStatusSchema } from '../schemas/zod.schema';

const dashboardRouter = new Hono();

dashboardRouter.get('/admin', some(every(isAuthenticated, authorizedRoles('shopper'), validationMiddleware('query', 
    ordersFilterByStatusSchema
))), orders);

dashboardRouter.get('/admin/:orderId', some(every(isAuthenticated, authorizedRoles('shopper'))), order);

dashboardRouter.patch('/admin/:orderId', some(every(isAuthenticated, authorizedRoles('shopper'))), completeOrder);

dashboardRouter.get('/history', some(every(isAuthenticated, validationMiddleware('query', ordersFilterByStatusSchema))), ordersHistory);

dashboardRouter.get('/history/:orderId', isAuthenticated, orderHistory);

export default dashboardRouter;