import { Hono } from 'hono';
import { validationMiddleware } from '../middlewares/validation';
import { telegramInitHashData } from '../schemas/zod.schema';
import { validateAndInitializeUser, refreshToken } from '../controllers/auth.controller';

const authRouter = new Hono();

authRouter.post('/pol-barzakh', validationMiddleware('json', telegramInitHashData), validateAndInitializeUser);

authRouter.get('/refresh', refreshToken);

export default authRouter;