import { Hono } from 'hono';
import { validationMiddleware } from '../middlewares/validation';
import { initializingUserSchema } from '../schemas/zod.schema';
import { validateAndInitializeUser, refreshToken } from '../controllers/auth.controller';

const authRouter = new Hono();

authRouter.post('/pol-barzakh', validationMiddleware('json', initializingUserSchema), validateAndInitializeUser);

authRouter.get('/refresh', refreshToken);

export default authRouter;